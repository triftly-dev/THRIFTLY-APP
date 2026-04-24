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

        // Akun Admin Utama
        User::updateOrCreate(
            ['email' => 'admin@thriftly.my.id'],
            [
                'name' => 'Thriftly Admin',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
            ]
        );

        // Akun User Terpadu (Satu akun untuk fitur Buyer sekaligus Seller)
        $user = User::factory()->create([
            'name' => 'User Terpadu',
            'email' => 'user@secondnesia.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
        ]);

        // Tambahkan Produk Asli dari Database Sebelumnya
        \App\Models\Product::create([
            'user_id' => $user->id,
            'name' => 'Iphone 17 Pro Max Second',
            'description' => 'The iPhone 17 Pro Max has a 6.9-inch OLED display with a 120Hz refresh rate. It is powered by the A19 Pro chip and has 8GB of RAM.',
            'price' => 17000000,
            'stock' => 10,
            'category' => 'Electronic',
            'location' => 'Surakarta',
            'status' => 'approved',
            'images' => ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800'],
        ]);

        \App\Models\Product::create([
            'user_id' => $user->id,
            'name' => 'Baju Adidas Original',
            'description' => 'Baju Adidas original kondisi sangat bagus, jarang dipakai.',
            'price' => 250000,
            'stock' => 5,
            'category' => 'Fashion',
            'location' => 'Surakarta',
            'status' => 'approved',
            'images' => ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'],
        ]);
    }
}
