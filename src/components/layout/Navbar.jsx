import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  Package,
  ShoppingCart,
  Sparkles,
  Store,
  SunMedium,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import './Navbar.css';

export default function Navbar({ onBuyClick, onSellClick }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((segment) => segment[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'LK';

  const jumpToSection = (id) => {
    const performScroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    setDrawerOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(performScroll, 120);
      return;
    }

    performScroll();
  };

  const handleSell = () => {
    setDrawerOpen(false);
    if (onSellClick) {
      onSellClick();
      return;
    }

    if (!user) {
      navigate('/register');
      return;
    }

    navigate(user.role === 'seller' ? '/seller/dashboard' : '/become-seller');
  };

  const handleBuy = () => {
    if (onBuyClick) {
      onBuyClick();
      return;
    }

    jumpToSection('trending');
  };

  const drawerLinks = [
    { label: 'Home', icon: Home, action: () => jumpToSection('hero') },
    { label: 'Impact', icon: Sparkles, action: () => jumpToSection('impact') },
    { label: 'Trending', icon: Trophy, action: () => jumpToSection('trending') },
    ...(user
      ? [
          { label: 'Orders', icon: Package, to: '/orders' },
          { label: 'Messages', icon: MessageSquareText, to: '/chat' },
          { label: 'Wishlist', icon: Heart, to: '/wishlist' },
          { label: 'Profile', icon: UserRound, to: '/profile' },
        ]
      : [
          { label: 'Sign in', icon: UserRound, to: '/login' },
          { label: 'Create account', icon: ArrowUpRight, to: '/register' },
        ]),
  ];

  return (
    <>
      <nav className="product-nav">
        <div className="container product-nav__inner">
          <div className="product-nav__left">
            <button className="product-nav__menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>

            <Link to="/" className="product-nav__brand">
              <span className="product-nav__brand-text">LoopKart</span>
            </Link>
          </div>

          <div className="product-nav__right">
            <button className="product-nav__cta product-nav__cta--ghost" onClick={handleSell}>
              <Store size={16} />
              <span>Sell</span>
            </button>

            <button className="product-nav__cta product-nav__cta--primary" onClick={handleBuy}>
              <ShoppingCart size={16} />
              <span>Buy</span>
            </button>

            <button
              type="button"
              className="product-nav__utility product-nav__theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <button
                  type="button"
                  className="product-nav__logout-btn"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>

                <Link to="/wishlist" className="product-nav__utility" aria-label="Wishlist">
                  <Heart size={18} />
                  {wishlistCount > 0 && <span className="product-nav__badge">{wishlistCount}</span>}
                </Link>

                <Link to="/cart" className="product-nav__utility" aria-label="Cart">
                  <ShoppingCart size={18} />
                  {itemCount > 0 && <span className="product-nav__badge">{itemCount}</span>}
                </Link>

                <Link to="/profile" className="product-nav__avatar" aria-label="Profile">
                  {initials}
                </Link>
              </>
            ) : (
              <Link to="/login" className="product-nav__signin">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className={`product-drawer-backdrop ${drawerOpen ? 'product-drawer-backdrop--open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`product-drawer ${drawerOpen ? 'product-drawer--open' : ''}`}>
        <div className="product-drawer__header">
          <div>
            <p className="product-drawer__eyebrow">LoopKart</p>
            <h2 className="product-drawer__title">Sustainable choices, beautifully circulated.</h2>
          </div>
          <button className="product-nav__menu-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <p className="product-drawer__copy">
          Discover restored tech, pre-loved style, and verified essentials that keep useful things in circulation.
        </p>

        <div className="product-drawer__links">
          {drawerLinks.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="product-drawer__link" onClick={() => setDrawerOpen(false)}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button key={item.label} className="product-drawer__link" onClick={item.action}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>

        <div className="product-drawer__metrics">
          <div className="product-drawer__metric">
            <p className="product-drawer__metric-value">12k+</p>
            <p className="product-drawer__metric-label">relisted essentials live</p>
          </div>
          <div className="product-drawer__metric">
            <p className="product-drawer__metric-value">48 cities</p>
            <p className="product-drawer__metric-label">active seller communities</p>
          </div>
        </div>

        {user ? (
          <button
            className="product-drawer__logout"
            onClick={async () => {
              await logout();
              setDrawerOpen(false);
              navigate('/');
            }}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        ) : null}
      </aside>
    </>
  );
}
