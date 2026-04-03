import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { CreditCard, Smartphone, Building2, Wallet, MapPin, Package, Truck, CheckCircle } from 'lucide-react';
import './CheckoutPaymentPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [address, setAddress] = useState(location.state?.address || {
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [items, navigate, orderSuccess]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const { data } = await axios.post(`${API_URL}/payment/create-order`, {
        amount: total,
        currency: 'INR'
      }, { withCredentials: true });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'LoopKart',
        description: 'Order Payment',
        order_id: data.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, { withCredentials: true });

            if (verifyRes.data.success) {
              await createOrder(response.razorpay_payment_id, 'paid');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: '#8B6B47'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);
    try {
      await createOrder(null, 'pending');
    } catch (error) {
      console.error('COD order error:', error);
      alert('Order placement failed. Please try again.');
      setLoading(false);
    }
  };

  const createOrder = async (paymentId, paymentStatus) => {
    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          emoji: item.emoji,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        paymentId,
        paymentStatus,
        address
      };

      await axios.post(`${API_URL}/orders`, orderData, { withCredentials: true });
      
      setOrderSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      throw error;
    }
  };

  const handlePlaceOrder = () => {
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      alert('Please fill in all address fields');
      return;
    }

    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handleOnlinePayment();
    }
  };

  if (orderSuccess) {
    return (
      <div className="checkout-success">
        <div className="success-animation">
          <CheckCircle size={80} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p>Redirecting to orders page...</p>
      </div>
    );
  }

  return (
    <div className="checkout-payment-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <div className="checkout-card">
            <div className="card-header">
              <MapPin size={24} />
              <h2>Delivery Address</h2>
            </div>
            <div className="address-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={(e) => setAddress({...address, fullName: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
              <div className="form-row">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({...address, pincode: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <div className="card-header">
              <Wallet size={24} />
              <h2>Payment Method</h2>
            </div>

            <div className="payment-section">
              <h3>Pay Online</h3>
              
              <label className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Smartphone size={20} />
                <span>UPI</span>
              </label>

              {paymentMethod === 'upi' && (
                <div className="payment-details">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., name@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard size={20} />
                <span>Credit / Debit Card</span>
              </label>

              {paymentMethod === 'card' && (
                <div className="payment-details">
                  <input
                    type="text"
                    placeholder="Card Number"
                    maxLength="16"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      maxLength="3"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <label className={`payment-option ${paymentMethod === 'netbanking' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Building2 size={20} />
                <span>Net Banking</span>
              </label>
            </div>

            <div className="payment-section">
              <h3>Other Methods</h3>
              
              <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Package size={20} />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <div className="checkout-card order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {items.map(item => (
                <div key={item._id} className="order-item">
                  <span className="item-emoji">{item.emoji}</span>
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="total-row delivery">
                <span><Truck size={16} /> Delivery</span>
                <span className="free">FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
            </button>

            <div className="secure-payment">
              <p>🔒 Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
