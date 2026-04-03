import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import './ProductDetailPage.css';

const Stars = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={interactive
            ? (i < (hover || rating) ? 'star star--full' : 'star star--empty') + ' star--interactive'
            : (i < full ? 'star star--full' : (i === full && half ? 'star star--half' : 'star star--empty'))
          }
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i + 1)}
        >★</span>
      ))}
    </span>
  );
};

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { addToCart, items }             = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast }                        = useToast();

  const [product, setProduct]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setActiveImg(0);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`),
    ]).then(([p, r]) => {
      setProduct(p.data.product);
      setReviews(r.data.reviews);
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) api.put(`/products/${id}/view`).catch(() => {});
  }, [id]);

  if (loading) return <div className="page-loader">Loading product...</div>;
  if (!product) return null;

  const inCart     = items.some((i) => i._id === product._id);
  const wishlisted = isWishlisted(product._id);
  const disc       = Math.round((1 - product.price / product.originalPrice) * 100);
  const allImages  = product.images?.length ? product.images : (product.image ? [product.image] : []);

  const handleAddToCart = () => {
    addToCart(product);
    toast(`${product.name.slice(0, 25)}... added to cart! 🛒`);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!', wishlisted ? 'info' : 'success');
  };

  const handleChatSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product.seller) {
      toast('This is a platform product. Become a seller to list your own!', 'info');
      return;
    }
    if (product.seller?.toString() === user?._id?.toString()) {
      toast('This is your own listing', 'info');
      return;
    }
    setChatLoading(true);
    try {
      const { data } = await api.post('/chats', {
        sellerId:     product.seller,
        productId:    product._id,
        productName:  product.name,
        productEmoji: product.emoji,
      });
      navigate(`/chat/${data.chat._id}`);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to start chat', 'error');
    } finally { setChatLoading(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast('Please write a comment', 'warning'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
      setReviews((prev) => [data.review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast('Review submitted! ⭐', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="pdp-page">
      <Navbar />
      <div className="container pdp-inner">

        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span>›</span><span>{product.category}</span>
          <span>›</span><span>{product.name}</span>
        </div>

        <div className="pdp-layout animate-fadeUp">

          {/* ── Image Gallery ── */}
          <div className="pdp-gallery-column">
            <div className="pdp-gallery">
              {product.badge && <span className="pdp-badge">{product.badge}</span>}
              <button className={`pdp-wishlist ${wishlisted ? 'pdp-wishlist--active' : ''}`} onClick={handleWishlist}>
                {wishlisted ? '❤️' : '🤍'}
              </button>

              {/* Main image */}
              <div className="pdp-gallery__main">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImg]}
                    alt={product.name}
                    className="pdp-gallery__img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className="pdp-gallery__fallback" style={{ display: allImages.length ? 'none' : 'flex' }}>
                  {product.emoji}
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="pdp-gallery__thumbs">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      className={`pdp-gallery__thumb ${activeImg === i ? 'pdp-gallery__thumb--active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img} alt={`view ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Reviews ── */}
            <div className="reviews-section">
              <h2 className="reviews-title">Customer Reviews ({reviews.length})</h2>
              <form onSubmit={submitReview} className="review-form">
                <h3>Write a Review</h3>
                <div className="review-form__rating">
                  <span>Your Rating:</span>
                  <Stars rating={reviewForm.rating} interactive onRate={(r) => setReviewForm((p) => ({ ...p, rating: r }))} />
                  <span className="review-form__rating-val">{reviewForm.rating}/5</span>
                </div>
                <textarea
                  className="review-form__textarea"
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={3}
                />
                <Button type="submit" loading={submitting}>Submit Review</Button>
              </form>

              {reviews.length === 0 ? (
                <p className="reviews-empty">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => (
                    <div key={r._id} className="review-card animate-fadeUp">
                      <div className="review-card__header">
                        <div className="review-card__avatar">{r.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="review-card__name">{r.name}</p>
                          <p className="review-card__date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="review-card__comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="pdp-info">
            <span className="pdp-category">{product.category}</span>
            <h1 className="pdp-name">{product.name}</h1>

            <div className="pdp-rating">
              <Stars rating={product.rating} />
              <span className="pdp-rating-val">{product.rating}</span>
              <span className="pdp-reviews">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="pdp-pricing">
              <span className="pdp-price">₹{product.price.toLocaleString()}</span>
              <span className="pdp-original">₹{product.originalPrice.toLocaleString()}</span>
              <span className="pdp-discount">{disc}% off</span>
            </div>

            <p className="pdp-desc">{product.description}</p>

            <div className="pdp-spec-grid">
              <div className="pdp-spec-card">
                <span>Manufacturer</span>
                <strong>{product.manufacturer || 'LoopKart verified'}</strong>
              </div>
              <div className="pdp-spec-card">
                <span>Product health</span>
                <strong>{product.healthScore || 95}/100</strong>
              </div>
              <div className="pdp-spec-card">
                <span>Usage history</span>
                <strong>{product.usageMonths || 0} months</strong>
              </div>
              <div className="pdp-spec-card">
                <span>Material</span>
                <strong>{product.material || 'Mixed material'}</strong>
              </div>
            </div>

            {product.usageSummary ? (
              <div className="pdp-usage-note">
                <span>Condition note</span>
                <p>{product.usageSummary}</p>
              </div>
            ) : null}

            <div className="pdp-stock">
              <span className="pdp-stock-dot" />
              In Stock ({product.stock} units)
            </div>

            <div className="pdp-actions">
              <Button size="lg" fullWidth onClick={handleAddToCart} disabled={inCart}>
                {inCart ? '✅ Added to Cart' : '🛒 Add to Cart'}
              </Button>
              <Button size="lg" fullWidth variant="secondary" onClick={() => { if (!inCart) addToCart(product); navigate('/cart'); }}>
                Buy Now →
              </Button>
              {product.isSellerListing && product.seller?.toString() !== user?._id?.toString() ? (
                <Button size="lg" fullWidth variant="ghost" loading={chatLoading} onClick={handleChatSeller}>
                  💬 Chat with Seller
                </Button>
              ) : !product.isSellerListing ? (
                <Button size="lg" fullWidth variant="ghost" onClick={() => navigate('/chat')}>
                  💬 Chat Support
                </Button>
              ) : null}
            </div>

            <div className="pdp-features">
              {['🚚 Free Delivery', '🔄 30-Day Returns', '🔒 Secure Payment', '✅ Genuine Product'].map((f, i) => (
                <span key={i} className="pdp-feature">{f}</span>
              ))}
            </div>

            <div className="pdp-impact-strip">
              <span>♻ Saves {product.wasteSavedKg || 1}kg material waste</span>
              <span>🌿 Avoids {product.carbonSavedKg || 0}kg CO2</span>
              <span>📍 Shipped from {product.city || 'your nearest hub'}</span>
            </div>

            {product.isSellerListing && (
              <div className="pdp-seller">
                <p className="pdp-seller__label">🏪 Sold by</p>
                <div className="pdp-seller__card">
                  <div className="pdp-seller__avatar">{product.sellerName?.[0]?.toUpperCase()}</div>
                  <div>
                    <p className="pdp-seller__name">{product.sellerName}</p>
                    <p className="pdp-seller__condition">
                      Condition: <strong>{product.condition?.replace('_', ' ')}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
