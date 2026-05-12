<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'email_verified' => $user->hasVerifiedEmail(),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'no_telp' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.unique' => 'Email ini sudah terdaftar!',
            'no_telp.unique' => 'Nomor HP ini sudah terdaftar!',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'no_telp' => $request->no_telp,
            'password' => bcrypt($request->password),
            'role' => $request->role ?? 'buyer',
            'email_verified_at' => null, // Paksa jadi NULL untuk pendaftaran manual
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registrasi Berhasil! Silakan cek email Anda untuk verifikasi.',
            'user' => $user
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil Keluar']);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid link'], 403);
        }
        $frontendUrl = config('app.frontend_url');
        if (str_contains($frontendUrl, 'thrifty-app-frontend.vercel.app')) {
            $frontendUrl = 'https://thriftly-marketplace.vercel.app';
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/login?verified=1');
        }
        if ($user->markEmailAsVerified()) {
            event(new \Illuminate\Auth\Events\Verified($user));
        }
        return redirect($frontendUrl . '/login?verified=1');
    }

    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified']);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Sent']);
    }

    public function redirectToGoogle(Request $request)
    {
        // Ambil URL asal dari query parameter atau header Referer
        $frontendUrl = $request->query('frontend_url') ?? $request->header('Referer');
        
        // Bersihkan trailing slash jika ada
        $frontendUrl = rtrim($frontendUrl, '/');

        // Jika URL valid, kirimkan sebagai 'state' ke Google
        if ($frontendUrl) {
            return Socialite::driver('google')
                ->stateless()
                ->with([
                    'state' => 'frontend_url=' . $frontendUrl,
                    'prompt' => 'select_account'
                ])
                ->redirect();
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Tangkap kembali URL asal dari parameter 'state' yang dikirim balik oleh Google
            $state = $request->input('state');
            $frontendUrl = config('app.frontend_url');
            if (str_contains($frontendUrl, 'thrifty-app-frontend.vercel.app')) {
                $frontendUrl = 'https://thriftly-marketplace.vercel.app';
            }
            $targetUrl = $frontendUrl; // Default

            if ($state) {
                parse_str($state, $result);
                if (isset($result['frontend_url'])) {
                    $targetUrl = $result['frontend_url'];
                    // Jaga-jaga jika targetUrl dari state juga masih yang lama
                    if (str_contains($targetUrl, 'thrifty-app-frontend.vercel.app')) {
                        $targetUrl = str_replace('thrifty-app-frontend.vercel.app', 'thriftly-marketplace.vercel.app', $targetUrl);
                    }
                }
            }
            
            $user = User::where('google_id', $googleUser->id)
                        ->orWhere('email', $googleUser->email)
                        ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'google_token' => $googleUser->token,
                    'password' => bcrypt(Str::random(16)),
                    'role' => 'buyer',
                ]);
                $user->markEmailAsVerified();
            } else {
                $user->update([
                    'google_id' => $googleUser->id,
                    'google_token' => $googleUser->token,
                ]);
            }

            Auth::login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect($targetUrl . '/login-success?token=' . $token);

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url');
            if (str_contains($frontendUrl, 'thrifty-app-frontend.vercel.app')) {
                $frontendUrl = 'https://thriftly-marketplace.vercel.app';
            }
            return redirect($frontendUrl . '/login?error=google_failed');
        }
    }
}