# 🛍️ Secondnesia - Luxury Thrift Marketplace

![Secondnesia Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000)

Secondnesia adalah platform marketplace barang bekas (thrift) premium yang menghubungkan pembeli dan penjual dengan sistem pembayaran terintegrasi dan fitur chat real-time.

## ✨ Fitur Utama
- **🛒 Smart Shopping Cart**: Pengalaman checkout yang mulus dengan Midtrans.
- **💬 Real-time Chat**: Komunikasi langsung antara pembeli dan penjual.
- **🛡️ Secure Payment**: Integrasi Payment Gateway (OVO, GoPay, Bank Transfer).
- **📊 Admin Dashboard**: Manajemen produk, approval, dan monitoring transaksi.
- **📱 Responsive Design**: Tampilan premium di mobile maupun desktop.

## 🚀 Tech Stack
- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** React.js + Tailwind CSS
- **Database:** MySQL / SQLite
- **Payment Gateway:** Midtrans Snap SDK

## 🛠️ Instalasi & Setup VPS

### 1. Clone Project
```bash
git clone https://github.com/thriftly-dev/THRIFTLY-APP.git
cd THRIFTLY-APP
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📜 Git Workflow (Standard)
1. `git pull origin main` (Ambil update terbaru)
2. `git add .` (Staging perubahan)
3. `git commit -m "feat: deskripsi perubahan"`
4. `git push origin main` (Kirim ke GitHub)

---
Developed with ❤️ by **Thriftly Dev Team**.
