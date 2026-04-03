import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { TailwindCartProvider } from './context/TailwindCartContext'
import { TailwindWishlistProvider } from './context/TailwindWishlistContext'
import Footer from './components/layout/Footer'
import TestTemplates        from './pages/TestTemplates'
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
import SavedSearches        from './components/search/SavedSearches'
import TailwindShop         from './pages/tailwind/TailwindShop'
import CheckoutPage         from './pages/tailwind/CheckoutPage'

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
  const { user } = useAuth()
  const showFooter = user

  return (
    <BrowserRouter>
      <TailwindCartProvider>
        <TailwindWishlistProvider>
          <Routes>
            {/* Guest routes */}
            <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

            {/* Tailwind Shop - Public Access */}
            <Route path="/tailwind-shop" element={<TailwindShop />} />
            <Route path="/tailwind-shop/checkout" element={<CheckoutPage />} />

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
            <Route path="/saved-searches"    element={<PrivateRoute><SavedSearches /></PrivateRoute>} />
            <Route path="/test-templates"    element={<TestTemplates />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {showFooter && <Footer />}
        </TailwindWishlistProvider>
      </TailwindCartProvider>
    </BrowserRouter>
  )
}
