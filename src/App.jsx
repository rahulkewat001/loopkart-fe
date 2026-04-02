import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage            from './pages/auth/LoginPage'
import RegisterPage         from './pages/auth/RegisterPage'
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
  return user ? children : <Navigate to="/login" replace />
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader">Loading...</div>
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes */}
        <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Private routes */}
        <Route path="/"            element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/cart"        element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/orders"      element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/product/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
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
