<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class VerifyEmailIndo extends VerifyEmailBase
{
    public $frontendUrl;

    public function __construct($frontendUrl = null)
    {
        $this->frontendUrl = $frontendUrl;
    }

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

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
                'redirect_url' => $this->frontendUrl, // Memasukkan parameter ke dalam signed route (Aman)
            ]
        );
    }
}
