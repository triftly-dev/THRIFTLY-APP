import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, MapPin, Phone, Instagram, Twitter, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group inline-flex">
              <div className="bg-primary-100 p-2 rounded-xl group-hover:bg-primary-200 transition-colors">
                <ShoppingBag className="text-primary-700" size={28} />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Stuffus</span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-sm">
              Marketplace barang bekas terpercaya. Jual beli barang bekas jadi lebih mudah, aman, dan pastinya cuan!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Tentang</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">Tentang Stuffus</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-primary-600 transition-colors">Karir</Link></li>
              <li><Link to="/press" className="text-gray-600 hover:text-primary-600 transition-colors">Press</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-primary-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-gray-600 hover:text-primary-600 transition-colors">Pusat Bantuan</Link></li>
              <li><Link to="/how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">Cara Kerja</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary-600 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-600">
                <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Jawa Tengah & DIY</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Phone size={20} className="text-primary-600 flex-shrink-0" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Mail size={20} className="text-primary-600 flex-shrink-0" />
                <span>halo@stuffus.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col justify-center items-center gap-4 text-center">
          <div className="flex space-x-6 text-sm text-gray-500 mb-2">
            <span>Pembayaran Aman</span>
            <span>Penjual Terverifikasi</span>
            <span>Pengiriman Cepat</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Stuffus Marketplace. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
