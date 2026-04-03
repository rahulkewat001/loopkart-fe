import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import ForgotPasswordPage   from './pages/auth/ForgotPasswordPage'
import HomePage             from './pages/home/HomePage'
import CartPage             from './pages/cart/CartPage'
import OrdersPage           from './pages/orders/OrdersPage'
import ProfilePage          from './pages/profile/ProfilePage'
import ProductDetailPage    from './pages/product/ProductDetailPage'
import WishlistPage         from './pages/wishlist/WishlistPage'
import AdminPage            from './pages/admin/AdminPage'
import BecomeSeller         from './pages/seller/BecomeSeller'
import SellerDashboard      from './pages/seller/SellerDashboard'
import ChatPage             from './pages/chat/ChatPage'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader">Loading...</div>
  return user ? children : <Navigate to="/?auth=login" replace />
}

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/login"       element={<Navigate to="/?auth=login" replace />} />
        <Route path="/register"    element={<Navigate to="/?auth=signup" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Private routes */}
        <Route path="/cart"        element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/orders"      element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/wishlist"          element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/admin"             element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/become-seller"     element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />
        <Route path="/seller/dashboard"  element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
        <Route path="/chat"              element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/chat/:chatId"      element={<PrivateRoute><ChatPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
