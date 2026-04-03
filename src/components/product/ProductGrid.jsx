import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, TrendingUp, Award, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../ui/Toast/ToastContext';
import './ProductGrid.css';

const Stars = ({ rating }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return (
    <span className="product-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'product-star product-star--full' : (i === full && half ? 'product-star product-star--half' : 'product-star product-star--empty')}>★</span>
      ))}
    </span>
  );
};

const getBadgeConfig = (badge) => {
  const configs = {
    'SALE': { icon: Zap, color: '#ff4757', bg: '#ffe6e9' },
    'BEST SELLER': { icon: TrendingUp, color: '#2ecc71', bg: '#e8f8f0' },
    'TOP RATED': { icon: Award, color: '#f39c12', bg: '#fff4e6' },
  };
  return configs[badge] || { icon: Star, color: '#3498db', bg: '#e3f2fd' };
};

export default function ProductGrid({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();
  
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  const ITEMS_PER_PAGE = 20;

  // Load initial products
  useEffect(() => {
    setDisplayedProducts(products.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(products.length > ITEMS_PER_PAGE);
  }, [products]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = products.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(endIndex < products.length);
    } else {
      setHasMore(false);
    }
  }, [page, products, hasMore, loading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, options);

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading]);

  const disc = (price, original) => Math.round((1 - price / original) * 100);
  const inCart = (id) => items.some((i) => i._id === id);

  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-grid-card product-grid-card--skeleton">
            <div className="skeleton-img"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-line--title"></div>
              <div className="skeleton-line skeleton-line--text"></div>
              <div className="skeleton-line skeleton-line--price"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="product-grid-empty">
        <ShoppingCart size={64} />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="product-grid">
        {displayedProducts.map((product, index) => {
          const badgeConfig = product.badge ? getBadgeConfig(product.badge) : null;
          const BadgeIcon = badgeConfig?.icon;
          
          return (
            <div 
              key={`${product._id}-${index}`} 
              className="product-grid-card animate-fadeUp"
              style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 0.05}s` }}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {/* Badge */}
              {product.badge && badgeConfig && (
                <div 
                  className="product-grid-card__badge"
                  style={{ background: badgeConfig.bg, color: badgeConfig.color }}
                >
                  <BadgeIcon size={12} />
                  <span>{product.badge}</span>
                </div>
              )}

              {/* Wishlist */}
              <button
                className={`product-grid-card__wishlist ${isWishlisted(product._id) ? 'product-grid-card__wishlist--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                  toast(
                    isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist!',
                    isWishlisted(product._id) ? 'info' : 'success'
                  );
                }}
              >
                <Heart size={16} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
              </button>

              {/* Image */}
              <div className="product-grid-card__image">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="product-grid-card__emoji" style={{ display: product.image ? 'none' : 'flex' }}>
                  {product.emoji}
                </span>
              </div>

              {/* Content */}
              <div className="product-grid-card__content">
                {/* Category */}
                <span className="product-grid-card__category">{product.category}</span>

                {/* Name */}
                <h3 className="product-grid-card__name">{product.name}</h3>

                {/* Rating */}
                <div className="product-grid-card__rating">
                  <Stars rating={product.rating} />
                  <span className="product-grid-card__reviews">({product.reviews?.toLocaleString() || 0})</span>
                </div>

                {/* Pricing */}
                <div className="product-grid-card__pricing">
                  <div className="product-grid-card__price-row">
                    <span className="product-grid-card__price">₹{product.price?.toLocaleString('en-IN')}</span>
                    <span className="product-grid-card__original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="product-grid-card__discount">{disc(product.price, product.originalPrice)}% OFF</span>
                </div>

                {/* Add to Cart Button */}
                <button
                  className={`product-grid-card__btn ${inCart(product._id) ? 'product-grid-card__btn--added' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!inCart(product._id)) {
                      addToCart(product);
                      toast(`${product.name.slice(0, 25)}... added to cart! 🛒`);
                    }
                  }}
                >
                  {inCart(product._id) ? (
                    <>
                      <Star size={14} fill="currentColor" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loader for infinite scroll */}
      {hasMore && (
        <div ref={loaderRef} className="product-grid-loader">
          <div className="product-grid-spinner"></div>
          <p>Loading more products...</p>
        </div>
      )}

      {/* End message */}
      {!hasMore && displayedProducts.length > 0 && (
        <div className="product-grid-end">
          <p>You've reached the end! 🎉</p>
          <p className="product-grid-end__count">Showing all {displayedProducts.length} products</p>
        </div>
      )}
    </>
  );
}
