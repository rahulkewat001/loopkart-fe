import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Building, ArrowLeft, CheckCircle } from 'lucide-react';
import TailwindNavbar from '../../components/tailwind/TailwindNavbar';
import { useTailwindCart } from '../../context/TailwindCartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useTailwindCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      navigate('/tailwind-shop');
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-beige-100 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fadeIn">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900">Order Placed Successfully!</h1>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <TailwindNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-brown-600 hover:text-brown-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  step >= 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  Step 1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brown-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3 bg-brown-500 text-white rounded-xl font-semibold hover:bg-brown-600 transition-colors"
              >
                Continue to Payment
              </button>
            </div>

            {/* Payment Method */}
            {step >= 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Step 2
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-brown-500 bg-brown-50'
                        : 'border-gray-200 hover:border-brown-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-brown-600" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, Rupay</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-brown-500 bg-brown-50'
                        : 'border-gray-200 hover:border-brown-300'
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-brown-600" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">UPI</p>
                      <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-brown-500 bg-brown-50'
                        : 'border-gray-200 hover:border-brown-300'
                    }`}
                  >
                    <Building className="w-6 h-6 text-brown-600" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Net Banking</p>
                      <p className="text-sm text-gray-500">All major banks</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-brown-600">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-brown-600">₹{getTotal().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={step < 2}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  step >= 2
                    ? 'bg-gradient-to-r from-brown-600 to-brown-700 text-white hover:from-brown-700 hover:to-brown-800 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Place Order
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
