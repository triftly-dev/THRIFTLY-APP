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
    // Mengubah atribut 'images' asli agar sinkron dengan frontend produksi
    public function getImagesAttribute()
    {
        // Ambil data mentah dari database untuk menghindari loop rekursif
        $rawValue = $this->getRawOriginal('images');
        if (empty($rawValue)) return [];
        
        $images = is_array($rawValue) ? $rawValue : json_decode($rawValue, true);
        if (!is_array($images)) return [];

        $baseUrl = config('app.url') ?? 'https://api.thriftly.my.id';

        return array_map(function ($img) use ($baseUrl) {
            if (empty($img)) return null;
            
            $imgStr = (string)$img;
            
            if (\Illuminate\Support\Str::startsWith($imgStr, 'data:image') || \Illuminate\Support\Str::startsWith($imgStr, 'http')) {
                return $imgStr;
            }
            
            if (\Illuminate\Support\Str::startsWith($imgStr, '/storage')) {
                return rtrim($baseUrl, '/') . $imgStr;
            }

            if (\Illuminate\Support\Str::startsWith($imgStr, 'products/')) {
                return rtrim($baseUrl, '/') . '/storage/' . $imgStr;
            }

            return $imgStr;
        }, $images);
    }

    public function getFotosAttribute()
    {
        return $this->images;
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
