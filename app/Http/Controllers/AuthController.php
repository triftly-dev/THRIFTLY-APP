<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'no_telp' => 'required|string|max:15',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'no_telp' => $request->no_telp,
            'password' => bcrypt($request->password),
            'role' => $request->role ?? 'buyer',
            'alamat' => $request->alamat,
            'lokasi' => $request->lokasi,
            'email_verified_at' => null,
        ]);

        // Kirim notification dengan membawa URL asal agar redirect benar
        // Prioritas: body request > Referer header > config default
        $frontendUrl = $request->input('frontend_url')
            ?? $request->header('Referer')
            ?? config('app.frontend_url');
        $user->notify(new \App\Notifications\VerifyEmailIndo($frontendUrl));

        return response()->json([
            'message' => 'Registrasi Berhasil! Silakan cek email Anda untuk verifikasi.',
            'user' => $user->fresh()
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil Masuk',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->fresh()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil Keluar']);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Validasi hash email (cek apakah link sesuai dengan user)
        // Middleware 'signed' sudah memvalidasi signature URL secara keseluruhan
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            // Jika hash tidak cocok, redirect ke frontend dengan pesan error
            $errorUrl = $request->query('redirect_url') ?? config('app.frontend_url');
            $errorUrl = rtrim($errorUrl, '/');
            return redirect($errorUrl . '/login?error=invalid_hash');
        }

        // Ambil redirect_url dari parameter yang sudah di-sign bersama URL
        $targetUrl = $request->query('redirect_url') ?? config('app.frontend_url');
        $targetUrl = rtrim($targetUrl, '/');

        // Jika sudah terverifikasi sebelumnya, langsung redirect ke profil
        if ($user->hasVerifiedEmail()) {
            return redirect($targetUrl . '/profile?verified=1&already=true');
        }

        // Tandai email sebagai terverifikasi
        if ($user->markEmailAsVerified()) {
            event(new \Illuminate\Auth\Events\Verified($user));
        }

        return redirect($targetUrl . '/profile?verified=1');
    }

    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified']);
        }

        $frontendUrl = $request->input('frontend_url') ?? $request->header('Referer') ?? config('app.frontend_url');
        $request->user()->notify(new \App\Notifications\VerifyEmailIndo($frontendUrl));
        
        return response()->json(['message' => 'Sent']);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Logika redirect dinamis untuk Google
            $frontendUrl = config('app.frontend_url');
            if (str_contains($frontendUrl, 'thrifty-app-frontend.vercel.app')) {
                $frontendUrl = 'https://thriftly-marketplace.vercel.app';
            }

            $user = User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->email)
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                    'role' => 'buyer'
                ]);
            } else {
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
                if (!$user->email_verified_at) {
                    $user->update(['email_verified_at' => now()]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;
            return redirect($frontendUrl . '/login-success?token=' . $token);

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url');
            if (str_contains($frontendUrl, 'thrifty-app-frontend.vercel.app')) {
                $frontendUrl = 'https://thriftly-marketplace.vercel.app';
            }
            return redirect($frontendUrl . '/login?error=google_failed');
        }
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }

        // Buat token reset password
        $token = Str::random(60);
        
        // Simpan token ke table password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $frontendUrl = $request->input('frontend_url') ?? config('app.frontend_url');
        $resetUrl = rtrim($frontendUrl, '/') . "/reset-password?token=" . $token . "&email=" . urlencode($user->email);

        $user->notify(new ResetPasswordNotification($resetUrl));

        return response()->json(['message' => 'Link reset password telah dikirim ke email Anda.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token reset password tidak valid atau sudah kedaluwarsa.'], 422);
        }

        // Update password user di tabel USERS
        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Hapus token setelah digunakan
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password Anda berhasil diperbarui. Silakan login kembali.']);
    }
}