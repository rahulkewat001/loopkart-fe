import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../ui/Toast/ToastContext';
import api from '../../utils/api';
import './TrendingProducts.css';

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="trending-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? 'star-full' : (i === full && half ? 'star-half' : 'star-empty')}
          fill={i < full ? 'currentColor' : (i === full && half ? 'currentColor' : 'none')}
        />
      ))}
    </span>
  );
};

export default function TrendingProducts() {
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?limit=12&sort=rating').then(({ data }) => {
      setTrendingProducts(data.products || []);
    }).catch(() => {
      setTrendingProducts([]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="trending-section">
        <div className="container">
          <div className="trending-header">
            <div className="trending-header__left">
              <div className="trending-header__icon"><TrendingUp size={28} /></div>
              <div>
                <h2 className="trending-header__title">Trending Products</h2>
                <p className="trending-header__subtitle">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (trendingProducts.length === 0) return null;

  const discount = (price, original) => Math.round((1 - price / original) * 100);
  const inCart = (id) => items.some((i) => i._id === id);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    toast(`${product.name} added to cart! 🛒`, 'success');
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast(
      isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist! ❤️',
      isWishlisted(product._id) ? 'info' : 'success'
    );
  };

  return (
    <section className="trending-section">
      <div className="container">
        {/* Section Header */}
        <div className="trending-header">
          <div className="trending-header__left">
            <div className="trending-header__icon">
              <TrendingUp size={28} />
            </div>
            <div>
              <h2 className="trending-header__title">Trending Products</h2>
              <p className="trending-header__subtitle">Top picks from all categories</p>
            </div>
          </div>
          <div className="trending-header__count">
            {trendingProducts.length} products
          </div>
        </div>

        {/* Products Grid */}
        <div className="trending-grid">
          {trendingProducts.map((product, index) => (
            <div
              key={product._id}
              className="trending-card"
              style={{ animationDelay: `${index * 0.05}s` }}
              onMouseEnter={() => setHoveredCard(product._id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {/* Badge */}
              {product.badge && (
                <span className={`trending-badge trending-badge--${product.badge.toLowerCase().replace(' ', '-')}`}>
                  {product.badge}
                </span>
              )}

              {/* Wishlist Button */}
              <button
                className={`trending-wishlist ${isWishlisted(product._id) ? 'trending-wishlist--active' : ''}`}
                onClick={(e) => handleWishlist(e, product)}
              >
                <Heart
                  size={18}
                  fill={isWishlisted(product._id) ? 'currentColor' : 'none'}
                />
              </button>

              {/* Product Image */}
              <div className="trending-card__image">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="trending-card__emoji" style={{ display: 'none' }}>
                  {product.emoji}
                </span>
              </div>

              {/* Product Info */}
              <div className="trending-card__body">
                <p className="trending-card__category">{product.category}</p>
                <h3 className="trending-card__name">{product.name}</h3>

                {/* Rating */}
                <div className="trending-card__rating">
                  <Stars rating={product.rating} />
                  <span className="trending-card__reviews">
                    ({product.reviews.toLocaleString()})
                  </span>
                </div>

                {/* Pricing */}
                <div className="trending-card__pricing">
                  <div className="trending-card__price-row">
                    <span className="trending-card__price">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="trending-card__original">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="trending-card__discount">
                    {discount(product.price, product.originalPrice)}% off
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  className={`trending-card__btn ${inCart(product._id) ? 'trending-card__btn--added' : ''}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingCart size={16} />
                  {inCart(product._id) ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
