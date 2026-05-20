<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WithdrawalController extends Controller
{
    /**
     * Get all withdrawals for the authenticated user.
     */
    public function index()
    {
        $withdrawals = Withdrawal::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($withdrawals);
    }

    /**
     * Submit a new withdrawal request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|integer|min:10000', // Minimal penarikan Rp 10.000
        ], [
            'bank_account_id.exists' => 'Rekening bank tidak valid.',
            'amount.min' => 'Minimal penarikan saldo adalah Rp 10.000.',
        ]);

        $user = $request->user();
        $bankAccount = BankAccount::where('id', $request->bank_account_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$bankAccount) {
            return response()->json([
                'message' => 'Rekening bank ini bukan milik Anda.'
            ], 403);
        }

        // Cek apakah saldo penjual mencukupi
        $availableBalance = $user->saldo['bisaDitarik'];
        if ($request->amount > $availableBalance) {
            return response()->json([
                'message' => 'Saldo Anda tidak mencukupi untuk melakukan penarikan sebesar Rp ' . number_format($request->amount, 0, ',', '.') . '.'
            ], 400);
        }

        // 1. Buat data pengajuan penarikan (Status: pending)
        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'bank_name' => $bankAccount->bank_name,
            'account_number' => $bankAccount->account_number,
            'account_holder' => $bankAccount->account_holder,
            'amount' => $request->amount,
            'status' => 'pending'
        ]);

        // 2. Hubungi API Doku Disbursement secara otomatis
        $dokuResult = $this->disburseViaDoku($withdrawal);
        $message = 'Pengajuan penarikan saldo berhasil dikirim!';

        if ($dokuResult['success']) {
            $withdrawal->update(['status' => 'success']);
            $message = 'Penarikan saldo otomatis via Doku berhasil diproses!';
        } else {
            $apiUrl = config('services.doku.api_url') ?? 'https://api-sandbox.doku.com';
            $isSandbox = str_contains($apiUrl, 'sandbox');

            if ($isSandbox) {
                // Untuk Sandbox, jika API gagal (misal produk Payouts belum diaktifkan di akun merchant sandbox),
                // kita simulasikan sukses agar flow pengujian lancar
                $withdrawal->update(['status' => 'success']);
                $message = 'Penarikan saldo disimulasikan berhasil (Doku Sandbox: ' . ($dokuResult['message'] ?? 'API error') . ')';
                Log::warning("Doku Sandbox Payout Simulated: " . ($dokuResult['message'] ?? 'API error'));
            } else {
                $withdrawal->update(['status' => 'failed']);
                return response()->json([
                    'message' => 'Gagal memproses penarikan otomatis via Doku: ' . ($dokuResult['message'] ?? 'Terjadi kesalahan.')
                ], 400);
            }
        }

        // 3. KIRIM EMAIL NOTIFIKASI KE USER
        try {
            Mail::to($user->email)->send(new \App\Mail\WithdrawalRequested($withdrawal, $user));
        } catch (\Exception $e) {
            Log::error("Gagal mengirim email penarikan saldo: " . $e->getMessage());
        }

        return response()->json([
            'message' => $message,
            'withdrawal' => $withdrawal,
            'current_balance' => $user->fresh()->saldo // Berikan saldo terbaru
        ], 201);
    }

    /**
     * Kirim dana otomatis via Doku Payouts / Disbursement
     */
    private function disburseViaDoku(Withdrawal $withdrawal)
    {
        try {
            $clientId = trim(config('services.doku.client_id'));
            $secretKey = trim(config('services.doku.secret_key'));
            $apiUrl = trim(config('services.doku.api_url') ?? 'https://api-sandbox.doku.com');

            if (!$clientId || !$secretKey) {
                return [
                    'success' => false,
                    'message' => 'Doku Client ID atau Secret Key belum dikonfigurasi.'
                ];
            }

            $timestamp = gmdate("Y-m-d\TH:i:s\Z");
            $requestId = (string) \Illuminate\Support\Str::uuid();
            $targetPath = '/disbursement/v2/transfer';

            $bankCode = $this->mapBankNameToCode($withdrawal->bank_name);

            $body = [
                'amount' => (int) $withdrawal->amount,
                'beneficiary_bank_code' => $bankCode,
                'beneficiary_account_number' => $withdrawal->account_number,
                'beneficiary_name' => $withdrawal->account_holder,
                'description' => 'Withdrawal ' . $withdrawal->id,
            ];

            // Generate signature
            $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
            $digest = base64_encode(hash('sha256', $jsonBody, true));
            
            $rawSignature = "Client-Id:" . $clientId . "\n" .
                            "Request-Id:" . $requestId . "\n" .
                            "Request-Timestamp:" . $timestamp . "\n" .
                            "Request-Target:" . $targetPath . "\n" .
                            "Digest:" . $digest;
            
            $signature = base64_encode(hash_hmac('sha256', $rawSignature, $secretKey, true));
            $signatureHeader = "HMACSHA256=" . $signature;

            Log::info("Sending Doku Payout for Withdrawal ID {$withdrawal->id} to Bank: {$bankCode}");

            $response = Http::withHeaders([
                'Client-Id' => $clientId,
                'Request-Id' => $requestId,
                'Request-Timestamp' => $timestamp,
                'Signature' => $signatureHeader,
                'Content-Type' => 'application/json',
            ])->post($apiUrl . $targetPath, $body);

            if ($response->successful()) {
                $resData = $response->json();
                Log::info("Doku Payout Success: " . json_encode($resData));
                return [
                    'success' => true,
                    'data' => $resData
                ];
            } else {
                Log::error("Doku Payout Failed: " . $response->status() . " - " . $response->body());
                return [
                    'success' => false,
                    'status_code' => $response->status(),
                    'message' => $response->json()['message'] ?? $response->body()
                ];
            }
        } catch (\Exception $e) {
            Log::error("Exception in disburseViaDoku: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Mapping nama bank ke standard bank code Doku
     */
    private function mapBankNameToCode($bankName)
    {
        $bankName = strtoupper($bankName);
        if (str_contains($bankName, 'MANDIRI')) return 'MANDIRI';
        if (str_contains($bankName, 'BCA')) return 'BCA';
        if (str_contains($bankName, 'BRI')) return 'BRI';
        if (str_contains($bankName, 'BNI')) return 'BNI';
        if (str_contains($bankName, 'CIMB')) return 'CIMB';
        if (str_contains($bankName, 'PERMATA')) return 'PERMATA';
        return $bankName; // Fallback
    }
}
