<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserKtpUploaded extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dokumen KTP Anda Sedang Diproses - Thriftly',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user_ktp_uploaded',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
