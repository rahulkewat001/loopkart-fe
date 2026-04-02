import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider }         from './context/AuthContext.jsx'
import { CartProvider }         from './context/CartContext.jsx'
import { WishlistProvider }     from './context/WishlistContext.jsx'
import { ToastProvider }        from './components/ui/Toast/ToastContext.jsx'
import { SocketProvider }       from './context/SocketContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
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
  </React.StrictMode>
)
