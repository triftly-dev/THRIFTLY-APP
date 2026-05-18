# Panduan Developer: Integrasi Fitur KYC KTP, Rekening Bank Otomatis & Pembersihan Registrasi Seller (Thriftly)

Panduan ini disusun untuk rekan frontend developer Anda agar dapat menduplikasi, memahami, dan memelihara seluruh perubahan kode pada file `.jsx` / `.js` yang telah disesuaikan.

---

## 📂 1. Pembersihan Fitur Rekening & Verifikasi KTP dari Halaman Register
Agar proses pendaftaran toko (*register seller*) instan dan tanpa hambatan, input KTP dan data rekening bank dipindahkan sepenuhnya ke halaman **Pengaturan Akun (KYC)** setelah pengguna login.

### A. File: `src/pages/seller/SellerRegister.jsx`
*   **Tindakan:** 
    *   Hapus state `ktpPreview` dan state file KTP dari form.
    *   Hapus elemen input file KTP, input nomor rekening, dan watermark dari markup HTML form registrasi.
    *   Proses kirim data (`onSubmit`) kini hanya mengirimkan profil dasar: `nama`, `email`, `password`, `noTelp`, `alamat`, `lokasi` (koordinat peta), dan `date_of_birth`.

### B. File: `src/utils/validation.js`
*   **Tindakan:** Ubah skema validasi Zod (`registerSellerSchema`) agar field nomor rekening dan foto KTP bersifat opsional.
*   **Kode Skema Zod:**
    ```javascript
    export const registerSellerSchema = z.object({
      email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
      password: z.string().min(6, 'Password minimal 6 karakter'),
      confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
      nama: z.string().min(3, 'Nama minimal 3 karakter ya'),
      ttl: z.string().min(1, 'Tanggal lahir wajib diisi'),
      noTelp: z.string().min(10, 'Nomor telepon tidak valid'),
      alamat: z.string().min(10, 'Alamat minimal 10 karakter ya'),
      lokasi: z.string().min(1, 'Lokasi wajib dipilih'),
      
      // DIUBAH MENJADI OPSIONAL:
      noRekening: z.string().optional(),
      ktpUrl: z.string().optional()
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Password konfirmasi tidak sama',
      path: ['confirmPassword']
    })
    ```

---

## 🔒 2. Fitur Unggah KTP Premium (Kamera Langsung dengan Blueprint Overlay & File Lokal)
Pengguna dapat mengunggah KTP mereka dengan memilih file dari galeri atau memotret kartu KTP secara langsung menggunakan kamera/webcam.

### File: `src/pages/shared/settings/Settings.jsx`
1.  **State Baru untuk Kamera:**
    ```javascript
    const [isUploadChoiceOpen, setIsUploadChoiceOpen] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    ```
2.  **Fungsi Penanganan Kamera:**
    *   `startCamera`: Mengaktifkan webcam / kamera belakang HP menggunakan API `navigator.mediaDevices.getUserMedia` dengan resolusi ideal `1280x720` dan mengarahkannya ke `<video>` stream.
    *   `capturePhoto`: Mengambil frame video dari canvas, mengonversinya menjadi File Blob, memberikan watermark pengaman otomatis, dan menyimpannya ke state `ktp_image`.
    *   `stopCamera`: Mematikan track media stream kamera agar lampu LED kamera mati setelah modal ditutup.
3.  **Proses Watermark Pengaman Otomatis (`processKtpImage`):**
    *   Mengimpor dinamis `addWatermarkToImage` dari `src/utils/watermark.js`.
    *   Menerapkan watermark bertuliskan **"HANYA UNTUK VERIFIKASI AKUN THRIFTLY"** di atas file gambar sebelum diunggah ke backend.
