<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::where('status', 'approved')->latest()->get());
    }

    public function adminIndex()
    {
        return response()->json(Product::latest()->get());
    }

    public function myProducts()
    {
        $user = Auth::user();
        return response()->json(Product::where('user_id', $user->id)->latest()->get());
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

        $product = Product::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'location' => $request->location,
            'is_bu' => $request->is_bu ?? false,
            'status' => 'pending', // Default ditinjau admin dulu
            'images' => $request->images,
            'stock' => $request->stock ?? 1,
        ]);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan dan sedang ditinjau admin',
            'product' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Pastikan yang mengedit adalah pemiliknya
        if ($product->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->update($request->all());
        return response()->json($product);
    }

    public function show($id)
    {
        // Cari produk berdasarkan ID beserta data detail penjualnya
        $product = Product::with('seller')->findOrFail($id);
        return response()->json($product);
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
