<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        // Simpan hasil query di cache selama 10 menit (600 detik)
        $products = Cache::remember('approved_products_limit_24', 600, function () {
            // Ditambahkan with('seller') agar tidak terjadi N+1 Problem
            return Product::with('seller')->where('status', 'approved')->latest()->limit(24)->get();
        });

        return response()->json($products);
    }

    public function adminIndex()
    {
        // Gunakan paginate agar Admin hanya memuat 10 data per halaman
        // Ini akan membuat Dashboard jauh lebih ringan
        return response()->json(Product::with('seller')->latest()->paginate(10));
    }

    public function myProducts()
    {
        $user = Auth::user();
        // Gunakan paginate agar halaman penjual tetap ringan
        return response()->json(Product::where('user_id', $user->id)->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
            'price' => 'required|numeric',
            'category' => 'required',
            'images' => 'nullable|array',
        ]);

        // Proses gambar dari Base64 menjadi File Fisik
        $imagePaths = [];
        if ($request->has('images')) {
            foreach ($request->images as $base64) {
                if (Str::startsWith($base64, 'data:image')) {
                    $imagePaths[] = $this->uploadBase64Image($base64);
                } else {
                    $imagePaths[] = $base64; // Jika sudah berupa path
                }
            }
        }

        $product = Product::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'location' => $request->location,
            'is_bu' => $request->is_bu ?? false,
            'status' => 'pending',
            'images' => $imagePaths, // Simpan array path, bukan base64
            'stock' => $request->stock ?? 1,
        ]);

        // Hapus cache agar data baru muncul
        Cache::forget('approved_products_limit_24');

        return response()->json([
            'message' => 'Produk berhasil ditambahkan dan sedang ditinjau admin',
            'product' => $product
        ], 201);
    }

    private function uploadBase64Image($base64)
    {
        // Decode base64
        $image_service_str = substr($base64, strpos($base64, ",") + 1);
        $image = base64_decode($image_service_str);
        
        // Buat nama file unik
        $fileName = 'products/' . Str::random(20) . '.png';
        
        // Simpan ke storage public
        Storage::disk('public')->put($fileName, $image);
        
        // Kembalikan URL yang bisa diakses
        return Storage::url($fileName);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->all();

        // Jika ada perubahan gambar dalam bentuk base64, proses ulang
        if ($request->has('images')) {
            $imagePaths = [];
            foreach ($request->images as $img) {
                if (Str::startsWith($img, 'data:image')) {
                    $imagePaths[] = $this->uploadBase64Image($img);
                } else {
                    $imagePaths[] = $img;
                }
            }
            $data['images'] = $imagePaths;
        }

        $product->update($data);
        Cache::forget('approved_products_limit_24');
        
        return response()->json($product);
    }

    public function show($id)
    {
        try {
            // Gunakan select untuk membatasi kolom yang ditarik agar memori VPS aman
            $product = Product::with(['seller' => function($query) {
                $query->select('id', 'name', 'lokasi', 'created_at');
            }])->findOrFail($id);
            
            return response()->json($product);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengambil detail produk ID {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memuat data produk. Pastikan format data benar.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus!']);
    }

    public function sold($id)
    {
        try {
            $product = \App\Models\Product::findOrFail($id);
            
            \Illuminate\Support\Facades\Log::info("Mencoba menandai terjual produk ID: " . $id);

            $product->update([
                'status' => 'sold',
                'stock' => 0
            ]);

            // Hanya kirim pesan sukses tanpa data produk yang berat agar memori VPS aman
            return response()->json([
                'message' => 'Produk berhasil ditandai terjual!',
                'product_id' => $id
            ]);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal menandai terjual: " . $e->getMessage());
            return response()->json([
                'message' => 'Error backend: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'approved']);
        return response()->json($product);
    }

    public function reject(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'rejected']);
        return response()->json($product);
    }
}
