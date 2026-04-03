import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider }         from './context/AuthContext.jsx'
import { CartProvider }         from './context/CartContext.jsx'
import { ThemeProvider }        from './context/ThemeContext.jsx'
import { WishlistProvider }     from './context/WishlistContext.jsx'
import { ToastProvider }        from './components/ui/Toast/ToastContext.jsx'
import { SocketProvider }       from './context/SocketContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { useAuth }              from './context/AuthContext.jsx'
import './index.css'

// SocketWrapper reads token from AuthContext so it reacts to login/logout
export const AppProviders = ({ children }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const content = (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <NotificationProvider>
                <SocketWrapper>{children}</SocketWrapper>
              </NotificationProvider>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )

  return googleClientId
    ? <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
    : content
}

export const SocketWrapper = ({ children }) => {
  const { user } = useAuth();
  const token = user ? localStorage.getItem('accessToken') : null;
  return <SocketProvider token={token}>{children}</SocketProvider>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
)
