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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // ID Penjual
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('category');
            $table->string('location')->nullable();
            $table->string('condition')->default('Second'); // Tambahkan ini
            $table->boolean('is_bu')->default(false); // Butuh Uang tag
            $table->enum('status', ['pending', 'approved', 'rejected', 'sold'])->default('pending');
            $table->json('images')->nullable(); // Simpan array path foto
            $table->text('admin_note')->nullable(); // Catatan admin jika ditolak
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
