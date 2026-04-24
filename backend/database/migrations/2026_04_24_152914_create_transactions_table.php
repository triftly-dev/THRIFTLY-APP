<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('order_id')->unique(); // WAJIB UNTUK MIDTRANS
            $blueprint->foreignId('product_id')->constrained()->onDelete('cascade');
            $blueprint->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $blueprint->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $blueprint->bigInteger('harga_final');
            $blueprint->bigInteger('ongkir')->default(0);
            $blueprint->string('status')->default('pending');
            $blueprint->text('alamat_pengiriman')->nullable();
            $blueprint->string('video_packing')->nullable();
            $blueprint->string('video_unboxing')->nullable();
            $blueprint->string('snap_token')->nullable();
            $blueprint->string('payment_method')->nullable();
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
