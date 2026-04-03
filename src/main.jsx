import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider }         from './context/AuthContext.jsx'
import { CartProvider }         from './context/CartContext.jsx'
import { WishlistProvider }     from './context/WishlistContext.jsx'
import { ToastProvider }        from './components/ui/Toast/ToastContext.jsx'
import { SocketProvider }       from './context/SocketContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ThemeProvider }        from './context/ThemeContext.jsx'
import { LanguageProvider }     from './context/LanguageContext.jsx'
import { useAuth }              from './context/AuthContext.jsx'
import './index.css'

// SocketWrapper reads token from AuthContext so it reacts to login/logout
const SocketWrapper = ({ children }) => {
  const { user } = useAuth();
  const token = user ? localStorage.getItem('accessToken') : null;
  return <SocketProvider token={token}>{children}</SocketProvider>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <SocketWrapper>
                      <App />
                    </SocketWrapper>
                  </NotificationProvider>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
