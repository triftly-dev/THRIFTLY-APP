<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        try {
            $serverKey = trim(config('services.midtrans.server_key'));
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // 1. Simpan Transaksi ke Database dulu (PENTING!)
            $orderId = 'ORDER-' . time() . '-' . ($request->product_id ?? '1');
            
            $transaction = Transaction::create([
                'order_id' => $orderId,
                'product_id' => $request->product_id,
                'buyer_id' => Auth::id(),
                'seller_id' => $request->seller_id,
                'harga_final' => $request->price ?? 10000,
                'ongkir' => $request->ongkir ?? 0,
                'status' => 'pending', // Status awal
                'alamat_pengiriman' => $request->alamat_pengiriman ?? '-',
            ]);

            // 2. Siapkan parameter Midtrans
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) ($request->price ?? 10000),
                ],
                'customer_details' => [
                    'first_name' => Auth::user()->name ?? 'Customer',
                    'email' => Auth::user()->email ?? 'customer@example.com',
                ],
                // Atur Redirect agar kembali ke website Anda
                'callbacks' => [
                    'finish' => 'http://localhost:5173/buyer/orders', // Untuk tes lokal
                ]
            ];

            // Menghasilkan Snap Token
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            
            // Simpan Snap Token ke database (Opsional tapi berguna untuk bayar nanti)
            $transaction->update(['snap_token' => $snapToken]);

            return response()->json([
                'token' => $snapToken,
                'snap_token' => $snapToken,
                'order_id' => $orderId
            ]);

        } catch (Exception $e) {
            Log::error('DEBUG ERROR: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memproses pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        Log::info('Midtrans Webhook', $request->all());
        return response()->json(['status' => 'ok']);
    }
}