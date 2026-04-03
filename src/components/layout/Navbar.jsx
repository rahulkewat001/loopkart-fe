import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Menu, X, Bell, Sun, Moon, MessageCircle, 
  Heart, User, Package, Settings, Store, Rocket, LogOut, Bookmark 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import './Navbar.css';



export default function Navbar({ onSearch }) {
  const { user, logout }        = useAuth();
  const { itemCount }            = useCart();
  const { count: wishCount }     = useWishlist();
  const { unread, notifications, markAllRead, markRead, deleteOne } = useNotifications();
  const navigate                 = useNavigate();
  const [search, setSearch]      = useState('');
  const [menuOpen, setMenuOpen]  = useState(false);
  const [dropOpen, setDropOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dark, setDark]          = useState(() => localStorage.getItem('theme') === 'dark');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropRef  = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const { data } = await fetch(`${import.meta.env.VITE_API_URL}/products?search=${search.trim()}&limit=5`).then(r => r.json());
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setShowSuggestions(false);
    if (onSearch) { onSearch(search.trim()); }
    else { navigate(`/?search=${search.trim()}`); }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSearch('');
    navigate(`/product/${product._id}`);
  };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <ShoppingCart size={24} className="navbar__logo-icon" />
          <span className="navbar__logo-text">LoopKart</span>
        </Link>

        <div className="navbar__search" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <Search size={18} className="navbar__search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.trim().length >= 2 && setShowSuggestions(true)}
              className="navbar__search-input" 
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions animate-fadeIn">
              {suggestions.map((product) => (
                <div key={product._id} className="search-suggestion-item" onClick={() => handleSuggestionClick(product)}>
                  <div className="search-suggestion-img">
                    {product.emoji || product.image ? (
                      product.emoji ? <span style={{ fontSize: '24px' }}>{product.emoji}</span> : <img src={product.image} alt={product.name} />
                    ) : <Search size={20} />}
                  </div>
                  <div className="search-suggestion-info">
                    <p className="search-suggestion-name">{product.name}</p>
                    <p className="search-suggestion-price">₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar__actions">
          {/* Wishlist */}
          <Link to="/wishlist" className="navbar__icon-btn" data-tooltip={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ''}`}>
            <Heart size={20} />
            {wishCount > 0 && <span className="navbar__badge navbar__badge--wish">{wishCount}</span>}
          </Link>

          {/* Notification Bell */}
          <div className="navbar__notif" ref={notifRef}>
            <button
              className="navbar__icon-btn"
              data-tooltip={`Notifications${unread > 0 ? ` (${unread})` : ''}`}
              onClick={() => setNotifOpen((p) => !p)}
            >
              <Bell size={20} />
              {unread > 0 && <span className="navbar__badge navbar__badge--notif">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {notifOpen && (
              <div className="notif-panel animate-fadeIn">
                <div className="notif-panel__header">
                  <p className="notif-panel__title"><Bell size={16} /> Notifications</p>
                  {notifications.some((n) => !n.read) && (
                    <button className="notif-panel__read-all" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                <div className="notif-panel__list">
                  {notifications.length === 0 ? (
                    <div className="notif-panel__empty">
                      <Bell size={32} style={{ opacity: 0.3 }} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                        onClick={() => { markRead(n._id); if (n.link) { navigate(n.link); setNotifOpen(false); } }}
                      >
                        <span className="notif-item__icon">{n.icon}</span>
                        <div className="notif-item__body">
                          <p className="notif-item__title">{n.title}</p>
                          <p className="notif-item__msg">{n.message}</p>
                          <p className="notif-item__time">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button className="notif-item__del" onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}>✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <Link to="/chat" className="navbar__icon-btn" data-tooltip="Messages">
            <MessageCircle size={20} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="navbar__icon-btn" data-tooltip={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}>
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="navbar__badge">{itemCount}</span>}
          </Link>

          {/* Dark mode */}
          <button className="navbar__icon-btn navbar__dark-btn" onClick={() => setDark((d) => !d)} data-tooltip={dark ? 'Light Mode' : 'Dark Mode'}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User dropdown */}
          <div className="navbar__user" ref={dropRef}>
            <button className="navbar__avatar" onClick={() => setDropOpen((p) => !p)}>{initials}</button>
            {dropOpen && (
              <div className="navbar__dropdown animate-fadeIn">
                <div className="navbar__dropdown-header">
                  <p className="navbar__dropdown-name">{user?.name}</p>
                  <p className="navbar__dropdown-email">{user?.email}</p>
                </div>
                <div className="navbar__dropdown-divider" />
                <Link to="/profile"  className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><User size={16} /> My Profile</Link>
                <Link to="/orders"   className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Package size={16} /> My Orders</Link>
                <Link to="/saved-searches" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Bookmark size={16} /> Saved Searches</Link>
                <Link to="/chat"     className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><MessageCircle size={16} /> Messages</Link>
                <Link to="/wishlist" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Heart size={16} /> Wishlist {wishCount > 0 && `(${wishCount})`}</Link>
                <Link to="/cart"     className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><ShoppingCart size={16} /> Cart {itemCount > 0 && `(${itemCount})`}</Link>
                {user?.role === 'admin' && <Link to="/admin" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Settings size={16} /> Admin Panel</Link>}
                {user?.role === 'seller' && <Link to="/seller/dashboard" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Store size={16} /> My Shop</Link>}
                {user?.role === 'user'   && <Link to="/become-seller" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}><Rocket size={16} /> Start Selling</Link>}
                <div className="navbar__dropdown-divider" />
                <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>

          <button className="navbar__hamburger" onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar__mobile animate-fadeIn">
          <form className="navbar__mobile-search" onSubmit={handleSearch}>
            <Search size={18} className="navbar__search-icon" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="navbar__search-input" />
          </form>
          <Link to="/profile"  className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><User size={16} /> My Profile</Link>
          <Link to="/orders"   className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Package size={16} /> My Orders</Link>
          <Link to="/saved-searches" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Bookmark size={16} /> Saved Searches</Link>
          <Link to="/wishlist" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Heart size={16} /> Wishlist</Link>
          <Link to="/cart"     className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><ShoppingCart size={16} /> Cart {itemCount > 0 && `(${itemCount})`}</Link>
          {user?.role === 'admin'  && <Link to="/admin"            className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Settings size={16} /> Admin Panel</Link>}
          {user?.role === 'seller' && <Link to="/seller/dashboard" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Store size={16} /> My Shop</Link>}
          {user?.role === 'user'   && <Link to="/become-seller"    className="navbar__mobile-item" onClick={() => setMenuOpen(false)}><Rocket size={16} /> Start Selling</Link>}
          <button className="navbar__mobile-item navbar__mobile-item--danger" onClick={handleLogout}><LogOut size={16} /> Logout</button>
        </div>
      )}
    </nav>
  );
}
