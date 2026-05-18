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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payment_type')->nullable()->after('status');
            $table->string('bank')->nullable()->after('payment_type');
            $table->string('va_number')->nullable()->after('bank');
            $table->string('expiry_time')->nullable()->after('va_number');
            $table->string('pdf_url')->nullable()->after('expiry_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            //
        });
    }
};
