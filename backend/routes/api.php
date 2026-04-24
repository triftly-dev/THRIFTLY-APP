<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
\Illuminate\Support\Facades\Log::info("API Route Hit: " . request()->fullUrl());

use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\UserController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
});

// Protected routes (Admin level)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/admin/products', [ProductController::class, 'adminIndex']);
    Route::put('/admin/products/{id}/approve', [ProductController::class, 'approve']);
    Route::put('/admin/products/{id}/reject', [ProductController::class, 'reject']);
});

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Admin Routes
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::put('/admin/products/{id}/approve', [ProductController::class, 'approve']);
        Route::put('/admin/products/{id}/reject', [ProductController::class, 'reject']);
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
    });

    // Seller & Buyer Shared Protected Routes
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::put('/products/{id}/sold', [ProductController::class, 'sold']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    // logout
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Midtrans Payment Routes (Public for Testing)
Route::post('/payment/token', [\App\Http\Controllers\PaymentController::class, 'createPayment']);
Route::post('/payment/notification', [\App\Http\Controllers\PaymentController::class, 'handleNotification']);
