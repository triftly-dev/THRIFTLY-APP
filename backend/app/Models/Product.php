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

    // Tambahkan appends agar field bahasa Indonesia selalu tersedia untuk frontend
    protected $appends = ['nama', 'harga', 'deskripsi', 'kategori', 'kondisi', 'isBU', 'stok', 'lokasi', 'fotos'];

    public function getNamaAttribute() { return $this->name; }
    public function getHargaAttribute() { return $this->price; }
    public function getDeskripsiAttribute() { return $this->description; }
    public function getKategoriAttribute() { return $this->category; }
    public function getKondisiAttribute() { return $this->condition; }
    public function getIsBUAttribute() { return $this->is_bu; }
    public function getStokAttribute() { return $this->stock; }
    public function getLokasiAttribute() { return $this->location; }
    public function getFotosAttribute() { return $this->images; }

    // Mengubah atribut 'images' asli agar sinkron dengan frontend produksi
    public function getImagesAttribute($value)
    {
        if (empty($value)) return [];
        
        $images = is_array($value) ? $value : json_decode($value, true);
        if (!is_array($images)) return [];

        $baseUrl = config('app.url');

        return array_map(function ($img) use ($baseUrl) {
            if (empty($img)) return null;
            
            if (str_starts_with($img, 'data:image') || str_starts_with($img, 'http')) {
                return $img;
            }
            
            if (str_starts_with($img, '/storage')) {
                return rtrim($baseUrl, '/') . $img;
            }

            if (str_starts_with($img, 'products/')) {
                return \Illuminate\Support\Facades\Storage::disk('public')->url($img);
            }

            return $img;
        }, $images);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
