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

            Log::info('Step 1: Init Midtrans Config with Key: ' . substr($serverKey, 0, 7) . '...');
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            Log::info('Step 2: Prepare Params');
            $params = [
                'transaction_details' => [
                    'order_id' => 'TEST-' . time(),
                    'gross_amount' => 10000,
                ],
            ];

            Log::info('Step 3: Get Snap Token');
            // Menghasilkan Snap Token dari Midtrans
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            
            Log::info('Step 4: Success! Token: ' . $snapToken);

            return response()->json([
                'token' => $snapToken,
                'snap_token' => $snapToken,
                'order_id' => 'TEST-' . time()
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