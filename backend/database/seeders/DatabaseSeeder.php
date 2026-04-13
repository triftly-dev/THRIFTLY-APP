<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Akun Admin
        User::factory()->create([
            'name' => 'Admin Secondnesia',
            'email' => 'admin@secondnesia.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Akun User Terpadu (Satu akun untuk fitur Buyer sekaligus Seller)
        User::factory()->create([
            'name' => 'User Terpadu',
            'email' => 'user@secondnesia.com',
            'password' => bcrypt('password123'),
            'role' => 'user', // Gunakan 'user' sebagai role universal
        ]);
    }
}