4.  **Overlay Blueprint Visual Panduan KTP:**
    Di dalam modal live camera feed, ditambahkan overlay visual samar (`opacity-30`) berupa:
    *   *Sisi Kiri:* Garis-garis horizontal samar pemandu posisi kolom data KTP (NIK, Nama, Alamat, dll).
    *   *Sisi Kanan:* Kotak berikon user sebagai pemandu posisi pas foto wajah KTP.
    *   *Kode JSX Overlay:*
        ```javascript
        <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none flex items-center justify-center">
          <div className="w-[85%] h-[60%] border-2 border-dashed border-white rounded-xl relative flex items-center px-4 bg-black/10">
            {/* Visual Blueprint Alignment Guide */}
            <div className="absolute inset-0 flex items-center justify-between p-6 opacity-30 select-none pointer-events-none">
              {/* Left Side: Dotted Text Lines */}
              <div className="w-[60%] space-y-3">
                <div className="h-3 w-[70%] bg-white/80 rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-1.5 w-[90%] bg-white/50 rounded" />
                  <div className="h-1.5 w-[80%] bg-white/50 rounded" />
                  <div className="h-1.5 w-[95%] bg-white/50 rounded" />
                  <div className="h-1.5 w-[60%] bg-white/50 rounded" />
                  <div className="h-1.5 w-[75%] bg-white/50 rounded" />
                </div>
              </div>
              {/* Right Side: Photo Box Placeholder */}
              <div className="flex flex-col items-center justify-center w-[80px] h-[100px] border border-white/50 rounded-lg bg-white/10 shrink-0">
                <User size={24} className="text-white/60" />
                <span className="text-[6px] text-white/50 uppercase mt-1 tracking-wider font-bold">FOTO</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-4 text-center z-10">
              <span className="bg-black/60 text-white font-bold text-[10px] px-3 py-1 rounded-full tracking-wide uppercase">Posisikan KTP di dalam kotak</span>
            </div>
          </div>
        </div>
        ```

---

## 🏦 3. Form Rekening Bank Otomatis (Bebas Biaya API Berbayar)
Untuk menghindari biaya API Inquiry Bank yang berbayar di produksi, tombol "Cek Nama Pemilik" dihapus dan digantikan dengan sistem **auto-fill otomatis yang tetap dapat diedit oleh user**.

### File: `src/pages/shared/settings/Settings.jsx`
1.  **Daftar Pilihan Bank Terlengkap Indonesia:**
    *   Dropdown `<select>` diperluas dengan 16 bank nasional utama (BCA, Mandiri, BRI, BNI, BSI, Bank Jago, CIMB Niaga, dll) dengan badge visual custom (`getBankBadge`) sesuai warna korporat resmi masing-masing bank.
2.  **Auto-fill Nama Pemilik Rekening:**
    *   Saat tombol "Tambah Rekening" diklik untuk membuka modal, sistem secara otomatis mengambil nama pengguna saat ini (jika user demo `seller1`, diisi **"DERANDA BAGAS PAMUNGKAS"**) dan mempopularkannya langsung ke input "Nama Pemilik Rekening" dalam format kapital.
3.  **Input Editable Sederhana:**
    *   Pengguna dapat langsung melihat namanya sudah terisi. Jika terdapat sedikit perbedaan nama dengan buku tabungan, pengguna dapat mengedit input tersebut secara bebas sebelum menekan tombol submit.
    *   Submit data langsung berjalan secara instan dan gratis tanpa validasi eksternal berbayar yang mengunci.

---

## 📋 4. Halaman Tambah Produk: Popup 4-Step Checklist Verifikasi Seller Baru
Saat seller pertama kali ingin menambah produk baru, sistem akan memblokir tindakan tersebut jika seller belum melengkapi 4 syarat keamanan penting, lalu mengarahkannya langsung ke tab pengaturan yang relevan.

### File: `src/pages/seller/AddProduct.jsx`
*   **Logika Pengecekan Syarat (Checks):**
    1.  **Verifikasi Email** (`user?.email_verified_at`) -> Mengarahkan ke tab `'profile'`.
    2.  **Verifikasi WhatsApp OTP** (`user?.phone_verified_at`) -> Mengarahkan ke tab `'profile'`.
    3.  **Verifikasi Identitas KTP** (`user?.is_ktp_verified`) -> Mengarahkan ke tab `'security'`.
    4.  **Hubungkan Rekening Bank** (`user?.no_rekening`) -> Mengarahkan langsung ke tab `'bank'` (tab khusus Rekening Bank yang telah kita buat).
*   **Redirect Presisi:**
    *   Tautan aksi pada baris "Hubungkan Rekening Bank" diubah dari semula `'profile'` menjadi:
        ```javascript
        navigate('/profile', { state: { activeTab: 'bank' } })
        ```
    *   Hal ini memastikan pengguna yang mengklik baris tersebut langsung disambut oleh menu pengelolaan rekening bank secara akurat.
