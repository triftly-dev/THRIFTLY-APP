<!DOCTYPE html>
<html>
<head>
    <title>Pengajuan Penarikan Saldo Berhasil</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px;">💸</span>
            <h2 style="color: #059669; margin: 10px 0 0 0; font-size: 22px;">Pengajuan Penarikan Saldo Berhasil</h2>
        </div>

        <p style="font-size: 14px; color: #4b5563;">Halo <strong>{{ $user->name }}</strong>,</p>
        <p style="font-size: 14px; color: #4b5563; leading-relaxed;">
            Kami informasikan bahwa pengajuan penarikan saldo penjualan Anda sebesar <strong>Rp {{ number_format($withdrawal->amount, 0, ',', '.') }}</strong> telah berhasil kami terima dan saat ini sedang dalam proses pemrosesan/transfer.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #166534; font-weight: bold; border-bottom: 1px dashed #bbf7d0; padding-bottom: 8px;">DETAIL REKENING TUJUAN</h3>
            <table style="width: 100%; font-size: 13px; color: #14532d; border-collapse: collapse;">
                <tr>
                    <td style="padding: 4px 0; font-weight: bold; width: 40%;">Bank Tujuan:</td>
                    <td style="padding: 4px 0;">{{ $withdrawal->bank_name }}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Nomor Rekening:</td>
                    <td style="padding: 4px 0;">{{ $withdrawal->account_number }}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Atas Nama:</td>
                    <td style="padding: 4px 0;">{{ $withdrawal->account_holder }}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Nominal Penarikan:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #047857; font-size: 14px;">Rp {{ number_format($withdrawal->amount, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 12px; margin: 20px 0; font-size: 13px; color: #92400e;">
            <p style="margin: 0; font-weight: bold;">Status Transaksi: PENDING (Sedang Diproses)</p>
            <p style="margin: 4px 0 0 0; line-height: 1.4;">Proses transfer bank ini biasanya memakan waktu **15-60 menit** tergantung jaringan bank operasional. Notifikasi pembayaran/pencairan otomatis juga dikirim ke log Midtrans Anda.</p>
        </div>

        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            Jika Anda tidak merasa mengajukan penarikan ini, mohon segera hubungi Pusat Bantuan Thriftly di email atau chat untuk mengamankan akun Anda.
        </p>

        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ config('app.frontend_url') }}/toko/dashboard" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">Masuk ke Dashboard</a>
        </div>
        
        <p style="margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            Ini adalah email otomatis dari platform Thriftly, mohon tidak membalas email ini secara langsung.
        </p>
    </div>
</body>
</html>
