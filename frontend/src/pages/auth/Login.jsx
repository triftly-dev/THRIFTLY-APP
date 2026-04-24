import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { loginSchema } from '../../utils/validation'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { BUTTONS, PLACEHOLDERS } from '../../constants/copywriting'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await login(data.email, data.password)
    setLoading(false)

    if (result.success) {
      if (result.user.role === 'seller') {
        navigate('/toko/dashboard')
      } else if (result.user.role === 'buyer') {
        navigate('/user/dashboard')
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Container className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Halo Kak!
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Masuk ke akun kamu yuk
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {BUTTONS.login}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register/buyer" className="text-red-600 hover:text-red-700 font-medium">
                  Daftar sebagai Pembeli
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Mau jual barang?{' '}
                <Link to="/register/seller" className="text-red-600 hover:text-red-700 font-medium">
                  Daftar sebagai Penjual
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

export default Login
