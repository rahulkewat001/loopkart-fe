import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Shirt, Home, Sparkles, Dumbbell, BookOpen, Baby, UtensilsCrossed,
  ShoppingBag, Truck, RefreshCw, ShieldCheck, Headphones,
  Search, X, SlidersHorizontal, ShoppingCart, Heart, Star, Zap, Package
} from 'lucide-react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import Navbar from '../../components/layout/Navbar';
import HeroSlider from '../../components/layout/HeroSlider';
import './HomePage.css';

const categories = [
  { id: 1, Icon: Smartphone,      label: 'Electronics' },
  { id: 2, Icon: Shirt,           label: 'Fashion' },
  { id: 3, Icon: Home,            label: 'Home & Living' },
  { id: 4, Icon: Sparkles,        label: 'Beauty' },
  { id: 5, Icon: Dumbbell,        label: 'Sports' },
  { id: 6, Icon: BookOpen,        label: 'Books' },
  { id: 7, Icon: Baby,            label: 'Toys' },
  { id: 8, Icon: UtensilsCrossed, label: 'Kitchen' },
];

const features = [
  { Icon: Truck,        title: 'Free Delivery',   desc: 'On orders above ₹499' },
  { Icon: RefreshCw,   title: 'Easy Returns',    desc: '30-day hassle-free returns' },
  { Icon: ShieldCheck, title: 'Secure Payments', desc: '100% safe & encrypted' },
  { Icon: Headphones,  title: '24/7 Support',    desc: 'Always here to help you' },
];

const Stars = ({ rating }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'star star--full' : (i === full && half ? 'star star--half' : 'star star--empty')}>★</span>
      ))}
    </span>
  );
};

const disc = (price, original) => Math.round((1 - price / original) * 100);

