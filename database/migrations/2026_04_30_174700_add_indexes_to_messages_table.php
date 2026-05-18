<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Index komposit untuk mempercepat hitung unread count
            $table->index(['receiver_id', 'is_read'], 'idx_receiver_unread');
            
            // Index untuk mempercepat filter berdasarkan produk
            $table->index(['product_id', 'sender_id', 'receiver_id'], 'idx_conversation_lookup');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_receiver_unread');
            $table->dropIndex('idx_conversation_lookup');
        });
    }
};
