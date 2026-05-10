<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OtpCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OTPController extends Controller
{
    /**
     * Mengirim kode OTP ke WhatsApp atau Email
     */
    public function sendOTP(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $identifier = $request->email ?: $request->phone;
        if (!$identifier) {
            return response()->json(['message' => 'Email atau Nomor HP wajib diisi.'], 400);
        }

        $code = rand(100000, 999999);

        // Simpan ke database
        OtpCode::updateOrCreate(
            ['phone' => $request->phone, 'email' => $request->email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(10), // Perpanjang ke 10 menit
            ]
        );

        if ($request->email) {
            // KIRIM VIA EMAIL
            try {
                \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\OtpVerification($code));
                return response()->json(['message' => 'Kode verifikasi telah dikirim ke email Anda.']);
            } catch (\Exception $e) {
                Log::error('Email OTP Error: ' . $e->getMessage());
                return response()->json(['message' => 'Gagal mengirim email verifikasi.'], 500);
            }
        } else {
            // KIRIM VIA FONNTE (WhatsApp API)
            $token = env('FONNTE_TOKEN', 'YOUR_TOKEN_HERE');
            
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $request->phone,
                'message' => "Kode OTP Thriftly Anda adalah: $code. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN. Berlaku 10 menit.",
            ]);

            if ($response->successful()) {
                return response()->json(['message' => 'Kode OTP berhasil dikirim ke WhatsApp Anda.']);
            }

            Log::error('Fonnte Error: ' . $response->body());
            return response()->json(['message' => 'Gagal mengirim OTP ke WhatsApp.'], 500);
        }
    }

    /**
     * Memverifikasi kode OTP yang diinput user
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'code' => 'required|string',
        ]);

        $query = OtpCode::where('code', $request->code)
            ->where('expires_at', '>', Carbon::now());

        if ($request->email) {
            $query->where('email', $request->email);
        } else {
            $query->where('phone', $request->phone);
        }

        $otp = $query->first();

        if (!$otp) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kadaluarsa.'], 400);
        }

        // Jika OK, hapus OTP agar tidak dipakai lagi
        $otp->delete();

        // Tandai sebagai terverifikasi di tabel users
        $user = auth()->user();
        
        if (!$user) {
            // Jika tidak login, cari berdasarkan email/phone
            if ($request->email) {
                $user = User::where('email', $request->email)->first();
            } else {
                $user = User::where('no_telp', $request->phone)->first();
            }
        }

        if ($user) {
            if ($request->email) {
                $user->update(['email_verified_at' => now()]);
            } else {
                $user->update(['phone_verified_at' => now()]);
            }
        }

        return response()->json(['message' => 'Verifikasi berhasil!']);
    }
}
