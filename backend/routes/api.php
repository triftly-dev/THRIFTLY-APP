<?php

Route::get('/test-api', function() {
    return response()->json(['message' => 'API is working!']);
});

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MessageController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'update']);
    Route::get('/users', [UserController::class, 'index']); 
    Route::post('/logout', [AuthController::class, 'logout']);

    // Payments
    Route::post('/payment/token', [PaymentController::class, 'createPayment']);
    Route::post('/payment/notification', [PaymentController::class, 'handleNotification']);

    // Chat / Messages
    Route::get('/messages/{receiverId}', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Admin Only Routes
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::put('/admin/products/{id}/approve', [ProductController::class, 'approve']);
        Route::put('/admin/products/{id}/reject', [ProductController::class, 'reject']);
    });

    // Product management (Seller/Admin)
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/sold', [ProductController::class, 'sold']);
});
