import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useTailwindCart } from '../../context/TailwindCartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useTailwindCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6 text-brown-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag className="w-24 h-24 text-gray-300" />
              <p className="text-xl font-semibold text-gray-600">Your cart is empty</p>
              <p className="text-gray-400">Add some products to get started!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-brown-500 text-white rounded-xl font-semibold hover:bg-brown-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-4 bg-beige-50 rounded-xl border border-beige-200"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-brown-600">
                      ₹{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-beige-50">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="text-2xl font-bold text-brown-600">
                ₹{getTotal().toLocaleString()}
              </span>
            </div>
            <Link
              to="/tailwind-shop/checkout"
              onClick={onClose}
              className="block w-full py-4 bg-gradient-to-r from-brown-600 to-brown-700 text-white text-center rounded-xl font-bold text-lg hover:from-brown-700 hover:to-brown-800 transition-all shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-brown-500 text-brown-600 rounded-xl font-semibold hover:bg-brown-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
