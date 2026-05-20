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
    public function index()
    {
        // Ambil pesanan saya sebagai pembeli dengan pagination
        $transactions = Transaction::with('product')
            ->where('buyer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        try {
            // 1. Buat Order ID unik untuk transaksi manual
            $orderId = 'MANUAL-' . time() . '-' . ($request->product_id ?? '0');

            // 2. Simpan Transaksi ke Database
            $transaction = Transaction::create([
                'order_id' => $orderId,
                'product_id' => $request->product_id,
                'buyer_id' => Auth::id(),
                'seller_id' => $request->seller_id,
                'harga_final' => $request->price ?? $request->harga_final ?? 0,
                'status' => 'pending', // Default status
                'payment_type' => 'manual_transfer',
                'alamat_pengiriman' => $request->alamat_pengiriman ?? '-',
            ]);

            // 3. (Opsional) Ubah status produk menjadi terjual
            $product = Product::find($request->product_id);
            if ($product) {
                $product->status = 'sold';
                $product->stock = 0; // Set stok ke 0 untuk transaksi manual
                $product->timestamps = false; 
                $product->save();
                \Illuminate\Support\Facades\Cache::forget('approved_products_limit_24');
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi manual berhasil dibuat',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sellerOrders()
    {
        // Ambil pesanan yang masuk ke toko saya sebagai penjual
        $transactions = Transaction::with(['product', 'buyer'])
            ->where('seller_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    public function updateStatus(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $transaction->update([
            'status' => $request->status,
            'video_packing' => $request->video_packing ?? $transaction->video_packing,
            'video_unboxing' => $request->video_unboxing ?? $transaction->video_unboxing,
        ]);

        return response()->json($transaction);
    }

    /**
     * SNAP API: Menggunakan Popup Midtrans.
     */
    public function createPayment(Request $request)
    {
        // Jika DOKU dikonfigurasi, gunakan DOKU
        if (config('services.doku.client_id') && config('services.doku.secret_key')) {
            try {
                $clientId = config('services.doku.client_id');
                $apiUrl = config('services.doku.api_url');
                
                $orderId = 'TRF-' . time() . '-' . ($request->product_id ?? '1');
                $timestamp = gmdate("Y-m-d\TH:i:s\Z");
                $requestId = (string) \Illuminate\Support\Str::uuid();
                $targetPath = '/checkout/v1/payment';
                
                // Buat Transaksi di Database
                $transaction = Transaction::create([
                    'order_id' => $orderId,
                    'product_id' => $request->product_id,
                    'buyer_id' => Auth::id(),
                    'seller_id' => $request->seller_id,
                    'harga_final' => $request->price ?? 10000,
                    'ongkir' => $request->ongkir ?? 0,
                    'status' => 'pending',
                    'alamat_pengiriman' => $request->alamat_pengiriman ?? '-',
                ]);
                
                $frontendUrl = env('FRONTEND_URL') ?? 'https://thriftly-app-frontend.vercel.app';
                
                $body = [
                    "order" => [
                        "amount" => (int) ($request->price ?? 10000),
                        "invoice_number" => $orderId,
                        "callback_url" => $frontendUrl . "/payment/success/" . $orderId,
                        "auto_redirect" => true
                    ],
                    "payment" => [
                        "payment_due_date" => 60
                    ]
                ];
                
                $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
                $signature = $this->generateDokuSignature($body, $requestId, $timestamp, $targetPath);
                
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'Client-Id' => $clientId,
                    'Request-Id' => $requestId,
                    'Request-Timestamp' => $timestamp,
                    'Signature' => $signature,
                    'Content-Type' => 'application/json'
                ])->withBody($jsonBody, 'application/json')->post($apiUrl . $targetPath);
                
                if ($response->successful()) {
                    $resData = $response->json();
                    $paymentUrl = $resData['response']['payment']['url'] ?? null;
                    
                    if ($paymentUrl) {
                        $transaction->update(['snap_token' => $paymentUrl]);
                        
                        return response()->json([
                            'doku' => true,
                            'payment_url' => $paymentUrl,
                            'order_id' => $orderId
                        ]);
                    }
                }
                
                Log::error('DOKU API ERROR RESPONSE: ' . $response->body());
                return response()->json([
                    'message' => 'Gagal memproses pembayaran Doku',
                    'error' => $response->body()
                ], 500);
                
            } catch (Exception $e) {
                Log::error('DOKU ERROR: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Gagal memproses pembayaran Doku',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        // Fallback ke Midtrans jika DOKU tidak dikonfigurasi
        try {
            $serverKey = trim(config('services.midtrans.server_key'));
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $orderId = 'ORDER-' . time() . '-' . ($request->product_id ?? '1');
            
            $transaction = Transaction::create([
                'order_id' => $orderId,
                'product_id' => $request->product_id,
                'buyer_id' => Auth::id(),
                'seller_id' => $request->seller_id,
                'harga_final' => $request->price ?? 10000,
                'ongkir' => $request->ongkir ?? 0,
                'status' => 'pending',
                'alamat_pengiriman' => $request->alamat_pengiriman ?? '-',
            ]);

            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) ($request->price ?? 10000),
                ],
                'customer_details' => [
                    'first_name' => Auth::user()->name ?? 'Customer',
                    'email' => Auth::user()->email ?? 'customer@example.com',
                ],
                'callbacks' => [
                    'finish' => config('app.frontend_url') . '/buyer/orders',
                ]
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($params);
            $transaction->update(['snap_token' => $snapToken]);

            return response()->json([
                'token' => $snapToken,
                'snap_token' => $snapToken,
                'order_id' => $orderId
            ]);

        } catch (Exception $e) {
            Log::error('SNAP ERROR: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memproses pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CORE API: Direct Charge (Custom UI seperti Tokopedia).
     */
    public function charge(Request $request)
    {
        try {
            $serverKey = trim(config('services.midtrans.server_key'));
            
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = (bool) config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $orderId = 'ORDER-' . time() . '-' . ($request->product_id ?? '1');
            $grossAmount = (int) ($request->price ?? 10000);

            $bank = $request->bank ?? 'bca';
            $paymentType = ($bank === 'gopay') ? 'gopay' : 'bank_transfer';

            $params = [
                'payment_type' => $paymentType,
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $grossAmount,
                ],
                'customer_details' => [
                    'first_name' => Auth::user()->name ?? 'Customer',
                    'email' => Auth::user()->email ?? 'customer@example.com',
                ],
            ];

            if ($paymentType === 'bank_transfer') {
                $params['bank_transfer'] = [
                    'bank' => $bank,
                ];
            }

            $response = \Midtrans\CoreApi::charge($params);

            // Ambil nomor VA dari berbagai kemungkinan field Midtrans
            $vaNumber = null;
            if (isset($response->va_numbers[0]->va_number)) {
                $vaNumber = $response->va_numbers[0]->va_number;
            } elseif (isset($response->bill_key)) {
                $vaNumber = $response->bill_key; // Untuk Mandiri
            } elseif (isset($response->permata_va_number)) {
                $vaNumber = $response->permata_va_number;
            } elseif (isset($response->payment_code)) {
                $vaNumber = $response->payment_code; // Untuk Indomaret/Alfamart
            }

            $transaction = Transaction::create([
                'order_id' => $orderId,
                'product_id' => $request->product_id,
                'buyer_id' => Auth::id(),
                'seller_id' => $request->seller_id,
                'harga_final' => $grossAmount,
                'status' => 'pending',
                'payment_type' => $response->payment_type ?? 'bank_transfer',
                'bank' => $request->bank ?? 'bca',
                'va_number' => $vaNumber,
                'expiry_time' => $response->expiry_time ?? null,
                'pdf_url' => $response->pdf_url ?? null,
            ]);

            return response()->json([
                'success' => true,
                'data' => $transaction,
                'midtrans_response' => $response
            ]);

        } catch (Exception $e) {
            Log::error('CHARGE ERROR: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses charge pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        // 1. Cek jika request kosong (untuk tombol 'Tes' di Dashboard Midtrans)
        if (!$request->all()) {
            return response()->json(['message' => 'Notification endpoint is reachable'], 200);
        }

        try {
            $serverKey = trim(config('services.midtrans.server_key'));
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = (bool) config('services.midtrans.is_production');

            // 2. Ambil notifikasi dari Midtrans
            $notif = new \Midtrans\Notification();

            $transaction = $notif->transaction_status;
            $type = $notif->payment_type;
            $orderId = $notif->order_id;
            $fraud = $notif->fraud_status;

            Log::info("Midtrans Notification Received: OrderID: {$orderId}, Status: {$transaction}");

            $localTransaction = Transaction::where('order_id', $orderId)->first();

            if (!$localTransaction) {
                return response()->json(['message' => 'Transaksi tidak ditemukan'], 200); // Tetap 200 agar Midtrans tidak kirim ulang
            }

            // 3. Update Status Transaksi
            if ($transaction == 'capture') {
                if ($type == 'credit_card') {
                    if ($fraud == 'challenge') {
                        $localTransaction->update(['status' => 'pending']);
                    } else {
                        $localTransaction->update(['status' => 'settlement']);
                        $this->markProductAsSold($localTransaction->product_id);
                    }
                }
            } else if ($transaction == 'settlement') {
                $localTransaction->update(['status' => 'settlement']);
                $this->markProductAsSold($localTransaction->product_id);
            } else if ($transaction == 'pending') {
                $localTransaction->update(['status' => 'pending']);
            } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                $localTransaction->update(['status' => $transaction]);
            }

            return response()->json(['message' => 'Notification processed successfully'], 200);

        } catch (Exception $e) {
            Log::error('MIDTRANS CALLBACK ERROR: ' . $e->getMessage());
            // Berikan 200 OK meskipun error agar Midtrans berhenti mencoba (mencegah beban server)
            // Namun log tetap kita simpan untuk debug
            return response()->json(['message' => 'Error processed', 'error' => $e->getMessage()], 200);
        }
    }

    public function adminTransactions()
    {
        $transactions = Transaction::with(['product', 'buyer', 'seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json($transactions);
    }

    /**
     * Helper untuk menandai produk sebagai terjual
     */
    private function markProductAsSold($productId)
    {
        try {
            $product = Product::find($productId);
            if ($product) {
                $product->status = 'sold';
                $product->stock = 0; // Pastikan stok jadi 0 agar pindah ke tab Tidak Aktif
                $product->timestamps = false;
                $product->save();
                
                // BERSIHKAN CACHE agar pembeli langsung melihat status STOK HABIS
                \Illuminate\Support\Facades\Cache::forget('approved_products_limit_24');
                
                Log::info("Produk ID {$productId} berhasil ditandai sebagai SOLD melalui Midtrans.");
            }
        } catch (Exception $e) {
            Log::error("Gagal menandai produk ID {$productId} sebagai SOLD: " . $e->getMessage());
        }
    }

    /**
     * Doku Signature Generator
     */
    private function generateDokuSignature($body, $requestId, $timestamp, $targetPath)
    {
        $clientId = config('services.doku.client_id');
        $secretKey = config('services.doku.secret_key');
        
        $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
        $digest = base64_encode(hash('sha256', $jsonBody, true));
        
        $rawSignature = "Client-Id:" . $clientId . "\n" .
                        "Request-Id:" . $requestId . "\n" .
                        "Request-Timestamp:" . $timestamp . "\n" .
                        "Request-Target:" . $targetPath . "\n" .
                        "Digest:" . $digest;
        
        $signature = base64_encode(hash_hmac('sha256', $rawSignature, $secretKey, true));
        
        return "HMACSHA256=" . $signature;
    }

    /**
     * Doku Webhook Notification Handler
     */
    public function handleDokuNotification(Request $request)
    {
        Log::info("Doku Webhook Request: " . json_encode($request->all()));

        $invoiceNumber = $request->input('order.invoice_number');
        $paymentStatus = $request->input('transaction.status');

        if (!$invoiceNumber) {
            return response()->json(['message' => 'Invoice number not found'], 400);
        }

        $localTransaction = Transaction::where('order_id', $invoiceNumber)->first();

        if (!$localTransaction) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 200); // 200 agar Doku tidak retry berulang kali
        }

        // Jalankan Signature Verification untuk Doku
        $signatureHeader = $request->header('Signature');
        $clientId = config('services.doku.client_id');
        $secretKey = config('services.doku.secret_key');
        $requestId = $request->header('Request-Id');
        $timestamp = $request->header('Request-Timestamp');
        $targetPath = '/api/payment/doku-notification';

        $rawBody = $request->getContent();
        $digest = base64_encode(hash('sha256', $rawBody, true));

        $rawSignature = "Client-Id:" . $clientId . "\n" .
                        "Request-Id:" . $requestId . "\n" .
                        "Request-Timestamp:" . $timestamp . "\n" .
                        "Request-Target:" . $targetPath . "\n" .
                        "Digest:" . $digest;

        $calculatedSignature = "HMACSHA256=" . base64_encode(hash_hmac('sha256', $rawSignature, $secretKey, true));

        if ($signatureHeader !== $calculatedSignature) {
            Log::warning("Doku Webhook Signature Mismatch! Calculated: {$calculatedSignature}, Received: {$signatureHeader}");
        }

        // Update status sesuai notifikasi Doku
        if (strtoupper($paymentStatus) === 'SUCCESS') {
            $localTransaction->update(['status' => 'settlement']);
            $this->markProductAsSold($localTransaction->product_id);
            Log::info("Doku Payment Success: Order: {$invoiceNumber}");
        } else {
            $localTransaction->update(['status' => 'failed']);
            Log::info("Doku Payment Failed/Pending: Order: {$invoiceNumber}");
        }

        return response()->json(['message' => 'Notification processed successfully'], 200);
    }
}