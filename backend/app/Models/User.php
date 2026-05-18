<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
  use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'role',
        'alamat',
        'no_telp',
        'lokasi',
        'gender',
        'date_of_birth',
        'email_verified_at',
        'phone_verified_at',
        'google_id',
        'google_token',
        'ktp_path',
        'ktp_nik',
        'ktp_name',
        'ktp_birth_place',
        'ktp_birth_date',
        'ktp_status',
        'ktp_rejection_reason',
        'is_ktp_verified',
        'no_rekening',
        'ktp_frontend_url'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailIndo);
    }

    protected $appends = ['saldo'];

    public function getSaldoAttribute()
    {
        // Hitung saldo ketahan (status = paid, settlement, atau shipping)
        $ketahan = \App\Models\Transaction::where('seller_id', $this->id)
            ->whereIn('status', ['paid', 'settlement', 'shipping'])
            ->sum('harga_final');

        // Hitung saldo bisa ditarik (status = completed)
        $bisaDitarik = \App\Models\Transaction::where('seller_id', $this->id)
            ->where('status', 'completed')
            ->sum('harga_final');

        // Kurangi dengan penarikan yang pernah diajukan (status = pending atau success)
        $tertarik = \App\Models\Withdrawal::where('user_id', $this->id)
            ->whereIn('status', ['pending', 'success'])
            ->sum('amount');

        return [
            'bisaDitarik' => (int) max(0, $bisaDitarik - $tertarik),
            'ketahan' => (int) $ketahan
        ];
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }
}
