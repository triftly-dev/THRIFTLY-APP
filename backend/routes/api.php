<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\BlogController;

/*
|--------------------------------------------------------------------------
| Public Routes (Akses Tanpa Login)
|--------------------------------------------------------------------------
*/
Route::get('/test-api', function() { return response()->json(['message' => 'API is working!']); });
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletters', [NewsletterController::class, 'store']); // Sinkronisasi permintaan rekan
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- FITUR UMUM (Buyer & Seller) ---
    // Auth & Profile
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/users', [UserController::class, 'index']); // List user untuk chat
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- FITUR CHAT ---
    // 1. Ambil daftar semua percakapan (untuk Inbox)
    Route::get('/messages', [MessageController::class, 'index']);
    
    // 2. Ambil detail chat berdasarkan Produk dan Lawan Bicara
    Route::get('/messages/{productId}/{otherUserId}', [MessageController::class, 'getConversationDetail']);
    
    // 3. Kirim pesan baru
    Route::post('/messages', [MessageController::class, 'store']);
    
    // 4. Tandai pesan sudah dibaca
    Route::post('/messages/read', [MessageController::class, 'markAsRead']);
    
    // 5. Cek jumlah unread (Opsional)
    Route::get('/messages/unread/count', [MessageController::class, 'getUnreadCount']);

    // --- FITUR BLOG (Admin) ---
    Route::post('/blogs', [BlogController::class, 'store']);

    Route::get('/transactions', [PaymentController::class, 'index']);
    Route::post('/transactions', [PaymentController::class, 'store']); // Tambahan untuk transaksi manual
    Route::get('/seller/orders', [PaymentController::class, 'sellerOrders']);
    Route::post('/transactions/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::post('/payment/token', [PaymentController::class, 'createPayment']);
    Route::post('/payment/charge', [PaymentController::class, 'charge']);
});

// Link Laporan Midtrans (Wajib di LUAR middleware auth karena dipanggil server Midtrans)
Route::post('/payment/notification', [PaymentController::class, 'handleNotification']);

Route::middleware('auth:sanctum')->group(function () {
    // --- FITUR PENJUALAN (Seller) ---
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/sold', [ProductController::class, 'sold']);

    // --- FITUR KHUSUS ADMIN ---
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::put('/admin/products/{id}/approve', [ProductController::class, 'approve']);
        Route::put('/admin/products/{id}/reject', [ProductController::class, 'reject']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']); // Contoh fitur admin delete user
        Route::get('/admin/transactions', [PaymentController::class, 'adminTransactions']);
    });

});
