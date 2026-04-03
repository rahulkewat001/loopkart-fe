import { useState } from 'react';
import { Heart, ShoppingCart, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { useTailwindCart } from '../../context/TailwindCartContext';
import { useTailwindWishlist } from '../../context/TailwindWishlistContext';

export default function ProductCard({ product, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, isInCart } = useTailwindCart();
  const { toggleWishlist, isInWishlist } = useTailwindWishlist();

  const getBadgeConfig = () => {
    switch (product.badge) {
      case 'SALE':
        return { icon: Zap, bg: 'bg-red-500', text: 'text-white' };
      case 'BEST SELLER':
        return { icon: TrendingUp, bg: 'bg-brown-500', text: 'text-white' };
      case 'TOP RATED':
        return { icon: Award, bg: 'bg-green-500', text: 'text-white' };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig();
  const BadgeIcon = badgeConfig?.icon;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 hover:border-brown-300 transform hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-beige-50 to-beige-100 overflow-hidden">
        {/* Badge */}
        {product.badge && badgeConfig && (
          <div className={`absolute top-3 left-3 ${badgeConfig.bg} ${badgeConfig.text} px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 z-10 shadow-lg`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{product.badge}</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110'
          } shadow-lg`}
        >
          <Heart
            className={`w-5 h-5 transition-all ${isInWishlist(product.id) ? 'fill-current' : ''}`}
          />
        </button>

        {/* Product Image */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <span className="inline-block px-3 py-1 bg-beige-100 text-brown-600 text-xs font-semibold rounded-full">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 min-h-[3rem] group-hover:text-brown-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-0.5">
            {renderStars()}
          </div>
          <span className="text-sm text-gray-500">
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {product.discount}% OFF
          </span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isInCart(product.id)}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isInCart(product.id)
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-brown-500 text-white hover:bg-brown-600 hover:shadow-lg active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isInCart(product.id) ? 'Added' : 'Add'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Buy now logic
            }}
            className="flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-brown-600 to-brown-700 text-white rounded-xl font-semibold text-sm hover:from-brown-700 hover:to-brown-800 transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
