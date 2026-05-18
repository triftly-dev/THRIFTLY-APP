<!DOCTYPE html>
<html>
<head>
    <title>Dokumen KTP Sedang Diverifikasi</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: #f59e0b;">Halo {{ $user->name }},</h2>
        <p>Terima kasih telah mengirimkan dokumen KTP Anda untuk verifikasi identitas di Thriftly.</p>
        <p>Saat ini dokumen Anda **sedang dalam antrean peninjauan oleh tim Admin kami**. Proses ini biasanya memakan waktu **1-2 hari kerja**.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Status: Menunggu Verifikasi</p>
            <p style="margin: 5px 0 0 0; color: #b45309;">Kami akan mengirimkan email notifikasi segera setelah status verifikasi Anda diperbarui.</p>
        </div>

        <p>Anda tetap dapat menggunakan aplikasi Thriftly seperti biasa, namun fitur "Penjual Terpercaya" akan aktif setelah verifikasi selesai.</p>

        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ $user->ktp_frontend_url ?? config('app.frontend_url') }}/profile?tab=security" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Cek Status Profil</a>
        </div>
        
        <p style="margin-top: 40px; font-size: 12px; color: #999;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
    </div>
</body>
</html>
