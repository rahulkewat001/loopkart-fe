import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import './WishlistPage.css';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart, items: cartItems } = useCart();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const inCart = (id) => cartItems.some((i) => i._id === id);
  const disc   = (p, o) => Math.round((1 - p / o) * 100);

  return (
    <div className="wishlist-page">
      <Navbar />
      <div className="container wishlist-inner">
        <h1 className="wishlist-title">❤️ My Wishlist ({items.length})</h1>

        {items.length === 0 ? (
          <div className="wishlist-empty animate-fadeUp">
            <div className="wishlist-empty__icon">💔</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love to buy them later</p>
            <Button onClick={() => navigate('/')}>Explore Products</Button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((p) => (
              <div key={p._id} className="wishlist-card animate-fadeUp">
                <button className="wishlist-card__remove" onClick={() => { removeFromWishlist(p._id); toast('Removed from wishlist', 'info'); }}>✕</button>
                <div className="wishlist-card__img" onClick={() => navigate(`/product/${p._id}`)}>
                    {p.image
                      ? <img src={p.image} alt={p.name} onError={(e) => { e.target.style.display='none'; }} />
                      : <span>{p.emoji}</span>
                    }
                  </div>
                <div className="wishlist-card__body">
                  <p className="wishlist-card__name">{p.name}</p>
                  <div className="wishlist-card__pricing">
                    <span className="wishlist-card__price">₹{p.price.toLocaleString()}</span>
                    <span className="wishlist-card__original">₹{p.originalPrice.toLocaleString()}</span>
                    <span className="wishlist-card__discount">{disc(p.price, p.originalPrice)}% off</span>
                  </div>
                  <Button
                    fullWidth
                    variant={inCart(p._id) ? 'ghost' : 'primary'}
                    onClick={() => { addToCart(p); toast(`${p.name.slice(0, 20)}... added to cart!`); }}
                    disabled={inCart(p._id)}
                  >
                    {inCart(p._id) ? '✅ In Cart' : '🛒 Add to Cart'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
