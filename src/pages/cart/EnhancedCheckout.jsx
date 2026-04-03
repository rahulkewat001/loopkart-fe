import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { 
  CreditCard, Smartphone, Building2, Wallet, MapPin, 
  Package, Truck, CheckCircle, ShieldCheck, Lock,
  ArrowRight, ArrowLeft, User, Phone, Home, MapPinned
} from 'lucide-react';
import './EnhancedCheckout.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function EnhancedCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [address, setAddress] = useState({
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

  const validateAddress = () => {
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      alert('Please fill in all address fields');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
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
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: '#8B6B47'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
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
    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handleOnlinePayment();
    }
  };

  const handleContinueToPayment = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  if (orderSuccess) {
    return (
      <div className="enhanced-checkout">
        <div className="checkout-success-screen">
          <div className="success-checkmark">
            <CheckCircle size={100} strokeWidth={2} />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              View Orders
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-checkout">
      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className="progress-container">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 1 ? <CheckCircle size={20} /> : '1'}
            </div>
            <span>Address</span>
          </div>
          <div className={`progress-line ${step > 1 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="checkout-main">
        {/* Left Section */}
        <div className="checkout-left">
          {step === 1 ? (
            // Address Form
            <div className="checkout-section address-section">
              <div className="section-header">
                <MapPin size={24} />
                <h2>Delivery Address</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value.replace(/\D/g, '')})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <Home size={16} />
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="House no., Building name, Street"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <MapPinned size={16} />
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    maxLength="6"
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
              </div>

              <button className="btn-continue" onClick={handleContinueToPayment}>
                Continue to Payment
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            // Payment Methods
            <div className="checkout-section payment-section">
              <div className="section-header">
                <Wallet size={24} />
                <h2>Payment Method</h2>
              </div>

              <div className="payment-methods">
                <h3 className="payment-category">Pay Online</h3>
                
                {/* UPI */}
                <div 
                  className={`payment-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="payment-radio">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="payment-icon upi-icon">
                    <Smartphone size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>UPI</h4>
                    <p>Pay via Google Pay, PhonePe, Paytm</p>
                  </div>
                  <div className="payment-badges">
                    <span className="badge">GPay</span>
                    <span className="badge">PhonePe</span>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="payment-input-section">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g., name@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="upi-input"
                    />
                  </div>
                )}

                {/* Card */}
                <div 
                  className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="payment-radio">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="payment-icon card-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>Credit / Debit Card</h4>
                    <p>Visa, Mastercard, Amex, Rupay</p>
                  </div>
                  <div className="payment-badges">
                    <span className="badge">Visa</span>
                    <span className="badge">MC</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="payment-input-section card-inputs">
                    <input
                      type="text"
                      placeholder="Card Number"
                      maxLength="16"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g, '')})}
                    />
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    />
                    <div className="card-row">
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
                        onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                <div 
                  className={`payment-card ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <div className="payment-radio">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="payment-icon bank-icon">
                    <Building2 size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>Net Banking</h4>
                    <p>All major banks supported</p>
                  </div>
                </div>

                <h3 className="payment-category">Other Methods</h3>

                {/* COD */}
                <div 
                  className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-radio">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="payment-icon cod-icon">
                    <Package size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>Cash on Delivery</h4>
                    <p>Pay when your order arrives</p>
                  </div>
                </div>
              </div>

              {/* Address Summary */}
              <div className="address-summary">
                <div className="summary-header">
                  <MapPin size={18} />
                  <span>Delivering to</span>
                </div>
                <p className="summary-name">{address.fullName}</p>
                <p className="summary-address">
                  {address.street}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="summary-phone">Phone: {address.phone}</p>
                <button className="btn-change" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} />
                  Change Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {items.map(item => (
                <div key={item._id} className="summary-item">
                  <div className="item-image">
                    {item.emoji}
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="total-row delivery">
                <span>
                  <Truck size={16} />
                  Delivery Charges
                </span>
                <span className="free-badge">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="total-row grand-total">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {step === 2 && (
              <>
                <button 
                  className="btn-place-order"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      <Lock size={18} />
                      {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${total.toLocaleString()}`}
                    </>
                  )}
                </button>

                <div className="secure-badge">
                  <ShieldCheck size={16} />
                  <span>100% Secure Payment</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
