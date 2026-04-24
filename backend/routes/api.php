<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// JALUR TIKUS: Respon paksa untuk tes koneksi
if (isset($_SERVER['REQUEST_METHOD'])) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit;
    }

    if (strpos($_SERVER['REQUEST_URI'] ?? '', 'payment/token') !== false) {
        echo json_encode(['message' => 'KONEKSI TEMBUS KE API.PHP', 'status' => 'success']);
        exit;
    }
}

use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/payment/token', [PaymentController::class, 'createPayment']);
Route::post('/payment/notification', [PaymentController::class, 'handleNotification']);
