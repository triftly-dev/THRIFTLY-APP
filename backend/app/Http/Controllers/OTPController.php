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

        // Normalisasi nomor telepon (08xxx -> 628xxx)
        $phone = $request->phone;
        if ($phone && str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        $identifier = $request->email ?: $phone;
        if (!$identifier) {
            return response()->json(['message' => 'Email atau Nomor HP wajib diisi.'], 400);
        }

        $code = rand(100000, 999999);

        // Simpan ke database
        OtpCode::updateOrCreate(
            ['phone' => $phone, 'email' => $request->email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        if ($request->email) {
            try {
                \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\OtpVerification($code));
                return response()->json(['message' => 'Kode verifikasi telah dikirim ke email Anda.']);
            } catch (\Exception $e) {
                Log::error('Email OTP Error: ' . $e->getMessage());
                return response()->json(['message' => 'Gagal mengirim email verifikasi.'], 500);
            }
        } else {
            $token = env('FONNTE_TOKEN');
            
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => "Kode OTP Thriftly Anda adalah: $code. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN. Berlaku 10 menit.",
            ]);

            if ($response->successful()) {
                return response()->json(['message' => 'Kode OTP berhasil dikirim ke WhatsApp Anda.']);
            }

            Log::error('Fonnte Error: ' . $response->body());
            return response()->json(['message' => 'Gagal mengirim OTP ke WhatsApp.'], 500);
        }
    }

    public function verifyOTP(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'code' => 'required|string',
        ]);

        // Normalisasi nomor telepon jika ada
        $phone = $request->phone;
        if ($phone && str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        // Cek OTP
        $query = OtpCode::where('code', $request->code)
            ->where('expires_at', '>', Carbon::now());

        if ($request->email) {
            $query->where('email', $request->email);
        } elseif ($phone) {
            $query->where('phone', $phone);
        }

        $otp = $query->first();

        // JIKA TIDAK KETEMU lewat phone/email eksplisit, coba cari kode saja (untuk user yang sedang login)
        if (!$otp) {
            $otp = OtpCode::where('code', $request->code)
                ->where('expires_at', '>', Carbon::now())
                ->first();
        }

        if (!$otp) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kadaluarsa.'], 400);
        }

        // Jika OK, hapus OTP
        $otp->delete();

        // Tandai sebagai terverifikasi
        $user = auth()->user();
        
        if (!$user) {
            if ($request->email) {
                $user = User::where('email', $request->email)->first();
            } elseif ($phone) {
                $user = User::where('no_telp', $phone)->first();
            }
        }

        if ($user) {
            // Logika perbaikan: Cek apakah OTP yang diverifikasi milik Email atau Phone
            if ($otp->email) {
                $user->update(['email_verified_at' => now()]);
            } elseif ($otp->phone) {
                $user->update(['phone_verified_at' => now()]);
            }
        }

        return response()->json([
            'message' => 'Verifikasi berhasil!', 
            'user' => $user ? $user->fresh() : null
        ]);
    }
}
