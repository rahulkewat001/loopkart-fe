import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Heart,
  LockKeyhole,
  Leaf,
  Mail,
  Moon,
  PackageCheck,
  Recycle,
  Search,
  ShieldCheck,
  SunMedium,
  UserRound,
  X,
  Laptop,
  Shirt,
  Sparkles,
  Home,
  Dumbbell,
  BookOpen,
  Baby,
  UtensilsCrossed,
  ShoppingBasket,
  Watch,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import Input from '../../components/ui/Input';
import Navbar from '../../components/layout/Navbar';
import RevealOnScroll from '../../components/ui/RevealOnScroll';
import './HomePage.css';

const heroStats = [
  { value: '12k+', label: 'beautifully relisted essentials' },
  { value: '48 cities', label: 'seller communities already active' },
  { value: '4.9 / 5', label: 'buyer trust on featured finds' },
];

const impactMoments = [
  {
    icon: Recycle,
    title: 'Reuse with intention',
    copy: 'Every relisted product extends its useful life, lowers embodied carbon, and keeps value moving instead of creating more waste.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust-forward discovery',
    copy: 'Condition, health score, usage age, and seller reputation are surfaced early so browsing feels clear, premium, and reassuring.',
  },
  {
    icon: CircleDollarSign,
    title: 'Better value for both sides',
    copy: 'Buyers get better prices, while sellers turn dormant products into cash without the chaos of old-school classifieds.',
  },
];

const compactNumber = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const conditionLabel = (condition) => condition?.replace('_', ' ') || 'good';

// Category icon mapping
const categoryIcons = {
  'Electronics': Laptop,
  'Fashion': Shirt,
  'Beauty': Sparkles,
  'Home & Living': Home,
  'Sports': Dumbbell,
  'Books': BookOpen,
  'Toys': Baby,
  'Kitchen': UtensilsCrossed,
  'Grocery': ShoppingBasket,
  'Accessories': Watch,
};

