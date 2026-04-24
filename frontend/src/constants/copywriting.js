export const GREETINGS = {
  default: 'Halo Kak!',
  seller: 'Halo Juragan!',
  buyer: 'Halo Bosku!',
  admin: 'Halo Mimin!'
}

export const BUTTONS = {
  buy: 'Sikat Barangnya',
  chat: 'Tanya Dulu Boleh',
  sell: 'Jual Barang Nganggur',
  withdraw: 'Cairin Duit',
  checkout: 'Gas Checkout',
  continue: 'Oke, Lanjut!',
  save: 'Simpan Dulu',
  cancel: 'Gak Jadi Deh',
  edit: 'Edit Aja',
  delete: 'Hapus Aja',
  approve: 'Oke, Tayangin',
  reject: 'Tolak Dulu',
  confirm: 'Udah Sampai Nih',
  retur: 'Ada Masalah Nih',
  upload: 'Upload Foto',
  useLocation: 'Pake Lokasi Sekarang',
  search: 'Cari Barang',
  filter: 'Filter Dulu',
  login: 'Masuk Yuk',
  register: 'Daftar Sekarang',
  logout: 'Keluar'
}

export const STATUS = {
  pending: 'Lagi di-review Mimin',
  approved: 'Siap Angkut',
  rejected: 'Ditolak Mimin',
  sold: 'Udah Laku',
  shipped: 'Barang Lagi Jalan',
  completed: 'Transaksi Selesai',
  retur: 'Lagi Proses Retur'
}

export const EMPTY_STATES = {
  noProducts: 'Yah, barangnya belum nemu nih. Coba cari kata kunci lain, Bosku!',
  noSellerProducts: 'Belum ada barang yang dijual nih. Yuk mulai jual barang nganggur!',
  noOrders: 'Belum ada pesanan nih. Yuk mulai belanja!',
  noMessages: 'Belum ada chat masuk. Tenang aja, nanti juga ada yang chat!',
  noNotifications: 'Belum ada notifikasi baru nih.',
  noApprovalQueue: 'Yeay! Semua produk udah di-review semua!'
}

export const ERRORS = {
  general: 'Waduh, ada yang salah nih. Coba lagi ya, Kak!',
  network: 'Koneksi internet bermasalah nih. Cek koneksi dulu ya!',
  notFound: 'Halaman yang kamu cari gak ketemu nih.',
  unauthorized: 'Eh, kamu belum login nih. Login dulu yuk!',
  forbidden: 'Waduh, kamu gak punya akses ke halaman ini.',
  validation: 'Ada yang belum diisi nih. Cek lagi ya!',
  uploadFailed: 'Upload foto gagal nih. Coba lagi ya!',
  uploadSize: 'Foto kegedean nih. Maksimal 5MB ya!',
  uploadFormat: 'Format foto gak didukung. Pake JPG, PNG, atau JPEG aja ya!'
}

export const SUCCESS = {
  productCreated: 'Mantap! Produk berhasil diajukan. Tunggu review dari Mimin ya!',
  productUpdated: 'Oke, produk berhasil diupdate!',
  productDeleted: 'Produk berhasil dihapus.',
  priceUpdated: 'Harga berhasil diupdate! Sekarang ada label diskon loh.',
  orderCreated: 'Pesanan berhasil dibuat! Segera transfer ya.',
  orderConfirmed: 'Makasih udah konfirmasi! Saldo seller udah dicairin.',
  approved: 'Produk berhasil di-approve! Sekarang udah tayang.',
  rejected: 'Produk berhasil ditolak. Seller udah dikasih tau.',
  messageSent: 'Pesan terkirim!',
  registered: 'Akun berhasil dibuat! Selamat datang di Secondnesia!',
  login: 'Login berhasil! Selamat datang kembali!',
  logout: 'Logout berhasil. Sampai jumpa lagi!'
}

export const LABELS = {
  bu: 'BU',
  discount: 'DISKON',
  new: 'BARU',
  sold: 'SOLD',
  featured: 'PILIHAN MIMIN'
}

export const PLACEHOLDERS = {
  search: 'Cari barang yang kamu mau...',
  productName: 'Contoh: iPhone 12 Pro Max 128GB',
  price: 'Contoh: 5000000',
  description: 'Ceritain kondisi barang kamu sedetail mungkin ya...',
  location: 'Pilih lokasi kamu',
  message: 'Ketik pesan kamu di sini...',
  email: 'email@example.com',
  password: 'Minimal 6 karakter ya',
  name: 'Nama lengkap kamu',
  phone: '08xxxxxxxxxx',
  address: 'Alamat lengkap kamu',
  accountNumber: 'Nomor rekening',
  adminNote: 'Kasih catatan ke seller (opsional)'
}

export const INSTRUCTIONS = {
  uploadPhoto: 'Upload minimal 3 foto, maksimal 5 foto. Pastikan fotonya jelas ya!',
  uploadKTP: 'Upload foto KTP kamu. Nanti otomatis dikasih watermark kok, aman!',
  selectLocation: 'Pilih lokasi kamu atau pake tombol "Pake Lokasi Sekarang"',
  priceRecommendation: 'Sistem bakal kasih rekomendasi harga berdasarkan harga pasaran. Biar cepet laku!',
  negotiation: 'Chat seller dulu buat nego harga. Kalo udah deal, seller bakal update harganya.',
  shipping: 'Pilih siapa yang nanggung ongkir. Bisa pembeli atau penjual.',
  retur: 'Kalo ada masalah, wajib kirim video unboxing ke WA admin ya!',
  videoPacking: 'Seller wajib kirim video packing barang ke WA admin sebelum kirim barang.',
  buOption: 'Centang ini kalo kamu butuh uang cepet. Barang kamu bakal muncul di section khusus "Barang BU".'
}

export const SECTIONS = {
  buProducts: 'Barang BU (Butuh Uang)',
  newProducts: 'Barang Baru Masuk',
  popularProducts: 'Lagi Banyak Dicari',
  categories: 'Kategori Populer',
  myProducts: 'Barang Jualan Kamu',
  myOrders: 'Pesanan Kamu',
  approvalQueue: 'Antrian Review Produk',
  returQueue: 'Antrian Retur'
}

export const TABS = {
  all: 'Semua',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  sold: 'Terjual',
  active: 'Aktif',
  completed: 'Selesai'
}
