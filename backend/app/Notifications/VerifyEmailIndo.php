<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class VerifyEmailIndo extends VerifyEmailBase
{
    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject(Lang::get('Verifikasi Alamat Email - Thriftly'))
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line(Lang::get('Terima kasih telah mendaftar di Thriftly. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda.'))
            ->action(Lang::get('Verifikasi Email'), $verificationUrl)
            ->line(Lang::get('Jika Anda tidak membuat akun, tidak ada tindakan lebih lanjut yang diperlukan.'))
            ->salutation('Salam hangat, Tim Thriftly');
    }
}