function GuestLanding({ onAuthenticated }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const authSectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const requestedMode = searchParams.get('auth');

    if (requestedMode === 'login' || requestedMode === 'signup') {
      setStarted(true);
      setAuthMode(requestedMode);
      return;
    }

    setAuthMode(null);
  }, [searchParams]);

  useEffect(() => {
    if (!authMode) return;
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [authMode]);

  const openAuthMode = (mode) => {
    setStarted(true);
    setAuthMode(mode);
    setSearchParams({ auth: mode }, { replace: true });
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', loginForm);
      setSearchParams({}, { replace: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });
      setSearchParams({}, { replace: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-home">
      <video className="guest-home__video" src="/homescreen.mp4" autoPlay muted loop playsInline />
      <div className="guest-home__overlay" />

      <section className="guest-home__hero">
        <div className="guest-home__brand">LoopKart</div>
        <button
          type="button"
          className="guest-home__theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <div className="guest-home__hero-content animate-fadeUp">
          <p className="guest-home__eyebrow">Save value. Save materials. Save the planet.</p>
          <h1 className="guest-home__title">LoopKart</h1>
          <p className="guest-home__subtitle">
            A refined marketplace for sustainable products, conscious choices, and beautifully extended product lifecycles.
          </p>
          <p className="guest-home__support">
            Buy with intention. Sell with confidence. Keep better things in circulation.
          </p>

          {!started ? (
            <button className="guest-home__cta" onClick={() => setStarted(true)}>
              Get started
            </button>
          ) : (
            <div className="guest-home__choice-row animate-fadeUp">
              <button
                className={`guest-home__choice ${authMode === 'login' ? 'guest-home__choice--active' : ''}`}
                onClick={() => openAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`guest-home__choice ${authMode === 'signup' ? 'guest-home__choice--active' : ''}`}
                onClick={() => openAuthMode('signup')}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </section>

      {authMode ? (
        <section ref={authSectionRef} className="guest-home__auth guest-home__auth--visible">
          <div className="guest-home__auth-shell animate-fadeUp">
            <div className={`guest-home__auth-feedback ${error ? 'guest-home__auth-feedback--visible' : ''}`} aria-live="polite">
              {error ? <div className="guest-home__auth-alert">{error}</div> : null}
            </div>

            {authMode === 'login' ? (
              <form className="guest-home__form" onSubmit={submitLogin}>
              <h2>Welcome back</h2>
              <p>Log in to continue buying and selling with LoopKart.</p>

              <Input
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(event) => {
                  setLoginForm((current) => ({ ...current, email: event.target.value }));
                  setError('');
                }}
                icon={<Mail size={18} />}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(event) => {
                  setLoginForm((current) => ({ ...current, password: event.target.value }));
                  setError('');
                }}
                icon={<LockKeyhole size={18} />}
                placeholder="Enter your password"
                required
              />

              <div className="guest-home__form-meta">
                <button type="button" className="guest-home__text-link" onClick={() => navigate('/forgot-password')}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="guest-home__submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className="guest-home__switch-copy">
                Don&apos;t have an account yet?{' '}
                <button type="button" className="guest-home__text-link" onClick={() => openAuthMode('signup')}>
                  Sign up
                </button>
              </p>
            </form>
            ) : null}

            {authMode === 'signup' ? (
              <form className="guest-home__form" onSubmit={submitRegister}>
              <h2>Create your account</h2>
              <p>Join LoopKart and start saving products, materials, and money.</p>

              <Input
                label="Full name"
                type="text"
                value={registerForm.name}
                onChange={(event) => {
                  setRegisterForm((current) => ({ ...current, name: event.target.value }));
                  setError('');
                }}
                icon={<UserRound size={18} />}
                placeholder="Your name"
                required
              />

              <Input
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) => {
                  setRegisterForm((current) => ({ ...current, email: event.target.value }));
                  setError('');
                }}
                icon={<Mail size={18} />}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(event) => {
                  setRegisterForm((current) => ({ ...current, password: event.target.value }));
                  setError('');
                }}
                icon={<LockKeyhole size={18} />}
                placeholder="Create a password"
                required
              />

              <Input
                label="Confirm password"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) => {
                  setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }));
                  setError('');
                }}
                icon={<LockKeyhole size={18} />}
                placeholder="Repeat your password"
                required
              />

              <button type="submit" className="guest-home__submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
              <p className="guest-home__switch-copy">
                Already have an account?{' '}
                <button type="button" className="guest-home__text-link" onClick={() => openAuthMode('login')}>
                  Login
                </button>
              </p>
            </form>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, saveAuth } = useAuth();
  const { addToCart, items } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/products', { params: { limit: 120, sort: 'trending' } })
      .then(({ data }) => {
        if (cancelled) return;
        setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = products[0];
  const categorySummaries = Object.values(
    products.reduce((accumulator, product) => {
      if (!accumulator[product.category]) {
        accumulator[product.category] = {
          name: product.category,
          count: 0,
          image: product.image,
          topProduct: product,
          totalViews: 0,
        };
      }

      accumulator[product.category].count += 1;
      accumulator[product.category].totalViews += product.views || 0;

      if ((product.views || 0) > (accumulator[product.category].topProduct?.views || 0)) {
        accumulator[product.category].topProduct = product;
        accumulator[product.category].image = product.image;
      }

      return accumulator;
    }, {})
  ).sort((left, right) => right.count - left.count || right.totalViews - left.totalViews);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const categoryProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : [];
  const filteredCategoryProducts = normalizedSearch
    ? categoryProducts.filter((product) =>
        [
          product.name,
          product.category,
          product.manufacturer,
          product.usageSummary,
          product.sellerName,
          product.city,
          product.material,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    : categoryProducts;
  const visibleProducts = filteredCategoryProducts.slice(0, 12);
  const selectedCategoryCount = filteredCategoryProducts.length;

  const handlePrimaryHero = () => {
    if (user) {
      document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate('/login');
  };

  const handleSecondaryHero = () => {
    if (user) {
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/become-seller');
      return;
    }

    navigate('/register');
  };

  const handleQuickAdd = (product) => {
    addToCart(product);
    toast(`${product.name} added to cart`, 'success');
  };

  if (!user) {
    return <GuestLanding onAuthenticated={saveAuth} />;
  }

  return (
    <div className="immersive-home">
      <Navbar />

      <section className="hero-experience" id="hero">
        <video className="hero-experience__video" src="/homepage-hero.mp4" autoPlay muted loop playsInline />
        <div className="hero-experience__overlay" />

        <div className="container hero-experience__content">
          <div className="hero-experience__copy animate-fadeUp">
            <p className="hero-experience__eyebrow">Curated sustainable marketplace</p>
            <h1 className="hero-experience__title">Reuse is the most beautiful kind of progress.</h1>
            <p className="hero-experience__subtitle">
              LoopKart turns second-hand buying and selling into a calmer, more premium product experience with verified
              details, intentional design, and better products kept in circulation.
            </p>

            <div className="hero-experience__actions">
              <button className="hero-button hero-button--primary" onClick={handlePrimaryHero}>
                {user ? 'Browse categories' : 'Sign in'}
                <ArrowRight size={16} />
              </button>
              <button className="hero-button hero-button--ghost" onClick={handleSecondaryHero}>
                {user ? 'Start selling' : 'Create account'}
              </button>
            </div>

            <div className="hero-experience__stats">
              {heroStats.map((stat) => (
                <div key={stat.label} className="hero-experience__stat">
                  <p className="hero-experience__stat-value">{stat.value}</p>
                  <p className="hero-experience__stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-experience__quote card card--glass animate-fadeUp">
            <p className="hero-experience__quote-mark">“</p>
            <p className="hero-experience__quote-copy">The most sustainable product is the one that already exists.</p>
            <p className="hero-experience__quote-support">
              Thoughtful resale makes good design last longer, travel further, and cost less.
            </p>

            {featured ? (
              <button className="hero-experience__feature-card" onClick={() => navigate(`/product/${featured._id}`)}>
                <div className="hero-experience__feature-media">
                  <img src={featured.image} alt={featured.name} />
                </div>
                <div className="hero-experience__feature-body">
                  <p className="hero-experience__feature-kicker">Current trending product</p>
                  <h2>{featured.name}</h2>
                  <p>{featured.city} • {featured.usageSummary}</p>
                  <div className="hero-experience__feature-meta">
                    <span>₹{featured.price.toLocaleString('en-IN')}</span>
                    <strong>{compactNumber.format(featured.views)} views</strong>
                  </div>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <RevealOnScroll as="section" className="impact-section container" id="impact">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Why LoopKart feels different</p>
          <h2>Built around trust, value, and a more beautiful way to buy pre-owned products.</h2>
        </div>

        <div className="impact-grid">
          {impactMoments.map((item, index) => (
            <RevealOnScroll key={item.title} as="article" className="impact-card card" delay={index * 110}>
              <span className="impact-card__icon">
                <item.icon size={18} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="trending-section container" id="trending">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-heading__eyebrow">
              {selectedCategory ? 'Category view' : 'Browse by category'}
            </p>
            <h2>
              {selectedCategory
                ? `${selectedCategory} finds curated for their next owner.`
                : 'Choose a category first, then explore the products inside it.'}
            </h2>
          </div>
          <p className="section-heading__support">
            {selectedCategory
              ? 'Hover to inspect maker, use history, and health score before opening the full product page.'
              : 'Open any category to reveal the products that belong to it, then jump back whenever you want.'}
          </p>
        </div>

        {loading ? (
          <div className="trending-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="market-card market-card--skeleton" />
            ))}
          </div>
        ) : categorySummaries.length === 0 ? (
          <RevealOnScroll className="trending-empty card card--glass" delay={120}>
            <PackageCheck size={28} />
            <p>No marketplace items are live yet. Seed or add products to begin the showcase.</p>
          </RevealOnScroll>
        ) : !selectedCategory ? (
          <div className="category-grid">
            {categorySummaries.map((category, index) => {
              const CategoryIcon = categoryIcons[category.name] || PackageCheck;
              return (
                <RevealOnScroll
                  key={category.name}
                  as="button"
                  className="category-card"
                  delay={index * 70}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSearchQuery('');
                  }}
                >
                  <div className="category-card__icon-wrapper">
                    <CategoryIcon size={48} className="category-card__icon" />
                  </div>
                  <div className="category-card__overlay" />
                  <div className="category-card__content">
                    <p className="category-card__eyebrow">{compactNumber.format(category.totalViews)} views tracked</p>
                    <h3>{category.name}</h3>
                    <p>{category.topProduct?.manufacturer || 'LoopKart'} • {category.count} products live</p>
                  </div>
                  <span className="category-card__action">
                    Open category
                    <ArrowRight size={15} />
                  </span>
                </RevealOnScroll>
              );
            })}
          </div>
        ) : (
          <>
            <div className="category-toolbar">
              <button className="category-toolbar__back" onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}>
                <ArrowLeft size={16} />
                Back to categories
              </button>
              <div className="market-search market-search--inline">
                <div className="market-search__field">
                  <Search size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search in this category"
                  />
                  {searchQuery ? (
                    <button type="button" className="market-search__clear" onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="category-toolbar__meta">
                {normalizedSearch
                  ? `Showing ${visibleProducts.length} of ${selectedCategoryCount} matching products`
                  : `Showing ${visibleProducts.length} of ${selectedCategoryCount} products`}
              </p>
            </div>

            {filteredCategoryProducts.length === 0 ? (
              <RevealOnScroll className="trending-empty card card--glass" delay={120}>
                <PackageCheck size={28} />
                <p>No products matched your search in this category yet.</p>
              </RevealOnScroll>
            ) : (
              <div className="trending-grid">
                {visibleProducts.map((product, index) => {
                  const discountedBy = Math.max(1, Math.round((1 - product.price / product.originalPrice) * 100));
                  const inCart = items.some((item) => item._id === product._id);

                  return (
                    <RevealOnScroll key={product._id} as="article" className="market-card" delay={index * 80}>
                      <div className="market-card__media">
                        <img src={product.image} alt={product.name} />
                        <div className="market-card__topline">
                          <span>{product.category}</span>
                          <span>{conditionLabel(product.condition)}</span>
                        </div>

                        <button
                          className={`market-card__wish ${isWishlisted(product._id) ? 'market-card__wish--active' : ''}`}
                          onClick={() => toggleWishlist(product)}
                        >
                          <Heart size={15} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
                        </button>

                        <div className="market-card__overlay">
                          <div className="market-card__facts">
                            <span>{product.manufacturer}</span>
                            <span>{product.material}</span>
                            <span>Used {product.usageMonths} months</span>
                            <span>Health score {product.healthScore}/100</span>
                          </div>
                          <p>{product.usageSummary}</p>
                          <div className="market-card__overlay-actions">
                            <button onClick={() => navigate(`/product/${product._id}`)}>View</button>
                            <button onClick={() => handleQuickAdd(product)}>{inCart ? 'Added' : 'Quick add'}</button>
                          </div>
                        </div>
                      </div>

                      <div className="market-card__body">
                        <div className="market-card__seller">
                          <BadgeCheck size={15} />
                          <span>{product.sellerName}</span>
                        </div>
                        <h3>{product.name}</h3>
                        <p className="market-card__usage">{product.city} • {product.usageSummary}</p>

                        <div className="market-card__meta">
                          <span>★ {product.rating}</span>
                          <span>{compactNumber.format(product.reviews)} reviews</span>
                          <span>{compactNumber.format(product.views)} views</span>
                        </div>

                        <div className="market-card__price-row">
                          <div>
                            <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                            <span>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <em>{discountedBy}% off</em>
                        </div>

                        <div className="market-card__footer">
                          <span className="market-card__impact">
                            <Leaf size={14} />
                            {product.carbonSavedKg}kg CO2 saved
                          </span>
                          <button className="market-card__cta" onClick={() => navigate(`/product/${product._id}`)}>
                            View
                          </button>
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            )}
          </>
        )}
      </RevealOnScroll>

      <RevealOnScroll as="section" className="closing-cta container">
        <div className="closing-cta__card card card--glass">
          <div>
            <p className="section-heading__eyebrow">Built for real resale businesses</p>
            <h2>Ready to turn LoopKart into a serious circular commerce brand.</h2>
            <p>
              The new shell is already geared for premium discovery, seller-led inventory, better auth, and richer product storytelling.
            </p>
          </div>

          <div className="closing-cta__actions">
            <button className="hero-button hero-button--primary" onClick={handleSecondaryHero}>
              {user ? 'Open seller flow' : 'Create your account'}
            </button>
            <button className="hero-button hero-button--ghost" onClick={handlePrimaryHero}>
              {user ? 'See trending again' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