const SORT_OPTIONS = [
  { value: 'default',     label: 'Default' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'discount',    label: 'Best Discount' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, items }             = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast }                        = useToast();

  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy]             = useState('default');
  const [priceRange, setPriceRange]     = useState([0, 10000]);
  const [maxPrice, setMaxPrice]         = useState(10000);
  const [minRating, setMinRating]       = useState(0);
  const [showFilters, setShowFilters]   = useState(false);

  useEffect(() => {
    api.get('/products').then(({ data }) => {
      setProducts(data.products);
      const max = Math.max(...data.products.map((p) => p.price));
      setMaxPrice(max);
      setPriceRange([0, max]);
    }).finally(() => setLoading(false));
  }, []);

  // Apply all filters + sort
  const applyFilters = useCallback(() => {
    let result = [...products];

    // Category
    if (activeCategory !== 'All') result = result.filter((p) => p.category === activeCategory);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Price range
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Min rating
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);

    // Sort
    switch (sortBy) {
      case 'price_asc':   result.sort((a, b) => a.price - b.price); break;
      case 'price_desc':  result.sort((a, b) => b.price - a.price); break;
      case 'rating_desc': result.sort((a, b) => b.rating - a.rating); break;
      case 'discount':    result.sort((a, b) => disc(a.price, a.originalPrice) < disc(b.price, b.originalPrice) ? 1 : -1); break;
      default: break;
    }

    setFiltered(result);
  }, [products, activeCategory, searchQuery, priceRange, minRating, sortBy]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  // Sync search from URL param
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) { setSearchQuery(q); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }
  }, [searchParams]);

  const resetFilters = () => {
    setSearchQuery(''); setSortBy('default');
    setPriceRange([0, maxPrice]); setMinRating(0); setActiveCategory('All');
  };

  const hasActiveFilters = searchQuery || sortBy !== 'default' || priceRange[0] > 0 || priceRange[1] < maxPrice || minRating > 0 || activeCategory !== 'All';

  const inCart = (id) => items.some((i) => i._id === id);

  return (
    <div className="home">
      <Navbar onSearch={(q) => { setSearchQuery(q); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }} />

      {/* ── Premium Hero Slider ─────────────────────────────── */}
      <HeroSlider />

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section__title">Shop by Category</h2>
          <div className="categories">
            <button className={`category-card ${activeCategory === 'All' ? 'category-card--active' : ''}`} onClick={() => setActiveCategory('All')}>
              <span className="category-card__icon"><ShoppingBag size={24} /></span>
              <span className="category-card__label">All</span>
            </button>
            {categories.map((cat) => (
              <button key={cat.id} className={`category-card ${activeCategory === cat.label ? 'category-card--active' : ''}`} onClick={() => setActiveCategory(cat.label)}>
                <span className="category-card__icon"><cat.Icon size={24} /></span>
                <span className="category-card__label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products + Filters ───────────────────────────────── */}
      <section className="section section--muted" id="products-section">
        <div className="container">

          {/* Search + Filter bar */}
          <div className="filter-bar">
            <div className="filter-search">
              <span className="filter-search__icon"><Search size={15} /></span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search__input"
              />
              {searchQuery && <button className="filter-search__clear" onClick={() => setSearchQuery('')}><X size={13} /></button>}
            </div>

            <div className="filter-controls">
              <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button className={`filter-toggle-btn ${showFilters ? 'filter-toggle-btn--active' : ''}`} onClick={() => setShowFilters((p) => !p)}>
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span className="filter-dot" />}
              </button>

              {hasActiveFilters && (
                <button className="filter-reset-btn" onClick={resetFilters}><X size={13} /> Clear All</button>
              )}
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="filter-panel animate-fadeUp">
              {/* Price Range */}
              <div className="filter-group">
                <p className="filter-group__label">Price Range</p>
                <div className="filter-price-inputs">
                  <div className="filter-price-input">
                    <span>₹</span>
                    <input type="number" value={priceRange[0]} min={0} max={priceRange[1]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} />
                  </div>
                  <span className="filter-price-sep">—</span>
                  <div className="filter-price-input">
                    <span>₹</span>
                    <input type="number" value={priceRange[1]} min={priceRange[0]} max={maxPrice}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} />
                  </div>
                </div>
                <input type="range" className="filter-range" min={0} max={maxPrice} value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} />
                <div className="filter-range-labels"><span>₹0</span><span>₹{maxPrice.toLocaleString()}</span></div>
              </div>

              {/* Min Rating */}
              <div className="filter-group">
                <p className="filter-group__label">Minimum Rating</p>
                <div className="filter-rating-btns">
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <button key={r} className={`filter-rating-btn ${minRating === r ? 'filter-rating-btn--active' : ''}`} onClick={() => setMinRating(r)}>
                      {r === 0 ? 'All' : `${r}★ & above`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount filter */}
              <div className="filter-group">
                <p className="filter-group__label">Discount</p>
                <div className="filter-rating-btns">
                  {[
                    { label: 'All', fn: () => { setSortBy('default'); } },
                    { label: '10%+', fn: () => setSortBy('discount') },
                    { label: '20%+', fn: () => setSortBy('discount') },
                    { label: '40%+', fn: () => setSortBy('discount') },
                  ].map((d, i) => (
                    <button key={i} className="filter-rating-btn" onClick={d.fn}>{d.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results header */}
          <div className="section__header" style={{ marginTop: 24 }}>
            <h2 className="section__title">
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'Trending Products' : activeCategory}
            </h2>
            <span className="section__count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="products-loading">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="products-empty animate-fadeUp">
              <Package size={56} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No products found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
              <button className="filter-reset-btn" style={{ marginTop: 12 }} onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products">
              {filtered.map((p) => (
                <div key={p._id} className="product-card" onClick={() => navigate(`/product/${p._id}`)}>
                  {p.badge && <span className="product-card__badge">{p.badge}</span>}
                  <button
                    className={`product-card__wish ${isWishlisted(p._id) ? 'product-card__wish--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); toast(isWishlisted(p._id) ? 'Removed from wishlist' : 'Added to wishlist!', isWishlisted(p._id) ? 'info' : 'success'); }}
                  ><Heart size={14} fill={isWishlisted(p._id) ? 'currentColor' : 'none'} /></button>
                  <div className="product-card__img">
                    {p.image
                      ? <img src={p.image} alt={p.name} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      : null
                    }
                    <span style={{ display: p.image ? 'none' : 'flex' }}>{p.emoji}</span>
                  </div>
                  <div className="product-card__body">
                    <p className="product-card__name">{p.name}</p>
                    <div className="product-card__rating">
                      <Stars rating={p.rating} />
                      <span className="product-card__reviews">({p.reviews.toLocaleString()})</span>
                    </div>
                    <div className="product-card__pricing">
                      <span className="product-card__price">₹{p.price.toLocaleString()}</span>
                      <span className="product-card__original">₹{p.originalPrice.toLocaleString()}</span>
                      <span className="product-card__discount">{disc(p.price, p.originalPrice)}% off</span>
                    </div>
                    <button
                      className={`product-card__btn ${inCart(p._id) ? 'product-card__btn--added' : ''}`}
                      onClick={(e) => { e.stopPropagation(); addToCart(p); toast(`${p.name.slice(0, 20)}... added to cart! 🛒`); }}
                    >
                      {inCart(p._id) ? <><Star size={13} fill="currentColor" /> Added</> : <><ShoppingCart size={13} /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Banner ───────────────────────────────────────────── */}
      <section className="banner">
        <div className="container banner__inner">
          <div className="banner__content">
            <span className="banner__tag">Limited Time Offer</span>
            <h2 className="banner__title">Get 40% Off on Electronics</h2>
            <p className="banner__desc">Use code <strong>LOOP40</strong> at checkout. Valid till stocks last.</p>
            <button className="btn-hero-primary" onClick={() => { setActiveCategory('Electronics'); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Grab the Deal →</button>
          </div>
          <div className="banner__emoji"><Zap /></div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="features">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-card__icon"><f.Icon size={32} /></span>
                <div>
                  <p className="feature-card__title">{f.title}</p>
                  <p className="feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
