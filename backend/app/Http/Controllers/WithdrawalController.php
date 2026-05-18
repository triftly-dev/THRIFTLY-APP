<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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

        // 2. LOG / NOTIFIKASI KE SISTEM MIDTRANS (Simulasi Payout/Disbursement)
        Log::info("MIDTRANS DISBURSEMENT NOTIFICATION: Saldo withdrawal diajukan untuk User: {$user->name} ({$user->email}). Nominal: Rp " . number_format($request->amount, 0, ',', '.') . ". Rekening: {$withdrawal->bank_name} - {$withdrawal->account_number} a.n {$withdrawal->account_holder}. Status Midtrans: REQUESTED.");

        // 3. KIRIM EMAIL NOTIFIKASI KE USER
        try {
            Mail::to($user->email)->send(new \App\Mail\WithdrawalRequested($withdrawal, $user));
        } catch (\Exception $e) {
            Log::error("Gagal mengirim email penarikan saldo: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Pengajuan penarikan saldo berhasil dikirim! Silakan periksa email Anda.',
            'withdrawal' => $withdrawal,
            'current_balance' => $user->fresh()->saldo // Berikan saldo terbaru
        ], 201);
    }
}
