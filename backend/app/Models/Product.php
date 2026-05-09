<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Status: 'pending', 'approved', 'rejected', 'sold'
 */
class Product extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'price',
        'category',
        'location',
        'condition',
        'is_bu',
        'status',
        'images',
        'admin_note',
        'stock'
    ];

    protected $casts = [
        'images' => 'array',
        'is_bu' => 'boolean',
    ];

    protected $appends = ['fotos', 'seller_name'];

    public function getFotosAttribute()
    {
        $images = $this->images;
        if (!is_array($images)) return [];

        return array_map(function ($img) {
            if (empty($img)) return null;
            
            // Jika sudah base64, biarkan apa adanya
            if (str_starts_with($img, 'data:image')) {
                return $img;
            }
            
            // Jika path (seperti /storage/products/...), pastikan jadi URL lengkap
            if (str_starts_with($img, '/storage')) {
                return config('app.url') . $img;
            }

            // Fallback untuk path tanpa slash di depan
            if (str_starts_with($img, 'products/')) {
                return \Illuminate\Support\Facades\Storage::disk('public')->url($img);
            }

            return $img;
        }, $images);
    }

    public function getSellerNameAttribute()
    {
        return $this->seller->name ?? 'Penjual';
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
