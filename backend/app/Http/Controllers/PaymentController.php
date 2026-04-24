<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;
use Midtrans\Config;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:1',
            'alamat_pengiriman' => 'required',
            'seller_id' => 'required'
        ]);

        Config::$serverKey = config('services.midtrans.server_key');
        Config::$clientKey = config('services.midtrans.client_key');
        Config::$isProduction = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);

        Config::$isSanitized = true;
        Config::$is3ds = true;

        $grossAmount = (int) $request->price;
        $orderId = 'TRX-' . time() . '-' . rand(1000, 9999);
        $user = \Illuminate\Support\Facades\Auth::user();

        // 2. SIMPAN KE DATABASE
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($orderId, $request, $grossAmount, $user) {
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

            // --- JIKA SAMPAI SINI BERARTI DATABASE AMAN ---
            die("LOG: DATABASE SUDAH TERSIMPAN (Masalah mungkin ada di Snap Token)");

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

            $snapToken = Snap::getSnapToken($params);
            return response()->json(['token' => $snapToken, 'order_id' => $orderId]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);

        try {
            $notif = new \Midtrans\Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid Notification Data'], 400);
        }

        $transaction = $notif->transaction_status;
        $order_id = $notif->order_id;
        $status_code = $notif->status_code;
        $gross_amount = $notif->gross_amount;
        $server_key = config('services.midtrans.server_key');

        $signature = hash("sha512", $order_id . $status_code . $gross_amount . $server_key);
        if ($signature !== $notif->signature_key) {
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        $localTransaction = \App\Models\Transaction::where('order_id', $order_id)->first();

        if (!$localTransaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        if ($localTransaction->status === 'success') {
            return response()->json(['message' => 'Transaction already processed']);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($transaction, $localTransaction) {
                if ($transaction == 'settlement' || $transaction == 'capture') {
                    $localTransaction->update(['status' => 'success']);
                    \App\Models\Product::where('id', $localTransaction->product_id)->update([
                        'status' => 'sold',
                        'stock' => 0
                    ]);
                } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                    $localTransaction->update(['status' => 'failed']);
                }
            });

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}