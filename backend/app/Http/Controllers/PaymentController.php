<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function createPayment(Request $request)
    {
        try {
            Log::info('--- PROSES PAYMENT DIMULAI ---', $request->all());

            $product = Product::find($request->product_id);
            if (!$product) {
                Log::error('Produk tidak ditemukan ID: ' . $request->product_id);
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Gunakan ID user 1 jika tidak login (untuk testing) atau ambil dari auth
            $userId = Auth::check() ? Auth::id() : 1;

            return DB::transaction(function () use ($product, $userId, $request) {
                // 1. Buat record transaksi
                $transaction = Transaction::create([
                    'order_id' => 'TRX-' . time() . '-' . $userId,
                    'buyer_id' => $userId,
                    'seller_id' => $product->user_id, // Ambil pemilik produk
                    'product_id' => $product->id,
                    'harga_final' => $request->amount,
                    'ongkir' => 0,
                    'status' => 'pending',
                    'payment_method' => 'midtrans'
                ]);

                Log::info('Transaction Created: ' . $transaction->order_id);

                // 2. Siapkan Parameter Midtrans
                $params = [
                    'transaction_details' => [
                        'order_id' => $transaction->order_id,
                        'gross_amount' => (int)$request->amount,
                    ],
                    'customer_details' => [
                        'first_name' => Auth::check() ? Auth::user()->name : 'Guest User',
                        'email' => Auth::check() ? Auth::user()->email : 'guest@example.com',
                    ],
                    'item_details' => [
                        [
                            'id' => $product->id,
                            'price' => (int)$request->amount,
                            'quantity' => 1,
                            'name' => substr($product->name, 0, 50),
                        ]
                    ]
                ];

                Log::info('Calling Midtrans Snap...');
                
                $snapToken = Snap::getSnapToken($params);
                
                Log::info('Snap Token Received: ' . $snapToken);

                $transaction->snap_token = $snapToken;
                $transaction->save();

                return response()->json([
                    'snap_token' => $snapToken,
                    'order_id' => $transaction->order_id
                ]);
            });

        } catch (Exception $e) {
            Log::error('MIDTRANS ERROR: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Payment initiation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        Log::info('Midtrans Notification received', $request->all());
        // Logika verifikasi status transaksi disini...
        return response()->json(['status' => 'ok']);
    }
}