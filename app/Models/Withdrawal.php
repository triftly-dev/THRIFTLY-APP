<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = [
        'user_id',
        'bank_name',
        'account_number',
        'account_holder',
        'amount',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
