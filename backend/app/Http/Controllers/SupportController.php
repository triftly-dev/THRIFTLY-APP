<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SupportController extends Controller
{
    public function sendContactMessage(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            $data = $request->all();
            
            Mail::send([], [], function ($message) use ($data) {
                $message->to('triftlydev@gmail.com')
                    ->subject('[Pusat Bantuan] ' . $data['subject'])
                    ->html("
                        <h2>Pesan Baru dari Pusat Bantuan</h2>
                        <p><strong>Nama:</strong> {$data['name']}</p>
                        <p><strong>Email:</strong> {$data['email']}</p>
                        <p><strong>Subjek:</strong> {$data['subject']}</p>
                        <hr>
                        <p><strong>Pesan:</strong></p>
                        <p>" . nl2br(e($data['message'])) . "</p>
                    ");
            });

            return response()->json([
                'success' => true,
                'message' => 'Pesan Anda berhasil dikirim ke tim dukungan kami.'
            ]);

        } catch (\Exception $e) {
            Log::error('Contact Form Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan. Silakan coba lagi nanti.'
            ], 500);
        }
    }
}
