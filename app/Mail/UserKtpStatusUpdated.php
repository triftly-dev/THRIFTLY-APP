<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserKtpStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $frontendUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $frontendUrl = null)
    {
        $this->user = $user;
        $this->frontendUrl = $frontendUrl ?? config('app.frontend_url');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Status Verifikasi KTP Anda - Thriftly',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.user_ktp_status',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
