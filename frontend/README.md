# Secondnesia - Marketplace Barang Bekas

Marketplace barang bekas terpercaya untuk wilayah Jawa Tengah dan DI Yogyakarta dengan sistem middle man yang aman.

## Fitur Utama

### Guest/Pengunjung
- Browse produk dengan filter kategori, kondisi, lokasi
- Search produk
- Section khusus "Barang BU" (Butuh Uang)
- Lihat detail produk lengkap

### Seller (Penjual)
- Registrasi KYC lengkap dengan upload KTP (auto watermark)
- Auto-detect lokasi dengan Geolocation API
- Dashboard dengan statistik produk
- Posting barang dengan 2 opsi:
  - Titip Jual: Dijual ke pembeli lain
  - Jual Putus: Dijual langsung ke platform
- Opsi harga:
  - Tentukan sendiri
  - Ikuti rekomendasi sistem (berdasarkan harga pasaran)
- Manajemen produk (Edit, Hapus, Update Harga)
- Status tracking (Pending, Approved, Rejected)
- Dashboard saldo (Ketahan, Bisa Ditarik)
- Opsi "BU" untuk barang butuh uang cepat

### Buyer (Pembeli)
- Registrasi dengan data lengkap
- Browse dan search produk
- Chat dengan seller untuk negosiasi
- Checkout dengan pilihan ongkir
- Tracking pesanan
- Konfirmasi penerimaan barang
- Request retur dengan instruksi video unboxing

### Admin
- Dashboard overview
- Queue approval produk baru
- Approve/Reject dengan catatan
- Manajemen master kategori
- Pusat resolusi retur
- Manajemen transaksi middle man

## Tech Stack

- **React 18** dengan Vite
- **React Router v6** untuk routing
- **Context API + useReducer** untuk state management
- **Tailwind CSS** untuk styling
- **Lucide React** untuk icon
- **React Hot Toast** untuk notifikasi
- **React Hook Form** untuk form handling
- **Zod** untuk validation
- **LocalStorage** untuk data persistence
- **Canvas API** untuk watermark KTP
- **Geolocation API** untuk auto-detect lokasi

## Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd secondnesia
```

2. Install dependencies
```bash
npm install
```

3. Jalankan development server
```bash
npm run dev
```

4. Buka browser dan akses `http://localhost:5173`

## Akun Demo

Aplikasi sudah dilengkapi dengan seed data untuk testing:

- **Admin**: 
  - Email: `admin@secondnesia.com`
  - Password: `admin123`

- **Seller 1**: 
  - Email: `seller1@test.com`
  - Password: `seller123`

- **Seller 2**: 
  - Email: `seller2@test.com`
  - Password: `seller123`

- **Buyer 1**: 
  - Email: `buyer1@test.com`
  - Password: `buyer123`

## Fitur Khusus

### 1. Auto Watermark KTP
Menggunakan Canvas API untuk menambahkan watermark transparan pada foto KTP:
- Teks: "Hanya untuk verifikasi Secondnesia"
- Timestamp upload
- Posisi diagonal di tengah foto

### 2. Auto-detect Lokasi
- Button "Gunakan Lokasi Saat Ini"
- Geolocation API untuk ambil lat/long
- Reverse geocoding sederhana (mapping ke wilayah Jateng/DIY)

### 3. Sistem Harga Rekomendasi
- Berdasarkan rata-rata harga per kategori dan kondisi
- Algoritma sederhana: ambil median harga dari produk serupa yang sudah approved

### 4. Update Harga = Diskon Otomatis
- Saat seller update harga lebih rendah, harga lama otomatis dicoret
- Badge "DISKON" muncul di card produk

### 5. Badge BU (Butuh Uang)
- Label merah mencolok di card produk
- Section khusus di homepage

### 6. Middle Man Payment Flow
- Pembeli bayar → Saldo masuk "Ketahan"
- Pembeli konfirmasi → Saldo pindah ke "Bisa Ditarik" seller
- Retur → Saldo dikembalikan ke buyer

## Copywriting & Tone of Voice

Semua teks menggunakan bahasa casual Indonesia:

### Sapaan
- "Halo Kak!", "Juragan", "Bosku"

### Tombol Action
- "Sikat Barangnya", "Tanya Dulu Boleh", "Jual Barang Nganggur", "Cairin Duit"

### Status
- "Lagi di-review Mimin" (Pending)
- "Siap Angkut" (Live)
- "Udah Laku" (Sold)

### Error/Empty State
- "Yah, barangnya belum nemu nih. Coba cari kata kunci lain, Bosku!"

## Struktur Project

```
secondnesia/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, Modal, Badge, ProductCard
│   │   └── layout/          # Header, Footer, Container
│   ├── pages/
│   │   ├── auth/            # Login
│   │   ├── guest/           # Homepage, ProductList, ProductDetail
│   │   ├── buyer/           # BuyerRegister, BuyerDashboard, Checkout, MyOrders
│   │   ├── seller/          # SellerRegister, SellerDashboard, AddProduct, MyProducts
│   │   ├── admin/           # AdminDashboard, ApprovalQueue, ManageCategories
│   │   └── shared/          # Chat
│   ├── context/             # AuthContext, AppContext
│   ├── hooks/               # useDebounce, useLocalStorage, useImageUpload
│   ├── utils/               # helpers, watermark, geolocation, validation
│   ├── services/            # localStorage, userService, productService, etc
│   ├── constants/           # categories, locations, conditions, copywriting
│   └── routes/              # App routing
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Wilayah Operasional

- **Jawa Tengah**: Semua kota dan kabupaten
- **DI Yogyakarta**: Yogyakarta, Sleman, Bantul, Kulon Progo, Gunung Kidul

## Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## Catatan Penting

- Semua data disimpan di LocalStorage (per-browser)
- Untuk demo, sudah ada seed data otomatis
- Watermark KTP menggunakan Canvas API (foto di-convert ke base64)
- Geolocation hanya mapping ke nama kota/kabupaten
- Chat system menggunakan LocalStorage (simulasi real-time)
- Video unboxing/packing hanya instruksi ke WA admin (tidak upload video)

## License

MIT

## Contact

Untuk pertanyaan atau support, hubungi:
- Email: support@secondnesia.com
- Phone: 0812-3456-7890
