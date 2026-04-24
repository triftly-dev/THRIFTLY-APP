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
            Log::info('--- MEMULAI PEMBAYARAN ---');

            // Cek apakah class Midtrans ada
            if (!class_exists('\Midtrans\Config')) {
                throw new Exception('Library Midtrans tidak ditemukan. Jalankan "composer require midtrans/midtrans-php"');
            }

            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $product = Product::find($request->product_id);
            if (!$product) {
                return response()->json(['message' => 'Produk tidak ditemukan'], 404);
            }

            $userId = Auth::id() ?: 1; // Default ke 1 jika tidak login untuk testing

            return DB::transaction(function () use ($product, $userId, $request) {
                $transaction = Transaction::create([
                    'order_id' => 'TRX-' . time() . '-' . $userId,
                    'buyer_id' => $userId,
                    'seller_id' => $product->user_id,
                    'product_id' => $product->id,
                    'harga_final' => (int)$request->amount,
                    'ongkir' => 0,
                    'status' => 'pending',
                    'payment_method' => 'midtrans',
                    'alamat_pengiriman' => 'Alamat Testing' // Beri default agar tidak error database
                ]);

                $params = [
                    'transaction_details' => [
                        'order_id' => $transaction->order_id,
                        'gross_amount' => (int)$request->amount,
                    ],
                    'customer_details' => [
                        'first_name' => Auth::check() ? Auth::user()->name : 'Guest',
                        'email' => Auth::check() ? Auth::user()->email : 'guest@example.com',
                    ],
                ];

                $snapToken = \Midtrans\Snap::getSnapToken($params);

                $transaction->update(['snap_token' => $snapToken]);

                return response()->json([
                    'snap_token' => $snapToken,
                    'order_id' => $transaction->order_id
                ]);
            });

        } catch (Exception $e) {
            Log::error('CRITICAL ERROR PAYMENT: ' . $e->getMessage());
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