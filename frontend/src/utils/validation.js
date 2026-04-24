import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email gak valid nih'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter ya')
})

export const registerBuyerSchema = z.object({
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email gak valid nih'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter ya'),
  confirmPassword: z.string()
    .min(1, 'Konfirmasi password wajib diisi'),
  nama: z.string()
    .min(3, 'Nama minimal 3 karakter ya'),
  noTelp: z.string()
    .min(10, 'Nomor telepon gak valid nih')
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon: 08xxxxxxxxxx'),
  alamat: z.string()
    .min(10, 'Alamat minimal 10 karakter ya'),
  lokasi: z.string()
    .min(1, 'Lokasi wajib dipilih')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password gak sama nih',
  path: ['confirmPassword']
})

export const registerSellerSchema = z.object({
  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email gak valid nih'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter ya'),
  confirmPassword: z.string()
    .min(1, 'Konfirmasi password wajib diisi'),
  nama: z.string()
    .min(3, 'Nama minimal 3 karakter ya'),
  ttl: z.string()
    .min(1, 'Tanggal lahir wajib diisi'),
  noTelp: z.string()
    .min(10, 'Nomor telepon gak valid nih')
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon: 08xxxxxxxxxx'),
  alamat: z.string()
    .min(10, 'Alamat minimal 10 karakter ya'),
  lokasi: z.string()
    .min(1, 'Lokasi wajib dipilih'),
  noRekening: z.string()
    .min(8, 'Nomor rekening minimal 8 digit ya'),
  ktpUrl: z.string()
    .min(1, 'Foto KTP wajib diupload')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password gak sama nih',
  path: ['confirmPassword']
})

export const productSchema = z.object({
  nama: z.string()
    .min(5, 'Nama produk minimal 5 karakter ya')
    .max(100, 'Nama produk maksimal 100 karakter'),
  harga: z.number()
    .min(1000, 'Harga minimal Rp 1.000')
    .max(1000000000, 'Harga maksimal Rp 1 Miliar'),
  stok: z.number()
    .min(0, 'Stok tidak boleh minus'),
  kategori: z.string()
    .min(1, 'Kategori wajib dipilih'),
  kondisi: z.string()
    .min(1, 'Kondisi wajib dipilih'),
  deskripsi: z.string()
    .min(20, 'Deskripsi minimal 20 karakter ya. Ceritain detail kondisi barangnya!')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),
  lokasi: z.string()
    .min(1, 'Lokasi wajib dipilih'),
  tipeJual: z.enum(['titip', 'putus'], {
    errorMap: () => ({ message: 'Pilih tipe penjualan' })
  }),
  opsiHarga: z.enum(['sendiri', 'sistem'], {
    errorMap: () => ({ message: 'Pilih opsi harga' })
  }),
  isBU: z.boolean().optional(),
  fotos: z.array(z.string())
    .min(3, 'Upload minimal 3 foto ya')
    .max(5, 'Maksimal 5 foto aja')
})

export const checkoutSchema = z.object({
  alamatPengiriman: z.object({
    nama: z.string().min(1, 'Nama penerima wajib diisi'),
    noTelp: z.string()
      .min(10, 'Nomor telepon gak valid nih')
      .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon: 08xxxxxxxxxx'),
    alamat: z.string().min(10, 'Alamat minimal 10 karakter ya'),
    lokasi: z.string().min(1, 'Lokasi wajib dipilih')
  }),
  ongkirDitanggung: z.enum(['buyer', 'seller'], {
    errorMap: () => ({ message: 'Pilih siapa yang nanggung ongkir' })
  }),
  ongkir: z.number().min(0, 'Ongkir gak boleh minus')
})

export const messageSchema = z.object({
  message: z.string()
    .min(1, 'Pesan gak boleh kosong')
    .max(500, 'Pesan maksimal 500 karakter')
})

export const adminNoteSchema = z.object({
  adminNote: z.string()
    .min(10, 'Catatan minimal 10 karakter ya')
    .max(500, 'Catatan maksimal 500 karakter')
})

export const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

  if (!file) {
    return { valid: false, error: 'File wajib diupload' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Foto kegedean nih. Maksimal 5MB ya!' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format foto gak didukung. Pake JPG, PNG, atau JPEG aja ya!' }
  }

  return { valid: true }
}

export const validateMultipleFiles = (files, min = 1, max = 5) => {
  if (!files || files.length < min) {
    return { valid: false, error: `Upload minimal ${min} foto ya` }
  }

  if (files.length > max) {
    return { valid: false, error: `Maksimal ${max} foto aja` }
  }

  for (let file of files) {
    const validation = validateFile(file)
    if (!validation.valid) {
      return validation
    }
  }

  return { valid: true }
}
