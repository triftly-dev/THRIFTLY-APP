# Ringkasan Perubahan Fitur Rekening Bank ala Tokopedia & Pembersihan Header (Thriftly)

Berikut adalah panduan lengkap file yang disesuaikan untuk fitur **Rekening Bank Multi-Akun ala Tokopedia** (bisa tambah & hapus banyak rekening dengan modal verifikasi nama pemilik) serta **penghapusan tombol "Jual Barang Nganggur"**.

---

## 📂 File yang Telah Dimodifikasi & Logika Baru

### 1. Sisi Frontend (React) - `e:\triftly\frontend`
*   **`src/components/layout/Header.jsx`**
    *   **Perubahan:** Menghapus tombol **"Jual Barang Nganggur"** (`BUTTONS.sell`) dari navigasi header seller, menyisakan hanya tombol **"Dashboard Penjualan"** untuk tampilan navigasi yang lebih bersih dan rapi.
*   **`src/pages/shared/settings/Settings.jsx`**
    *   **Perubahan:** 
        *   Menghapus input form "Metode Penarikan / Rekening Bank" yang lama dari Tab Profil.
        *   Menambahkan menu baru **"Rekening Bank"** di sidebar pengaturan sebelah kiri (sejajar dengan Profil, Alamat, dan Keamanan).
        *   Merender antarmuka daftar rekening bank premium (menampilkan logo spesifik bank seperti BCA, BRI, BNI, Jago, CIMB Niaga, nomor rekening, nama pemilik, dan tombol **Hapus**).
        *   Mengintegrasikan **Modal Popup "Mau tambah rekening apa?"** persis seperti Tokopedia:
            *   Dropdown pilihan bank utama Indonesia.
            *   Input nomor rekening dengan tombol hijau **"Cek Nama Pemilik"** di dalam input.
            *   Simulasi verifikasi pemilik rekening selama 1 detik (spinner) yang akan otomatis mengisi "Atas Nama" dengan nama terverifikasi Anda secara otomatis (dilengkapi centang hijau premium).
            *   Tombol "Tambah Rekening" terkunci sampai pemilik rekening berhasil diverifikasi.

### 2. Sisi Backend (Laravel) - `e:\triftly\backend`
*   **`database/migrations/2026_05_18_150000_create_bank_accounts_table.php`**
    *   **Perubahan:** Membuat tabel database baru `bank_accounts` untuk menyimpan data bank, nomor rekening, dan nama pemilik.
*   **`app/Models/BankAccount.php`**
    *   **Perubahan:** Membuat model baru dengan relasi `belongsTo` ke `User`.
*   **`app/Models/User.php`**
    *   **Perubahan:** Menambahkan relasi `hasMany` (`bankAccounts()`) ke model `BankAccount`.
*   **`app/Http/Controllers/BankAccountController.php`**
    *   **Perubahan:** Membuat controller API dengan endpoint:
        *   `GET /bank-accounts` (Daftar semua rekening user).
        *   `POST /bank-accounts` (Tambah rekening baru, sekaligus otomatis mensinkronkan nomor rekening utama di tabel `users` jika masih kosong).
        *   `DELETE /bank-accounts/{id}` (Hapus rekening tertentu, dan otomatis meng-update nomor rekening utama di tabel `users` dengan rekening lain yang tersisa).
*   **`routes/api.php`**
    *   **Perubahan:** Mendaftarkan 3 rute API baru di dalam grup middleware `auth:sanctum`.

---

## 💻 Perintah Git Push Manual (Masuk ke Masing-masing Folder)

### 1. Perintah Git untuk Frontend (React)
Jalankan perintah ini di dalam folder `frontend`:

```powershell
# 1. Masuk ke folder frontend
cd e:\triftly\frontend

# 2. Cek file yang berubah
git status

# 3. Tambahkan perubahan ke staging area
git add src/components/layout/Header.jsx src/pages/shared/settings/Settings.jsx

# 4. Buat commit pesan perubahan
git commit -m "feat: add Tokopedia-style multi bank account settings and remove Jual Barang Nganggur button"

# 5. Push perubahan ke repository remote (Vercel Anda)
git push origin main
```

### 2. Perintah Git untuk Backend (Laravel)
Jalankan perintah ini di dalam folder `backend`:

```powershell
# 1. Masuk ke folder backend
cd e:\triftly\backend

# 2. Cek file backend yang berubah
git status

# 3. Tambahkan perubahan ke staging area (termasuk file baru untracked)
git add app/Models/User.php routes/api.php app/Http/Controllers/BankAccountController.php app/Models/BankAccount.php database/migrations/2026_05_18_150000_create_bank_accounts_table.php

# 4. Buat commit pesan perubahan
git commit -m "feat: add bank_accounts database migration, BankAccount model, and BankAccountController API"

# 5. Push perubahan backend ke repository remote Anda
git push origin main
```

---

## ☁️ Perintah Git Pull & Deploy di VPS (Server Produksi)

Buka terminal SSH VPS Anda, lalu jalankan perintah berikut:

### A. Deploy Sisi Backend (Laravel) di VPS
```bash
# 1. Masuk ke folder Laravel backend di VPS Anda
cd /var/www/thriftly-backend # (Sesuaikan dengan path backend di VPS Anda)

# 2. Ambil pembaruan kode terbaru
git pull origin main

# 3. Jalankan migrasi database agar tabel baru 'bank_accounts' terbuat di database VPS
php artisan migrate --force

# 4. Bersihkan cache Laravel agar rute diperbarui
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### B. Deploy Sisi Frontend (React) di VPS
```bash
# 1. Masuk ke folder React frontend di VPS Anda
cd /var/www/thriftly-frontend # (Sesuaikan dengan path frontend di VPS Anda)

# 2. Ambil pembaruan kode terbaru
git pull origin main

# 3. Bangun ulang production build
npm run build
```
