<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;
use Midtrans\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        Log::info("--- START CREATE PAYMENT ---");
        
        try {
            // 1. Validasi Input
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'price' => 'required|numeric|min:1',
                'alamat_pengiriman' => 'required',
                'seller_id' => 'required'
            ]);
            Log::info("Validation Success");

            // 2. Load Config
            Config::$serverKey = config('services.midtrans.server_key');
            Config::$clientKey = config('services.midtrans.client_key');
            Config::$isProduction = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);
            Config::$isSanitized = true;
            Config::$is3ds = true;
            
            Log::info("Midtrans Config Loaded. Key: " . substr(Config::$serverKey, 0, 5) . "...");

            $grossAmount = (int) $request->price;
            $orderId = 'TRX-' . time() . '-' . rand(1000, 9999);
            $user = Auth::user();
            Log::info("Order ID: " . $orderId . " for User ID: " . ($user->id ?? 'Guest'));

            // 3. Simpan Database
            DB::transaction(function () use ($orderId, $request, $grossAmount, $user) {
                \App\Models\Transaction::create([
                    'order_id' => $orderId,
                    'product_id' => $request->product_id,
                    'buyer_id' => $user->id ?? 1,
                    'seller_id' => $request->seller_id,
                    'harga_final' => $grossAmount,
                    'ongkir' => $request->ongkir ?? 0,
                    'status' => 'pending',
                    'alamat_pengiriman' => $request->alamat_pengiriman
                ]);
            });
            Log::info("Database Transaction Success");

            // 4. Panggil Midtrans Snap
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $grossAmount,
                ],
                'customer_details' => [
                    'first_name' => $user->name ?? 'Guest',
                    'email' => $user->email ?? 'guest@example.com',
                ],
            ];
            
            Log::info("Requesting Snap Token...");
            $snapToken = Snap::getSnapToken($params);
            Log::info("Snap Token Obtained: " . $snapToken);

            return response()->json([
                'token' => $snapToken, 
                'order_id' => $orderId
            ]);

        } catch (\Exception $e) {
            Log::error("PAYMENT ERROR: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);

        try {
            $notif = new \Midtrans\Notification();
            $transaction = $notif->transaction_status;
            $order_id = $notif->order_id;
            
            Log::info("Webhook Received: " . $order_id . " Status: " . $transaction);

            $localTransaction = \App\Models\Transaction::where('order_id', $order_id)->first();
            if ($localTransaction) {
                DB::transaction(function () use ($transaction, $localTransaction) {
                    if ($transaction == 'settlement' || $transaction == 'capture') {
                        $localTransaction->update(['status' => 'success']);
                        \App\Models\Product::where('id', $localTransaction->product_id)->update(['status' => 'sold']);
                    } else if (in_array($transaction, ['deny', 'expire', 'cancel'])) {
                        $localTransaction->update(['status' => 'failed']);
                    }
                });
            }
            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error("Webhook Error: " . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }
}