import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ChevronLeft, ChevronRight, Zap, TrendingUp, Sparkles, Package } from 'lucide-react';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    badge: 'New Arrivals Every Day',
    icon: Zap,
    title: 'Shop Smart,',
    titleAccent: 'Live Better',
    description: 'Discover thousands of products at unbeatable prices. From electronics to fashion — everything you need, delivered fast.',
    stats: [
      { value: '50K+', label: 'Products' },
      { value: '2M+', label: 'Customers' },
      { value: '4.8★', label: 'Rating' }
    ],
    products: [
      { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', emoji: '🎧' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', emoji: '👟' },
      { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', emoji: '⌚' },
      { img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80', emoji: '✨' },
      { img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80', emoji: '⌨️' },
      { img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80', emoji: '📚' },
    ]
  },
  {
    id: 2,
    badge: 'Fresh Collection',
    icon: Sparkles,
    title: 'New Arrivals',
    titleAccent: 'Just Dropped',
    description: 'Explore the latest trends and hottest products. Be the first to grab exclusive items before they sell out.',
    stats: [
      { value: '100+', label: 'New Items' },
      { value: 'Daily', label: 'Updates' },
      { value: 'Fresh', label: 'Stock' }
    ],
    products: [
      { img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80', emoji: '👕' },
      { img: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=200&q=80', emoji: '🕯️' },
      { img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80', emoji: '👜' },
      { img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80', emoji: '👗' },
      { img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&q=80', emoji: '🎒' },
      { img: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=200&q=80', emoji: '👞' },
    ]
  },
  {
    id: 3,
    badge: 'Limited Time Offer',
    icon: TrendingUp,
    title: 'Best Deals',
    titleAccent: 'Up to 60% Off',
    description: 'Massive discounts on top brands. Save big on electronics, fashion, home essentials and more. Hurry, limited stock!',
    stats: [
      { value: '60%', label: 'Max Off' },
      { value: '500+', label: 'Deals' },
      { value: 'Today', label: 'Only' }
    ],
    products: [
      { img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=200&q=80', emoji: '📱' },
      { img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=80', emoji: '💻' },
      { img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80', emoji: '⌚' },
      { img: 'https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=200&q=80', emoji: '🎮' },
      { img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80', emoji: '📷' },
      { img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=200&q=80', emoji: '🎧' },
    ]
  },
  {
    id: 4,
    badge: 'Hot Right Now',
    icon: Package,
    title: 'Trending',
    titleAccent: 'Products',
    description: 'What everyone is buying right now. Join thousands of happy customers and discover why these products are flying off the shelves.',
    stats: [
      { value: '1000+', label: 'Sold Today' },
      { value: 'Top', label: 'Rated' },
      { value: '4.9★', label: 'Reviews' }
    ],
    products: [
      { img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80', emoji: '👜' },
      { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', emoji: '🎧' },
      { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', emoji: '⌚' },
      { img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80', emoji: '👗' },
      { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', emoji: '👟' },
      { img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80', emoji: '📚' },
    ]
  }
];

export default function HeroSlider() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useRef(null);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(0);
    setTouchEnd(0);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div 
      className="hero-slider"
      ref={sliderRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative floating shapes */}
      <div className="hero-slider__bg-shapes">
        <div className="shape shape--1"></div>
        <div className="shape shape--2"></div>
        <div className="shape shape--3"></div>
      </div>

      <div className="container hero-slider__container">
        {/* Slides */}
        <div className="hero-slider__slides">
          {slides.map((slideItem, index) => (
            <div
              key={slideItem.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''} ${
                index < currentSlide ? 'prev' : ''
              } ${index > currentSlide ? 'next' : ''}`}
            >
              {/* Left Content */}
              <div className="hero-slide__content">
                <div className="hero-slide__badge">
                  <slideItem.icon size={14} />
                  <span>{slideItem.badge}</span>
                </div>

                <h1 className="hero-slide__title">
                  {slideItem.title}
                  <br />
                  <span className="hero-slide__title-accent">{slideItem.titleAccent}</span>
                </h1>

                <p className="hero-slide__description">{slideItem.description}</p>

                <div className="hero-slide__actions">
                  <button 
                    className="hero-btn hero-btn--primary"
                    onClick={() => navigate('/')}
                  >
                    <ShoppingBag size={18} />
                    Shop Now
                  </button>
                  <button 
                    className="hero-btn hero-btn--secondary"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart size={18} />
                    View Cart
                  </button>
                </div>

                <div className="hero-slide__stats">
                  {slideItem.stats.map((stat, idx) => (
                    <div key={idx} className="hero-stat">
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Product Grid */}
              <div className="hero-slide__products">
                {slideItem.products.map((product, idx) => (
                  <div 
                    key={idx} 
                    className="hero-product-card"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <img 
                      src={product.img} 
                      alt="Product" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span className="hero-product-card__emoji" style={{ display: 'none' }}>
                      {product.emoji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="hero-slider__arrow hero-slider__arrow--prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="hero-slider__arrow hero-slider__arrow--next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dot Indicators */}
        <div className="hero-slider__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-slider__dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
