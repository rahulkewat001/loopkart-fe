import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import './CartPage.css';

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, total, itemCount } = useCart();
  const { user }  = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [step, setStep]               = useState('cart'); // cart | address | payment | success
  const [loading, setLoading]         = useState(false);
  const [orderId, setOrderId]         = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // online | cod
  const [coupon, setCoupon]           = useState('');
  const [discount, setDiscount]       = useState(0);
  const [couponMsg, setCouponMsg]     = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [address, setAddress]         = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  const finalTotal = Math.max(0, total - discount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post('/orders/validate-coupon', { code: coupon, amount: total });
      setDiscount(data.discount);
      setAppliedCode(coupon.toUpperCase());
      setCouponMsg(data.message);
      toast(data.message, 'success');
    } catch (err) {
      setCouponMsg(err.response?.data?.message || 'Invalid coupon');
      toast('Invalid coupon code', 'error');
      setDiscount(0); setAppliedCode('');
    }
  };

  const removeCoupon = () => { setDiscount(0); setAppliedCode(''); setCouponMsg(''); setCoupon(''); };

  const validateAddress = () => {
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast('Please fill all address fields', 'warning'); return false;
    }
    if (!/^\d{10}$/.test(phone)) { toast('Enter a valid 10-digit phone number', 'warning'); return false; }
    if (!/^\d{6}$/.test(pincode)) { toast('Enter a valid 6-digit pincode', 'warning'); return false; }
    return true;
  };

  // ─── COD Order ────────────────────────────────────────────────
  const placeCODOrder = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, name: i.name, emoji: i.emoji, price: i.price, quantity: i.quantity })),
        totalAmount: finalTotal, address,
        couponCode: appliedCode || null, discountAmount: discount,
      });
      setOrderId(data.order._id);
      clearCart();
      setStep('success');
      toast('Order placed successfully! 🎉', 'success');
    } catch {
      toast('Order failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  // ─── Razorpay Online Payment ───────────────────────────────────
  const placeOnlineOrder = async () => {
    setLoading(true);
    try {
      // Step 1: Create order in our DB first
      const { data: orderData } = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, name: i.name, emoji: i.emoji, price: i.price, quantity: i.quantity })),
        totalAmount: finalTotal, address,
        couponCode: appliedCode || null, discountAmount: discount,
      });
      const dbOrderId = orderData.order._id;

      // Step 2: Create Razorpay payment order
      const { data: payData } = await api.post('/payment/create-order', { amount: finalTotal });

      // Step 3: Open Razorpay checkout
      const options = {
        key:         payData.keyId,
        amount:      payData.amount,
        currency:    payData.currency,
        name:        'LoopKart',
        description: `Order #${dbOrderId.slice(-8).toUpperCase()}`,
        order_id:    payData.orderId,
        prefill: {
          name:    user?.name,
          email:   user?.email,
          contact: address.phone,
        },
        theme: { color: '#a855f7' },
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             dbOrderId,
            });
            setOrderId(dbOrderId);
            clearCart();
            setStep('success');
            toast('Payment successful! 🎉', 'success');
          } catch {
            toast('Payment verification failed. Contact support.', 'error');
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', 'info');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast('Payment failed. Please try again.', 'error');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast(err.response?.data?.message || 'Payment initiation failed', 'error');
    } finally { setLoading(false); }
  };

  const handlePay = () => paymentMethod === 'cod' ? placeCODOrder() : placeOnlineOrder();

  // ─── Success Screen ────────────────────────────────────────────
  if (step === 'success') return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-success animate-fadeUp">
        <div className="cart-success__icon">🎉</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order <strong>#{orderId?.slice(-8).toUpperCase()}</strong> has been confirmed.</p>
        <p className="cart-success__sub">
          {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '✅ Payment Successful'}
        </p>
        <div className="cart-success__actions">
          <Button onClick={() => navigate('/orders')}>View My Orders</Button>
          <Button variant="ghost" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <Navbar />
      <div className="container cart-inner">

        {/* Step indicator */}
        {items.length > 0 && (
          <div className="cart-steps">
            {['Cart', 'Address', 'Payment'].map((s, i) => {
              const stepMap = { 'Cart': 0, 'Address': 1, 'Payment': 2 };
              const currentIdx = stepMap[step === 'cart' ? 'Cart' : step === 'address' ? 'Address' : 'Payment'];
              return (
                <div key={s} className={`cart-step ${i <= currentIdx ? 'cart-step--active' : ''}`}>
                  <div className="cart-step__dot">{i < currentIdx ? '✓' : i + 1}</div>
                  <span>{s}</span>
                  {i < 2 && <div className={`cart-step__line ${i < currentIdx ? 'cart-step__line--done' : ''}`} />}
                </div>
              );
            })}
          </div>
        )}

        <h1 className="cart-title">
          {step === 'cart' ? `My Cart (${itemCount})` : step === 'address' ? '📍 Delivery Address' : '💳 Payment'}
        </h1>

        {/* ── Empty Cart ── */}
        {items.length === 0 ? (
          <div className="cart-empty animate-fadeUp">
            <div className="cart-empty__icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started</p>
            <Button onClick={() => navigate('/')}>Shop Now</Button>
          </div>

        /* ── Step 1: Cart ── */
        ) : step === 'cart' ? (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item._id} className="cart-item animate-fadeUp">
                  <div className="cart-item__img">
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      : null
                    }
                    <span style={{ display: item.image ? 'none' : 'flex' }}>{item.emoji}</span>
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="cart-item__qty">
                    <button onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <p className="cart-item__subtotal">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="cart-item__remove" onClick={() => { removeFromCart(item._id); toast('Item removed', 'info'); }}>✕</button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3 className="cart-summary__title">Order Summary</h3>
              <div className="cart-summary__row"><span>Items ({itemCount})</span><span>₹{total.toLocaleString()}</span></div>
              {discount > 0 && <div className="cart-summary__row cart-summary__discount"><span>Discount ({appliedCode})</span><span>−₹{discount}</span></div>}
              <div className="cart-summary__row"><span>Delivery</span><span className="free">FREE</span></div>
              <div className="cart-summary__divider" />
              <div className="cart-summary__row cart-summary__total"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
              <div className="cart-coupon">
                {appliedCode ? (
                  <div className="cart-coupon__applied">
                    <span>🏷️ <strong>{appliedCode}</strong> applied! Saved ₹{discount}</span>
                    <button onClick={removeCoupon}>✕</button>
                  </div>
                ) : (
                  <div className="cart-coupon__input">
                    <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && applyCoupon()} />
                    <button onClick={applyCoupon}>Apply</button>
                  </div>
                )}
                {couponMsg && !appliedCode && <p className="cart-coupon__msg">{couponMsg}</p>}
                <p className="cart-coupon__hint">Try: LOOP40 · SAVE100 · FIRST50</p>
              </div>
              <Button fullWidth size="lg" onClick={() => setStep('address')}>Proceed to Checkout →</Button>
            </div>
          </div>

        /* ── Step 2: Address ── */
        ) : step === 'address' ? (
          <div className="cart-layout">
            <div className="cart-address animate-fadeUp">
              <h3 className="cart-address__title">Delivery Address</h3>
              <div className="cart-address__grid">
                {[
                  { name: 'fullName', label: 'Full Name',      placeholder: 'John Doe',      col: 1 },
                  { name: 'phone',    label: 'Phone Number',   placeholder: '9876543210',    col: 1 },
                  { name: 'street',   label: 'Street Address', placeholder: '123, MG Road',  col: 2 },
                  { name: 'city',     label: 'City',           placeholder: 'Mumbai',        col: 1 },
                  { name: 'state',    label: 'State',          placeholder: 'Maharashtra',   col: 1 },
                  { name: 'pincode',  label: 'Pincode',        placeholder: '400001',        col: 1 },
                ].map((f) => (
                  <div key={f.name} className={`addr-field ${f.col === 2 ? 'addr-field--full' : ''}`}>
                    <label>{f.label}</label>
                    <input placeholder={f.placeholder} value={address[f.name]} onChange={(e) => setAddress((p) => ({ ...p, [f.name]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="cart-summary">
              <h3 className="cart-summary__title">Order Summary</h3>
              {items.map((i) => (
                <div key={i._id} className="cart-summary__item">
                  <span>{i.emoji} {i.name.slice(0, 22)}...</span>
                  <span className="cart-summary__item-qty">×{i.quantity}</span>
                </div>
              ))}
              <div className="cart-summary__divider" />
              {discount > 0 && <div className="cart-summary__row cart-summary__discount"><span>Discount</span><span>−₹{discount}</span></div>}
              <div className="cart-summary__row cart-summary__total"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
              <Button fullWidth size="lg" onClick={() => { if (validateAddress()) setStep('payment'); }}>Continue to Payment →</Button>
              <button className="cart-back" onClick={() => setStep('cart')}>← Back to Cart</button>
            </div>
          </div>

        /* ── Step 3: Payment ── */
        ) : (
          <div className="cart-layout">
            <div className="cart-payment animate-fadeUp">
              <h3 className="cart-payment__title">Choose Payment Method</h3>

              {/* Online Payment */}
              <div className={`payment-option ${paymentMethod === 'online' ? 'payment-option--active' : ''}`} onClick={() => setPaymentMethod('online')}>
                <div className="payment-option__radio">{paymentMethod === 'online' && <div className="payment-option__radio-dot" />}</div>
                <div className="payment-option__icon">💳</div>
                <div className="payment-option__info">
                  <p className="payment-option__title">Pay Online</p>
                  <p className="payment-option__desc">UPI, Cards, Net Banking via Razorpay</p>
                </div>
                <div className="payment-option__badges">
                  <span>UPI</span><span>Visa</span><span>MC</span>
                </div>
              </div>

              {/* COD */}
              <div className={`payment-option ${paymentMethod === 'cod' ? 'payment-option--active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                <div className="payment-option__radio">{paymentMethod === 'cod' && <div className="payment-option__radio-dot" />}</div>
                <div className="payment-option__icon">💵</div>
                <div className="payment-option__info">
                  <p className="payment-option__title">Cash on Delivery</p>
                  <p className="payment-option__desc">Pay when your order arrives</p>
                </div>
              </div>

              {/* Address summary */}
              <div className="cart-addr-summary">
                <p className="cart-addr-summary__label">📍 Delivering to</p>
                <p className="cart-addr-summary__text">{address.fullName} · {address.phone}</p>
                <p className="cart-addr-summary__text">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                <button className="cart-addr-summary__change" onClick={() => setStep('address')}>Change</button>
              </div>
            </div>

            <div className="cart-summary">
              <h3 className="cart-summary__title">Order Summary</h3>
              {items.map((i) => (
                <div key={i._id} className="cart-summary__item">
                  <span>{i.emoji} {i.name.slice(0, 22)}...</span>
                  <span className="cart-summary__item-qty">×{i.quantity}</span>
                </div>
              ))}
              <div className="cart-summary__divider" />
              <div className="cart-summary__row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              {discount > 0 && <div className="cart-summary__row cart-summary__discount"><span>Discount ({appliedCode})</span><span>−₹{discount}</span></div>}
              <div className="cart-summary__row"><span>Delivery</span><span className="free">FREE</span></div>
              <div className="cart-summary__divider" />
              <div className="cart-summary__row cart-summary__total"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
              <Button fullWidth size="lg" loading={loading} onClick={handlePay}>
                {paymentMethod === 'cod' ? '🎉 Place Order (COD)' : `💳 Pay ₹${finalTotal.toLocaleString()}`}
              </Button>
              <button className="cart-back" onClick={() => setStep('address')}>← Back to Address</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
