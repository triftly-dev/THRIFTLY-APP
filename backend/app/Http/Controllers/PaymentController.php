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
            
            if (!$serverKey) {
                throw new Exception('MIDTRANS_SERVER_KEY tidak ditemukan di file .env');
            }

            Log::info('Step 1: Init Midtrans Config with Key: ' . substr($serverKey, 0, 7) . '...' . substr($serverKey, -4) . ' Length: ' . strlen($serverKey));
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $params = [
                'transaction_details' => [
                    'order_id' => 'ORDER-' . time() . '-' . ($request->product_id ?? 'UNK'),
                    'gross_amount' => (int) ($request->total_amount ?? 10000),
                ],
                'customer_details' => [
                    'first_name' => Auth::user()->name ?? 'Customer',
                    'email' => Auth::user()->email ?? 'customer@example.com',
                ],
            ];

            // Menghasilkan Snap Token
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            
            return response()->json([
                'token' => $snapToken,
                'snap_token' => $snapToken,
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