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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->enum('gender', ['L', 'P'])->nullable()->after('avatar');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('ktp_path')->nullable()->after('lokasi');
            $table->boolean('is_ktp_verified')->default(false)->after('ktp_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'gender', 'date_of_birth', 'ktp_path', 'is_ktp_verified']);
        });
    }
};
