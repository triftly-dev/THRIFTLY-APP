<!DOCTYPE html>
<html>
<head>
    <title>Permintaan Verifikasi KTP Baru</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: #4f46e5;">Halo Admin,</h2>
        <p>Ada permintaan verifikasi KTP baru dari pengguna:</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nama:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $user->name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $user->email }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">NIK:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $user->ktp_nik }}</td>
            </tr>
        </table>
        <p>Silakan login ke panel admin untuk meninjau dokumen tersebut.</p>
        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ config('app.frontend_url') }}/admin/users" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ke Panel Admin</a>
        </div>
    </div>
</body>
</html>
