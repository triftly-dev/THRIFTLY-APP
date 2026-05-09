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
     * Mengirim kode OTP ke WhatsApp via Fonnte
     */
    public function sendOTP(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $request->phone;
        $code = rand(100000, 999999); // Generate 6 digit angka

        // Simpan ke database
        OtpCode::updateOrCreate(
            ['phone' => $phone],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(5), // Kadaluarsa dalam 5 menit
            ]
        );

        // KIRIM VIA FONNTE (WhatsApp API)
        // Anda perlu mendapatkan TOKEN dari fonnte.com
        $token = env('FONNTE_TOKEN', 'YOUR_TOKEN_HERE');
        
        $response = Http::withHeaders([
            'Authorization' => $token,
        ])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => "Kode OTP Marketplace Anda adalah: $code. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN. Berlaku 5 menit.",
        ]);

        if ($response->successful()) {
            return response()->json(['message' => 'Kode OTP berhasil dikirim ke WhatsApp Anda.']);
        }

        Log::error('Fonnte Error: ' . $response->body());
        return response()->json(['message' => 'Gagal mengirim OTP, coba lagi nanti.'], 500);
    }

    /**
     * Memverifikasi kode OTP yang diinput user
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string',
        ]);

        $otp = OtpCode::where('phone', $request->phone)
            ->where('code', $request->code)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Kode OTP salah atau sudah kadaluarsa.'], 400);
        }

        // Jika OK, hapus OTP agar tidak dipakai lagi
        $otp->delete();

        // Tandai nomor telepon user sebagai terverifikasi di tabel users (jika perlu)
        $user = User::where('no_telp', $request->phone)->first();
        if ($user) {
            // Anda bisa menambah kolom 'phone_verified_at' jika ingin
            $user->update(['lokasi' => 'verified_phone']); // Contoh sementara
        }

        return response()->json(['message' => 'Verifikasi nomor telepon berhasil!']);
    }
}
