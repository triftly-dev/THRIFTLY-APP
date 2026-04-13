<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    // Mengambil semua produk (untuk halaman guest/belanja)
    public function index()
    {
        return response()->json(Product::where('status', 'approved')->latest()->get());
    }

    // Mengambil semua produk tanpa filter status (untuk admin dashboard & approval)
    public function adminIndex()
    {
        // Secara ideal harus dicek Auth::user()->role === 'admin'
        return response()->json(Product::latest()->get());
    }

    // Mengambil produk milik penjual yang sedang login
    public function myProducts()
    {
        $user = Auth::user();
        return response()->json(Product::where('user_id', $user->id)->latest()->get());
    }

    // Menambah produk baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
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
            'message' => 'Produk berhasil diajukan dan sedang ditinjau!',
            'product' => $product
        ], 201);
    }

    // Update produk
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Pastikan yang mengedit adalah pemiliknya
        if ($product->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->update($request->all());

        return response()->json([
            'message' => 'Produk berhasil diperbarui!',
            'product' => $product
        ]);
    }

    // Hapus produk
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $user = Auth::user();

        if ($product->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus!']);
    }

    public function sold($id)
    {
        $product = Product::findOrFail($id);
        $product->update([
            'status' => 'sold',
            'stock' => 0
        ]);
        return response()->json(['message' => 'Product marked as sold and stock depleted!']);
    }

    public function approve(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->update([
            'status' => 'approved',
            'admin_note' => $request->note 
        ]);

        return response()->json(['message' => 'Produk disetujui!']);
    }

    public function reject(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->update([
            'status' => 'rejected',
            'admin_note' => $request->note
        ]);

        return response()->json(['message' => 'Produk ditolak!']);
    }

    // Melihat detail produk
    public function show($id)
    {
        return response()->json(Product::with('seller')->findOrFail($id));
    }
}
