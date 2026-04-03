import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../ui/Toast/ToastContext';
import './TrendingProducts.css';

const trendingProducts = [
  {
    _id: 'trend-1',
    name: 'iPhone 14 Pro Max',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1678652197950-91e3f0a0f0a8?w=400&q=80',
    emoji: '📱',
    price: 11999,
    originalPrice: 15999,
    rating: 4.8,
    reviews: 2847,
    badge: 'Best Seller',
    stock: 45
  },
  {
    _id: 'trend-2',
    name: 'Premium Cotton T-Shirt',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    emoji: '👕',
    price: 399,
    originalPrice: 999,
    rating: 4.5,
    reviews: 1523,
    badge: 'Sale',
    stock: 120
  },
  {
    _id: 'trend-3',
    name: 'Vitamin C Face Serum',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    emoji: '✨',
    price: 899,
    originalPrice: 1499,
    rating: 4.7,
    reviews: 892,
    badge: 'Top Rated',
    stock: 67
  },
  {
    _id: 'trend-4',
    name: 'Nike Air Max Sneakers',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    emoji: '👟',
    price: 1799,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 1245,
    badge: 'Sale',
    stock: 34
  },
  {
    _id: 'trend-5',
    name: 'MacBook Pro 14" M2',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    emoji: '💻',
    price: 89999,
    originalPrice: 119999,
    rating: 4.9,
    reviews: 567,
    badge: 'Best Seller',
    stock: 12
  },
  {
    _id: 'trend-6',
    name: 'Atomic Habits Book',
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    emoji: '📚',
    price: 599,
    originalPrice: 999,
    rating: 4.8,
    reviews: 3421,
    badge: 'Top Rated',
    stock: 89
  },
  {
    _id: 'trend-7',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    emoji: '🎧',
    price: 24999,
    originalPrice: 29999,
    rating: 4.7,
    reviews: 1876,
    badge: 'Best Seller',
    stock: 23
  },
  {
    _id: 'trend-8',
    name: 'Leather Wallet',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
    emoji: '👛',
    price: 799,
    originalPrice: 1499,
    rating: 4.4,
    reviews: 654,
    badge: 'Sale',
    stock: 156
  },
  {
    _id: 'trend-9',
    name: 'Slim Fit Denim Jeans',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    emoji: '👖',
    price: 1299,
    originalPrice: 2499,
    rating: 4.3,
    reviews: 987,
    badge: 'Sale',
    stock: 78
  },
  {
    _id: 'trend-10',
    name: 'Hydrating Face Wash',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
    emoji: '🧴',
    price: 349,
    originalPrice: 599,
    rating: 4.6,
    reviews: 1234,
    badge: 'Top Rated',
    stock: 234
  },
  {
    _id: 'trend-11',
    name: 'Smart Watch Series 8',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    emoji: '⌚',
    price: 3999,
    originalPrice: 5999,
    rating: 4.5,
    reviews: 2341,
    badge: 'Best Seller',
    stock: 45
  },
  {
    _id: 'trend-12',
    name: 'Ceramic Coffee Mug Set',
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80',
    emoji: '☕',
    price: 599,
    originalPrice: 999,
    rating: 4.7,
    reviews: 456,
    badge: 'Sale',
    stock: 167
  }
];

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
