<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;
use Midtrans\Config;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        // 1. Validasi Input agar Aman
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:1',
            'alamat_pengiriman' => 'required',
            'seller_id' => 'required'
        ]);

        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $grossAmount = (int) $request->price;
        $orderId = 'TRX-' . time() . '-' . rand(1000, 9999);

        // Ambil data user dengan aman
        $user = \Illuminate\Support\Facades\Auth::user();

        // 2. SIMPAN KE DATABASE (Pake Transaction agar Aman)
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

            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $grossAmount,
                ],
                'customer_details' => [
                    'first_name' => $user->name ?? 'Guest',
                    'email' => $user->email ?? 'guest@example.com',
                ],
                'item_details' => [
                    [
                        'id' => $request->product_id,
                        'price' => $grossAmount,
                        'quantity' => 1,
                        'name' => $request->product_name ?? 'Barang Secondnesia',
                    ]
                ]
            ];

            $snapToken = Snap::getSnapToken($params);
            return response()->json(['token' => $snapToken, 'order_id' => $orderId]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);

        try {
            $notif = new \Midtrans\Notification();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid Notification Data'], 400);
        }

        $transaction = $notif->transaction_status;
        $order_id = $notif->order_id;
        $status_code = $notif->status_code;
        $gross_amount = $notif->gross_amount;
        $server_key = env('MIDTRANS_SERVER_KEY');

        // 1. VALIDASI SIGNATURE
        $signature = hash("sha512", $order_id . $status_code . $gross_amount . $server_key);
        if ($signature !== $notif->signature_key) {
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        // 2. CARI TRANSAKSI
        $localTransaction = \App\Models\Transaction::where('order_id', $order_id)->first();

        if (!$localTransaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // 3. GUARD: CEK APAKAH SUDAH PERNAH DIPROSES (Mencegah Double Update)
        if ($localTransaction->status === 'success') {
            return response()->json(['message' => 'Transaction already processed']);
        }

        // 4. ATOMIC UPDATE (Pakai DB Transaction)
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($transaction, $localTransaction, $order_id) {
                if ($transaction == 'settlement' || $transaction == 'capture') {
                    
                    // Update Status Transaksi
                    $localTransaction->update(['status' => 'success']);

                    // Update Produk
                    \App\Models\Product::where('id', $localTransaction->product_id)->update([
                        'status' => 'sold',
                        'stock' => 0
                    ]);

                    \Illuminate\Support\Facades\Log::info("Payment Success Atomic: " . $order_id);

                } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                    $localTransaction->update(['status' => 'failed']);
                }
            });

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Webhook Error: " . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}