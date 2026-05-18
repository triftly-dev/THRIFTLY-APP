<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WithdrawalRequested extends Mailable
{
    use Queueable, SerializesModels;

    public $withdrawal;
    public $user;

    public function __construct($withdrawal, $user)
    {
        $this->withdrawal = $withdrawal;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengajuan Penarikan Saldo Berhasil - Thriftly',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.withdrawal_requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
