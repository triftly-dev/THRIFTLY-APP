<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Route Verifikasi Email dipindahkan ke sini (web.php) agar URL tidak
// mengandung prefix /api/ yang bisa menyebabkan mismatch pada signed URL
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
