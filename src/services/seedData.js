import { userService } from './userService'
import { productService } from './productService'
import { storage, STORAGE_KEYS } from './localStorage'

// Real Unsplash images for products
const IMAGES = {
  phone: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=800&auto=format&fit=crop',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
  robot: 'https://images.unsplash.com/photo-1589828138988-121f06f521d9?q=80&w=800&auto=format&fit=crop', // Vacuum
  cctv: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop',
  lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
  chair: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop',
  keyboard: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800&auto=format&fit=crop',
  ktp: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop' // Placeholder for ID
}

export const seedDatabase = () => {
  const existingUsers = userService.getAllUsers()
  if (existingUsers.length > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database...')

  const admin = userService.createUser({
    email: 'admin@stuffus.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      nama: 'Admin Stuffus',
      lokasi: 'semarang'
    }
  })

  const seller1 = userService.createUser({
    email: 'seller1@test.com',
    password: 'seller123',
    role: 'seller',
    profile: {
      nama: 'Budi Santoso',
      ttl: '1990-05-15',
      alamat: 'Jl. Pemuda No. 123, Semarang',
      noRekening: '1234567890',
      ktpUrl: IMAGES.ktp,
      lokasi: 'semarang',
      noTelp: '081234567890'
    }
  })

  const seller2 = userService.createUser({
    email: 'seller2@test.com',
    password: 'seller123',
    role: 'seller',
    profile: {
      nama: 'Siti Nurhaliza',
      ttl: '1992-08-20',
      alamat: 'Jl. Malioboro No. 45, Yogyakarta',
      noRekening: '0987654321',
      ktpUrl: IMAGES.ktp,
      lokasi: 'yogyakarta',
      noTelp: '081298765432'
    }
  })

  const buyer1 = userService.createUser({
    email: 'buyer1@test.com',
    password: 'buyer123',
    role: 'buyer',
    profile: {
      nama: 'Ahmad Rizki',
      alamat: 'Jl. Solo No. 67, Surakarta',
      lokasi: 'surakarta',
      noTelp: '081345678901'
    }
  })

  const products = [
    {
      sellerId: seller1.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Phone Holder Sakti',
      harga: 150000,
      kategori: 'elektronik-gadget',
      kondisi: 'like-new',
      deskripsi: 'Premium phone holder with magnetic attachment and 360-degree rotation. Perfect for your desk setup or car dashboard. Barely used, condition is like new.',
      lokasi: 'semarang',
      isBU: false,
      fotos: [IMAGES.phone]
    },
    {
      sellerId: seller1.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Headsound Pro Wireless',
      harga: 1200000,
      kategori: 'elektronik-gadget',
      kondisi: 'bagus',
      deskripsi: 'High-fidelity wireless headphones with active noise cancellation. Deep bass, crisp highs, and 30-hour battery life. Comes with original carrying case.',
      lokasi: 'semarang',
      isBU: true,
      fotos: [IMAGES.headphones]
    },
    {
      sellerId: seller2.id,
      tipeJual: 'titip',
      opsiHarga: 'sistem',
      nama: 'Adudu Cleaner Robot',
      harga: 2500000,
      kategori: 'rumah-tangga',
      kondisi: 'bagus',
      deskripsi: 'Smart robot vacuum cleaner that maps your home and cleans efficiently. Can be controlled via smartphone app. Great condition, recently replaced the brushes.',
      lokasi: 'yogyakarta',
      isBU: false,
      fotos: [IMAGES.robot]
    },
    {
      sellerId: seller2.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'CCTV Maling 360',
      harga: 450000,
      kategori: 'elektronik-gadget',
      kondisi: 'like-new',
      deskripsi: 'Smart home security camera with 360-degree view, night vision, and motion detection. Connects to WiFi and sends alerts to your phone. Like new condition.',
      lokasi: 'yogyakarta',
      isBU: true,
      fotos: [IMAGES.cctv]
    },
    {
      sellerId: seller1.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Minimalist Desk Lamp',
      harga: 350000,
      kategori: 'rumah-tangga',
      kondisi: 'bagus',
      deskripsi: 'Sleek and modern desk lamp with adjustable brightness and color temperature. Perfect for late-night working or reading. Matte black finish.',
      lokasi: 'semarang',
      isBU: false,
      fotos: [IMAGES.lamp]
    },
    {
      sellerId: seller2.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Ergonomic Office Chair',
      harga: 1800000,
      kategori: 'rumah-tangga',
      kondisi: 'oke',
      deskripsi: 'Comfortable ergonomic chair with lumbar support and breathable mesh back. Has some signs of wear but still fully functional and very comfortable.',
      lokasi: 'yogyakarta',
      isBU: true,
      fotos: [IMAGES.chair]
    },
    {
      sellerId: seller1.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Mechanical Keyboard K2',
      harga: 850000,
      kategori: 'elektronik-gadget',
      kondisi: 'like-new',
      deskripsi: 'Wireless mechanical keyboard with brown switches. Great tactile feel without being too loud. Includes Mac and Windows keycaps. Barely used.',
      lokasi: 'semarang',
      isBU: false,
      fotos: [IMAGES.keyboard]
    },
    {
      sellerId: seller2.id,
      tipeJual: 'titip',
      opsiHarga: 'sendiri',
      nama: 'Coffee Maker Pro',
      harga: 1150000,
      kategori: 'rumah-tangga',
      kondisi: 'bagus',
      deskripsi: 'Programmable coffee maker with built-in grinder. Wake up to fresh coffee every morning. Well maintained and cleaned regularly.',
      lokasi: 'yogyakarta',
      isBU: true,
      fotos: [IMAGES.coffee]
    }
  ]

  products.forEach(productData => {
    const product = productService.createProduct(productData)
    productService.approveProduct(product.id, 'Approved for marketplace')
  })

  console.log('Database seeded successfully!')
}

export const clearDatabase = () => {
  storage.set(STORAGE_KEYS.USERS, [])
  storage.set(STORAGE_KEYS.PRODUCTS, [])
  storage.set(STORAGE_KEYS.TRANSACTIONS, [])
  storage.set(STORAGE_KEYS.MESSAGES, [])
  storage.remove(STORAGE_KEYS.CURRENT_USER)
  console.log('Database cleared!')
}
