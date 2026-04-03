import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Bell, User, Search, Menu, X, Moon, Sun } from 'lucide-react';
import { useTailwindCart } from '../../context/TailwindCartContext';
import { useTailwindWishlist } from '../../context/TailwindWishlistContext';

export default function TailwindNavbar({ onSearch, onCartOpen, darkMode, toggleDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getItemCount } = useTailwindCart();
  const { count: wishlistCount } = useTailwindWishlist();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/tailwind-shop" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brown-500 to-brown-700 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brown-600 to-brown-800 bg-clip-text text-transparent">
              LoopKart
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-brown-500 focus:outline-none transition-colors"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="relative p-2 hover:bg-beige-100 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <Link
              to="/tailwind-shop/wishlist"
              className="relative p-2 hover:bg-beige-100 rounded-full transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button className="relative p-2 hover:bg-beige-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-beige-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brown-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
            </button>

            <Link
              to="/tailwind-shop/profile"
              className="p-2 hover:bg-beige-100 rounded-full transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-beige-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-brown-500 focus:outline-none"
            />
          </div>
        </form>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/tailwind-shop/wishlist"
              className="flex items-center justify-between p-3 hover:bg-beige-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center space-x-3">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </span>
              {wishlistCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                onCartOpen();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-beige-100 rounded-lg transition-colors"
            >
              <span className="flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </span>
              {getItemCount() > 0 && (
                <span className="px-2 py-1 bg-brown-500 text-white text-xs rounded-full">
                  {getItemCount()}
                </span>
              )}
            </button>

            <Link
              to="/tailwind-shop/profile"
              className="flex items-center space-x-3 p-3 hover:bg-beige-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
