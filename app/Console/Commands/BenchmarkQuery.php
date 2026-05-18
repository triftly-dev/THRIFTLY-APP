<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BenchmarkQuery extends Command
{
    protected $signature = 'benchmark:query';
    protected $description = 'Mendemonstrasikan perbedaan performa sebelum dan sesudah optimasi';

    public function handle()
    {
        $this->info("=== MENDEMONSTRASIKAN N+1 PROBLEM (TANPA OPTIMASI) ===");
        
        DB::enableQueryLog();
        $startTime = microtime(true);
        
        // BASELINE: Mengambil produk lalu memanggil seller satu per satu di dalam loop (N+1)
        $products = Product::limit(10)->get(); 
        foreach ($products as $product) {
            // Mengakses relasi 'seller' tanpa eager loading akan memicu 1 query baru per baris
            $sellerName = $product->seller->name ?? 'Unknown'; 
        }
        
        $endTime = microtime(true);
        $queryCount = count(DB::getQueryLog());
        $this->line("Jumlah Query (Tanpa Optimasi) : " . $queryCount . " queries");
        $this->line("Waktu Eksekusi: " . number_format($endTime - $startTime, 4) . " detik");
        
        DB::flushQueryLog();

        $this->line("");
        $this->info("=== MENDEMONSTRASIKAN OPTIMIZED QUERY (EAGER LOADING) ===");
        
        $startTime = microtime(true);
        
        // OPTIMIZED: Menggunakan with('seller') untuk mengambil semua data dalam minimal query
        $productsOptimized = Product::with('seller')->limit(10)->get();
        foreach ($productsOptimized as $product) {
            $sellerName = $product->seller->name ?? 'Unknown';
        }

        $endTime = microtime(true);
        $queryCount = count(DB::getQueryLog());
        
        $this->line("Jumlah Query (Dengan Optimasi): " . $queryCount . " queries");
        $this->line("Waktu Eksekusi: " . number_format($endTime - $startTime, 4) . " detik");

        $this->line("");
        $this->question("[KESIMPULAN] Eager Loading (with) berhasil memangkas jumlah query secara drastis dari 1+N menjadi hanya 2 query!");
    }
}
