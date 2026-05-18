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
            $table->string('no_telp')->nullable()->unique()->change();
            $table->string('ktp_nik')->unique()->nullable()->after('ktp_path');
            $table->string('ktp_name')->nullable()->after('ktp_nik');
            $table->string('ktp_birth_place')->nullable()->after('ktp_name');
            $table->date('ktp_birth_date')->nullable()->after('ktp_birth_place');
            $table->enum('ktp_status', ['pending', 'verified', 'rejected'])->nullable()->after('is_ktp_verified');
            $table->text('ktp_rejection_reason')->nullable()->after('ktp_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ktp_nik', 'ktp_name', 'ktp_birth_place', 'ktp_birth_date', 'ktp_status', 'ktp_rejection_reason']);
        });
    }
};
