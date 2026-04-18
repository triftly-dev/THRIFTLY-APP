import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { registerBuyerSchema } from '../../utils/validation'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { ALL_LOCATIONS } from '../../constants/locations'
import { BUTTONS, PLACEHOLDERS } from '../../constants/copywriting'

const BuyerRegister = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerBuyerSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await registerUser({
      email: data.email,
      password: data.password,
      role: 'buyer',
      profile: {
        nama: data.nama,
        noTelp: data.noTelp,
        alamat: data.alamat,
        lokasi: data.lokasi
      }
    })
    setLoading(false)

    if (result.success) {
      navigate('/user/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daftar sebagai Pembeli
            </h1>
            <p className="text-gray-600 mb-6">
              Isi data diri kamu untuk mulai belanja
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.email}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={PLACEHOLDERS.password}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password *
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={PLACEHOLDERS.password}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  {...register('nama')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.name}
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  {...register('noTelp')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.phone}
                />
                {errors.noTelp && (
                  <p className="text-red-500 text-sm mt-1">{errors.noTelp.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  {...register('alamat')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.address}
                />
                {errors.alamat && (
                  <p className="text-red-500 text-sm mt-1">{errors.alamat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi *
                </label>
                <select
                  {...register('lokasi')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih Lokasi</option>
                  <optgroup label="DI Yogyakarta">
                    {ALL_LOCATIONS.filter(loc => loc.provinsi === 'DI Yogyakarta').map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.nama}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Jawa Tengah">
                    {ALL_LOCATIONS.filter(loc => loc.provinsi === 'Jawa Tengah').map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.nama}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.lokasi && (
                  <p className="text-red-500 text-sm mt-1">{errors.lokasi.message}</p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {BUTTONS.register}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default BuyerRegister
