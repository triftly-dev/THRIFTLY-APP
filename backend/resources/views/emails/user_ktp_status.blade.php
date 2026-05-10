<!DOCTYPE html>
<html>
<head>
    <title>Update Status Verifikasi KTP</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: {{ $user->ktp_status === 'verified' ? '#10b981' : '#ef4444' }};">
            Halo {{ $user->name }},
        </h2>
        
        @if($user->ktp_status === 'verified')
            <p>Selamat! Verifikasi KTP Anda telah <strong>DITERIMA</strong>.</p>
            <p>Sekarang Anda telah menjadi **Penjual Terpercaya** di Thriftly. Anda dapat menikmati fitur penarikan dana tanpa batas dan kepercayaan lebih dari pembeli.</p>
        @else
            <p>Mohon maaf, verifikasi KTP Anda telah <strong>DITOLAK</strong>.</p>
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #991b1b;">Alasan Penolakan:</p>
                <p style="margin: 5px 0 0 0; color: #b91c1c;">{{ $user->ktp_rejection_reason ?? 'Dokumen tidak sesuai atau gambar kurang jelas.' }}</p>
            </div>
            <p>Silakan upload ulang foto KTP Anda dengan kualitas yang lebih baik melalui menu Pengaturan Akun.</p>
        @endif

        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ config('app.frontend_url') }}/profile" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ke Profil Saya</a>
        </div>
        
        <p style="margin-top: 40px; font-size: 12px; color: #999;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
    </div>
</body>
</html>
