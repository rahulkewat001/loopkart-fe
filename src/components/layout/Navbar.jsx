import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Menu, X, Bell, Moon, MessageCircle, 
  Heart, User, Package, Settings, Store, Rocket, LogOut, Bookmark,
  Mic, Camera, Globe, GitCompare, MapPin, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';



export default function Navbar({ onSearch }) {
  const { user, logout }        = useAuth();
  const { itemCount }            = useCart();
  const { count: wishCount }     = useWishlist();
  const { unread, notifications, markAllRead, markRead, deleteOne } = useNotifications();
  const { dark, toggleTheme }    = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate                 = useNavigate();
  const [search, setSearch]      = useState('');
  const [menuOpen, setMenuOpen]  = useState(false);
  const [dropOpen, setDropOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches] = useState(['iPhone 14', 'Laptop', 'Headphones']);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef  = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const cartRef = useRef(null);
  const compareRef = useRef(null);
  const locationRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setShowSuggestions(false); setSearchFocused(false); }
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false);
      if (compareRef.current && !compareRef.current.contains(e.target)) setCompareOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ଓଡ଼ିଆ' ? 'or-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started. Speak now...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      setSearch(transcript);
      setIsListening(false);
      
      // Auto-submit search after voice input
      setTimeout(() => {
        if (onSearch) { onSearch(transcript.trim()); }
        else { navigate(`/?search=${transcript.trim()}`); }
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      } else {
        alert(`Voice search error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended.');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      alert('Failed to start voice search. Please try again.');
    }
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    console.log('Image uploaded:', file.name);
    
    // For now, show a message that the feature is being processed
    // In production, you would upload to a vision API (Google Vision, AWS Rekognition, etc.)
    alert(`Image search is processing "${file.name}". This feature uses AI to identify products in images. Full implementation coming soon!`);
    
    // Reset file input
    e.target.value = '';
  };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className={`navbar-premium ${scrolled ? 'navbar-premium--scrolled' : ''}`}>
      <div className="navbar-premium__glow-line"></div>
      <div className="navbar-premium__inner container">
        {/* Logo */}
        <Link to="/" className="navbar-premium__logo">
          <div className="navbar-premium__logo-icon-wrapper">
            <ShoppingCart className="navbar-premium__logo-icon" />
          </div>
          <span className="navbar-premium__logo-text">LoopKart</span>
          <span className="navbar-premium__sale-badge">SALE</span>
        </Link>

        {/* Location Selector */}
        <div className="navbar-premium__location" ref={locationRef}>
          <button className="navbar-premium__location-btn" onClick={() => setLocationOpen((p) => !p)}>
            <MapPin size={18} />
            <div className="navbar-premium__location-text">
              <span className="navbar-premium__location-label">Deliver to</span>
              <span className="navbar-premium__location-value">{location.split(',')[0]}</span>
            </div>
          </button>
          {locationOpen && (
            <div className="navbar-premium__dropdown navbar-premium__dropdown--location animate-fadeIn">
              <div className="dropdown__header">
                <p className="dropdown__title"><MapPin size={16} /> Select Location</p>
              </div>
              <div className="dropdown__list">
                <div className="location-search">
                  <input 
                    type="text" 
                    placeholder="Search city or pincode..."
                    className="location-search__input"
                  />
                </div>
                <div className="location-cities">
                  {[
                    'Mumbai, Maharashtra',
                    'Delhi, NCR',
                    'Bangalore, Karnataka',
                    'Hyderabad, Telangana',
                    'Chennai, Tamil Nadu',
                    'Kolkata, West Bengal',
                    'Pune, Maharashtra',
                    'Ahmedabad, Gujarat',
                    'Jaipur, Rajasthan',
                    'Surat, Gujarat',
                    'Lucknow, Uttar Pradesh',
                    'Kanpur, Uttar Pradesh',
                    'Nagpur, Maharashtra',
                    'Indore, Madhya Pradesh',
                    'Thane, Maharashtra',
                    'Bhopal, Madhya Pradesh',
                    'Visakhapatnam, Andhra Pradesh',
                    'Patna, Bihar',
                    'Vadodara, Gujarat',
                    'Ghaziabad, Uttar Pradesh',
                    'Ludhiana, Punjab',
                    'Agra, Uttar Pradesh',
                    'Nashik, Maharashtra',
                    'Faridabad, Haryana',
                    'Meerut, Uttar Pradesh',
                    'Rajkot, Gujarat',
                    'Varanasi, Uttar Pradesh',
                    'Srinagar, Jammu & Kashmir',
                    'Amritsar, Punjab',
                    'Allahabad, Uttar Pradesh',
                    'Ranchi, Jharkhand',
                    'Howrah, West Bengal',
                    'Coimbatore, Tamil Nadu',
                    'Jabalpur, Madhya Pradesh',
                    'Gwalior, Madhya Pradesh',
                    'Vijayawada, Andhra Pradesh',
                    'Jodhpur, Rajasthan',
                    'Madurai, Tamil Nadu',
                    'Raipur, Chhattisgarh',
                    'Kota, Rajasthan',
                  ].map((city) => (
                    <button 
                      key={city} 
                      className="location-city__item" 
                      onClick={() => { setLocation(city); setLocationOpen(false); }}
                    >
                      <MapPin size={14} />
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className={`navbar-premium__search ${searchFocused ? 'navbar-premium__search--focused' : ''}`} ref={searchRef}>
          <form onSubmit={handleSearch}>
            <Search className="navbar-premium__search-icon" />
            <input 
              type="text" 
              placeholder={t('search')} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
              className="navbar-premium__search-input" 
            />
            <button type="button" className={`navbar-premium__search-btn ${isListening ? 'navbar-premium__search-btn--active' : ''}`} title={t('voiceSearch')} onClick={handleVoiceSearch}>
              <Mic size={18} />
            </button>
            <button type="button" className="navbar-premium__search-btn" title={t('imageSearch')} onClick={handleImageSearch}>
              <Camera size={18} />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </form>
          
          {showSuggestions && (
            <div className="navbar-premium__search-dropdown animate-fadeIn">
              {recentSearches.length > 0 && (
                <div className="search-dropdown__section">
                  <p className="search-dropdown__title">{t('recentSearches')}</p>
                  {recentSearches.map((term, i) => (
                    <div key={i} className="search-dropdown__item" onClick={() => { setSearch(term); handleSearch({ preventDefault: () => {} }); }}>
                      <Search size={16} />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {suggestions.length > 0 && (
                <div className="search-dropdown__section">
                  <p className="search-dropdown__title">{t('suggestions')}</p>
                  {suggestions.map((product) => (
                    <div key={product._id} className="search-dropdown__product" onClick={() => handleSuggestionClick(product)}>
                      <div className="search-dropdown__product-img">
                        {product.emoji ? <span>{product.emoji}</span> : product.image ? <img src={product.image} alt={product.name} /> : <Search size={20} />}
                      </div>
                      <div className="search-dropdown__product-info">
                        <p className="search-dropdown__product-name">{product.name}</p>
                        <p className="search-dropdown__product-price">₹{product.price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-premium__actions">
          {/* Compare */}
          <div className="navbar-premium__dropdown-wrapper" ref={compareRef}>
            <button className="navbar-premium__icon-btn" data-tooltip={t('compareProducts')} onClick={() => setCompareOpen((p) => !p)}>
              <GitCompare size={20} />
            </button>
            {compareOpen && (
              <div className="navbar-premium__dropdown navbar-premium__dropdown--compare animate-fadeIn">
                <div className="dropdown__header">
                  <p className="dropdown__title"><GitCompare size={16} /> {t('compareProducts')}</p>
                </div>
                <div className="dropdown__list">
                  <div className="dropdown__empty">
                    <GitCompare size={32} />
                    <p>{t('noProductsToCompare')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar-premium__icon-btn navbar-premium__icon-btn--animated" data-tooltip={t('wishlist')}>
            <Heart size={20} />
            {wishCount > 0 && <span className="navbar-premium__badge navbar-premium__badge--pulse">{wishCount}</span>}
          </Link>

          {/* Notifications */}
          <div className="navbar-premium__dropdown-wrapper" ref={notifRef}>
            <button
              className="navbar-premium__icon-btn navbar-premium__icon-btn--animated"
              data-tooltip={t('notifications')}
              onClick={() => setNotifOpen((p) => !p)}
            >
              <Bell size={20} />
              {unread > 0 && <span className="navbar-premium__badge navbar-premium__badge--pulse navbar-premium__badge--red">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {notifOpen && (
              <div className="navbar-premium__dropdown navbar-premium__dropdown--notif animate-fadeIn">
                <div className="dropdown__header">
                  <p className="dropdown__title"><Bell size={16} /> {t('notifications')}</p>
                  {notifications.some((n) => !n.read) && (
                    <button className="dropdown__action" onClick={markAllRead}>{t('markAllRead')}</button>
                  )}
                </div>
                <div className="dropdown__list">
                  {notifications.length === 0 ? (
                    <div className="dropdown__empty">
                      <Bell size={32} />
                      <p>{t('noNotifications')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`dropdown__item ${!n.read ? 'dropdown__item--unread' : ''}`}
                        onClick={() => { markRead(n._id); if (n.link) { navigate(n.link); setNotifOpen(false); } }}
                      >
                        <span className="dropdown__item-icon">{n.icon}</span>
                        <div className="dropdown__item-body">
                          <p className="dropdown__item-title">{n.title}</p>
                          <p className="dropdown__item-msg">{n.message}</p>
                          <p className="dropdown__item-time">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button className="dropdown__item-del" onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}>✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <Link to="/chat" className="navbar-premium__icon-btn navbar-premium__icon-btn--animated" data-tooltip={t('messages')}>
            <MessageCircle size={20} />
            <span className="navbar-premium__badge navbar-premium__badge--pulse navbar-premium__badge--orange">3</span>
          </Link>

          {/* Cart */}
          <div className="navbar-premium__dropdown-wrapper" ref={cartRef}>
            <button 
              className="navbar-premium__icon-btn navbar-premium__icon-btn--animated navbar-premium__icon-btn--cart" 
              data-tooltip={t('shoppingCart')}
              onClick={() => setCartOpen((p) => !p)}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="navbar-premium__badge navbar-premium__badge--pulse">{itemCount}</span>}
            </button>

            {cartOpen && (
              <div className="navbar-premium__dropdown navbar-premium__dropdown--cart animate-fadeIn">
                <div className="dropdown__header">
                  <p className="dropdown__title"><ShoppingCart size={16} /> {t('myCart')}</p>
                </div>
                <div className="dropdown__list">
                  {itemCount === 0 ? (
                    <div className="dropdown__empty">
                      <ShoppingCart size={32} />
                      <p>{t('yourCartIsEmpty')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="cart-preview__items">
                        <p className="cart-preview__count">{itemCount} {t('itemsInCart')}</p>
                      </div>
                      <div className="cart-preview__footer">
                        <Link to="/cart" className="cart-preview__btn" onClick={() => setCartOpen(false)}>
                          {t('viewCart')}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="navbar-premium__dropdown-wrapper" ref={langRef}>
            <button className="navbar-premium__icon-btn" data-tooltip={t('selectLanguage')} onClick={() => setLangOpen((p) => !p)}>
              <Globe size={20} />
            </button>
            {langOpen && (
              <div className="navbar-premium__dropdown navbar-premium__dropdown--lang animate-fadeIn">
                <div className="dropdown__header">
                  <p className="dropdown__title"><Globe size={16} /> {t('selectLanguage')}</p>
                </div>
                <div className="dropdown__list">
                  {['English', 'ଓଡ଼ିଆ'].map((lang) => (
                    <button key={lang} className={`dropdown__link ${language === lang ? 'dropdown__link--active' : ''}`} onClick={() => { setLanguage(lang); setLangOpen(false); }}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode */}
          <button className="navbar-premium__icon-btn" onClick={toggleTheme} data-tooltip={dark ? t('lightMode') : t('darkMode')}>
            <Moon size={20} className={dark ? 'moon-active' : ''} />
          </button>

          {/* User Profile */}
          <div className="navbar-premium__dropdown-wrapper" ref={dropRef}>
            <button className="navbar-premium__avatar" onClick={() => setDropOpen((p) => !p)}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
            </button>
            {dropOpen && (
              <div className="navbar-premium__dropdown navbar-premium__dropdown--user animate-fadeIn">
                <div className="dropdown__header dropdown__header--user">
                  <div className="dropdown__user-avatar">{user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}</div>
                  <div>
                    <p className="dropdown__user-name">{user?.name}</p>
                    <p className="dropdown__user-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown__divider" />
                <Link to="/profile"  className="dropdown__link" onClick={() => setDropOpen(false)}><User size={16} /> {t('myProfile')}</Link>
                <Link to="/orders"   className="dropdown__link" onClick={() => setDropOpen(false)}><Package size={16} /> {t('myOrders')}</Link>
                <Link to="/saved-searches" className="dropdown__link" onClick={() => setDropOpen(false)}><Bookmark size={16} /> {t('savedSearches')}</Link>
                <Link to="/wishlist" className="dropdown__link" onClick={() => setDropOpen(false)}><Heart size={16} /> {t('wishlist')} {wishCount > 0 && `(${wishCount})`}</Link>
                {user?.role === 'admin' && <Link to="/admin" className="dropdown__link" onClick={() => setDropOpen(false)}><Settings size={16} /> {t('adminPanel')}</Link>}
                {user?.role === 'seller' && <Link to="/seller/dashboard" className="dropdown__link" onClick={() => setDropOpen(false)}><Store size={16} /> {t('myShop')}</Link>}
                {user?.role === 'user'   && <Link to="/become-seller" className="dropdown__link dropdown__link--highlight" onClick={() => setDropOpen(false)}><Zap size={16} /> {t('startSelling')}</Link>}
                <div className="dropdown__divider" />
                <button className="dropdown__link dropdown__link--danger" onClick={handleLogout}><LogOut size={16} /> {t('logout')}</button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button className="navbar-premium__hamburger" onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-premium__mobile animate-fadeIn">
          <form className="navbar-premium__mobile-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <Link to="/profile"  className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><User size={18} /> {t('myProfile')}</Link>
          <Link to="/orders"   className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><Package size={18} /> {t('myOrders')}</Link>
          <Link to="/wishlist" className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><Heart size={18} /> {t('wishlist')}</Link>
          <Link to="/cart"     className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><ShoppingCart size={18} /> {t('myCart')} {itemCount > 0 && `(${itemCount})`}</Link>
          {user?.role === 'admin'  && <Link to="/admin"            className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><Settings size={18} /> {t('adminPanel')}</Link>}
          {user?.role === 'seller' && <Link to="/seller/dashboard" className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><Store size={18} /> {t('myShop')}</Link>}
          {user?.role === 'user'   && <Link to="/become-seller"    className="navbar-premium__mobile-item" onClick={() => setMenuOpen(false)}><Zap size={18} /> {t('startSelling')}</Link>}
          <button className="navbar-premium__mobile-item navbar-premium__mobile-item--danger" onClick={handleLogout}><LogOut size={18} /> {t('logout')}</button>
        </div>
      )}
    </nav>
  );
}
