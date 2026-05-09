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
                $product->timestamps = false; // Hindari error _updated_at
                $product->save();
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
        try {
            $serverKey = trim(config('services.midtrans.server_key'));
            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

            $notif = new \Midtrans\Notification();

            $transaction = $notif->transaction_status;
            $type = $notif->payment_type;
            $orderId = $notif->order_id;
            $fraud = $notif->fraud_status;

            $localTransaction = Transaction::where('order_id', $orderId)->first();

            if (!$localTransaction) {
                return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
            }

            if ($transaction == 'capture') {
                if ($type == 'credit_card') {
                    if ($fraud == 'challenge') {
                        $localTransaction->update(['status' => 'pending']);
                    } else {
                        $localTransaction->update(['status' => 'settlement']);
                        // Otomatis tandai produk sebagai terjual
                        $this->markProductAsSold($localTransaction->product_id);
                    }
                }
            } else if ($transaction == 'settlement') {
                $localTransaction->update(['status' => 'settlement']);
                // Otomatis tandai produk sebagai terjual
                $this->markProductAsSold($localTransaction->product_id);
            } else if ($transaction == 'pending') {
                $localTransaction->update(['status' => 'pending']);
            } else if ($transaction == 'deny') {
                $localTransaction->update(['status' => 'deny']);
            } else if ($transaction == 'expire') {
                $localTransaction->update(['status' => 'expire']);
            } else if ($transaction == 'cancel') {
                $localTransaction->update(['status' => 'cancel']);
            }

            return response()->json(['message' => 'Success']);

        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
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
                $product->timestamps = false; // Hindari perubahan updated_at jika tidak diperlukan
                $product->save();
                Log::info("Produk ID {$productId} berhasil ditandai sebagai SOLD melalui Midtrans.");
            }
        } catch (Exception $e) {
            Log::error("Gagal menandai produk ID {$productId} sebagai SOLD: " . $e->getMessage());
        }
    }
}