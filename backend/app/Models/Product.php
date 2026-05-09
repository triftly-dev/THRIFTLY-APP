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

    // Hapus appends yang menduplikasi data berat (seperti fotos) agar RAM VPS tidak meledak
    protected $appends = ['nama', 'harga', 'deskripsi', 'kategori', 'kondisi', 'isBU', 'stok', 'lokasi'];

    public function getNamaAttribute() { return $this->attributes['name'] ?? null; }
    public function getHargaAttribute() { return $this->attributes['price'] ?? null; }
    public function getDeskripsiAttribute() { return $this->attributes['description'] ?? null; }
    public function getKategoriAttribute() { return $this->attributes['category'] ?? null; }
    public function getKondisiAttribute() { return $this->attributes['condition'] ?? null; }
    public function getIsBUAttribute() { return $this->attributes['is_bu'] ?? false; }
    public function getStokAttribute() { return $this->attributes['stock'] ?? 0; }
    public function getLokasiAttribute() { return $this->attributes['location'] ?? null; }

    public function getImagesAttribute($value)
    {
        if (empty($value)) return [];
        
        $images = is_array($value) ? $value : json_decode($value, true);
        if (!is_array($images)) {
            // Jika bukan JSON (seperti link Unsplash di ID 1 & 2), kembalikan sebagai array tunggal
            return [$value];
        }

        $baseUrl = config('app.url') ?? 'https://api.thriftly.my.id';

        return array_map(function ($img) use ($baseUrl) {
            if (empty($img)) return null;
            
            $imgStr = (string)$img;
            
            if (\Illuminate\Support\Str::startsWith($imgStr, 'data:image') || \Illuminate\Support\Str::startsWith($imgStr, 'http')) {
                return $imgStr;
            }
            
            // Perbaikan path agar tidak double slash
            $cleanPath = ltrim($imgStr, '/');
            if (\Illuminate\Support\Str::startsWith($cleanPath, 'storage/')) {
                return rtrim($baseUrl, '/') . '/' . $cleanPath;
            }

            if (\Illuminate\Support\Str::startsWith($cleanPath, 'products/')) {
                return rtrim($baseUrl, '/') . '/storage/' . $cleanPath;
            }

            return $imgStr;
        }, $images);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
