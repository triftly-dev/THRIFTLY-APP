<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    protected $appends = ['fotos'];

    public function getFotosAttribute()
    {
        return $this->images ?? [];
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
