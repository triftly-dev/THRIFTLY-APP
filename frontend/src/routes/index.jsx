import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullPageLoader from '../components/common/FullPageLoader'

import Homepage from '../pages/guest/Homepage'
import ProductList from '../pages/guest/ProductList'
import ProductDetail from '../pages/guest/ProductDetail'
import Login from '../pages/auth/Login'
import BuyerRegister from '../pages/buyer/BuyerRegister'
import SellerRegister from '../pages/seller/SellerRegister'

import BuyerDashboard from '../pages/buyer/BuyerDashboard'
import MyOrders from '../pages/buyer/MyOrders'
import Checkout from '../pages/buyer/Checkout'

import SellerDashboard from '../pages/seller/SellerDashboard'
import AddProduct from '../pages/seller/AddProduct'
import MyProducts from '../pages/seller/MyProducts'
import EditProduct from '../pages/seller/EditProduct'
import SellerOrders from '../pages/seller/SellerOrders'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ApprovalQueue from '../pages/admin/ApprovalQueue'
import ManageCategories from '../pages/admin/ManageCategories'
import ReturResolution from '../pages/admin/ReturResolution'
import Transactions from '../pages/admin/Transactions'
import UsersList from '../pages/admin/UsersList'
import AdminComplaints from '../pages/admin/AdminComplaints'

import Chat from '../pages/shared/Chat'
import MyComplaints from '../pages/shared/MyComplaints'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullPageLoader message="Memverifikasi akses..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Toleransi: Jika rute minta 'user', izinkan juga role 'buyer', 'seller', atau 'admin'
    if (allowedRoles.includes('user') && (user.role === 'buyer' || user.role === 'seller' || user.role === 'admin')) {
      return children
    }
    return <Navigate to="/" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<BuyerRegister />} />
      <Route path="/register/buyer" element={<BuyerRegister />} />
      <Route path="/register/seller" element={<SellerRegister />} />

      {/* --- Rute untuk aktifitas pembeli --- */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/pesanan"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/:productId"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Checkout />
          </ProtectedRoute>
        }
      />

      {/* --- Rute untuk aktifitas penjual (Toko) --- */}
      <Route
        path="/toko/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/toko/pesanan"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <SellerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/toko/produk/tambah"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/toko/produk"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/toko/produk/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <EditProduct />
          </ProtectedRoute>
        }
      />

      {/* --- Rute Admin (Tetap Khusus Admin) --- */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approval"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApprovalQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/retur"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReturResolution />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaints />
          </ProtectedRoute>
        }
      />

      {/* --- Rute General (Bisa diakses siapapun yang login sebagai user biasa) --- */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MyComplaints />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
