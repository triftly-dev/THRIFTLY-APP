<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'buyer_id',
        'seller_id',
        'harga_final',
        'ongkir',
        'status',
        'alamat_pengiriman',
        'video_packing',
        'video_unboxing',
        'snap_token',
        'payment_type',
        'bank',
        'va_number',
        'expiry_time',
        'pdf_url'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
