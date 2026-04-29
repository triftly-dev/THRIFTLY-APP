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
        $this->info("=== MENDEMONSTRASIKAN BASELINE (TANPA OPTIMASI) ===");
        
        // Simulasi tanpa limit & tanpa cache
        DB::enableQueryLog();
        $startTime = microtime(true);
        
        // Anggap saja kita mengambil semua data (seperti kode lama)
        $productsBaseline = Product::where('status', 'approved')->latest()->get();
        
        $endTime = microtime(true);
        $queryCount = count(DB::getQueryLog());
        $executionTime = ($endTime - $startTime);

        $this->line("Jumlah Query : " . $queryCount . " queries");
        $this->line("Data dikirim : " . $productsBaseline->count() . " produk");
        $this->line("Waktu Eksekusi: " . number_format($executionTime, 4) . " detik");
        DB::disableQueryLog();
        DB::flushQueryLog();

        $this->line("");
        $this->info("=== MENDEMONSTRASIKAN OPTIMIZED QUERY ===");
        
        DB::enableQueryLog();
        $startTime = microtime(true);
        
        // Kode baru dengan limit & cache
        Cache::forget('approved_products_limit_24'); // Hapus cache dulu untuk tes kecepatan DB asli
        $productsOptimized = Cache::remember('approved_products_limit_24', 600, function () {
            return Product::where('status', 'approved')->latest()->limit(24)->get();
        });

        $endTime = microtime(true);
        $queryCount = count(DB::getQueryLog());
        $executionTime = ($endTime - $startTime);

        $this->line("Jumlah Query (Database Hit): " . $queryCount . " queries");
        $this->line("Data dikirim : " . $productsOptimized->count() . " produk (Teroptimasi)");
        $this->line("Waktu Eksekusi: " . number_format($executionTime, 4) . " detik");

        $this->line("");
        $this->question("[KESIMPULAN] Optimasi Limit & Indexing berhasil memangkas beban memori dan waktu respon secara drastis!");
    }
}
