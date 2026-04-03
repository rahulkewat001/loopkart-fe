import { useState, useEffect, useRef, useCallback } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import TailwindNavbar from '../../components/tailwind/TailwindNavbar';
import ProductCard from '../../components/tailwind/ProductCard';
import ProductSkeleton from '../../components/tailwind/ProductSkeleton';
import CartDrawer from '../../components/tailwind/CartDrawer';
import BackToTop from '../../components/tailwind/BackToTop';
import { generateProducts, filterProducts } from '../../utils/productGenerator';

const categories = ['All', 'Electronics', 'Fashion', 'Beauty', 'Home', 'Grocery', 'Accessories'];

export default function TailwindShop() {
  const [allProducts] = useState(() => generateProducts(1000));
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  const observerRef = useRef();
  const loaderRef = useRef();
  const ITEMS_PER_PAGE = 20;

  // Initial load
  useEffect(() => {
    setTimeout(() => {
      const filtered = filterProducts(allProducts, {
        category: selectedCategory,
        search: searchQuery,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating,
        sortBy
      });
      setFilteredProducts(filtered);
      setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
      setLoading(false);
    }, 500);
  }, [allProducts, selectedCategory, searchQuery, priceRange, minRating, sortBy]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newProducts = filteredProducts.slice(startIndex, endIndex);

      if (newProducts.length > 0) {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(endIndex < filteredProducts.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 500);
  }, [page, filteredProducts, hasMore, loadingMore]);

  // Intersection Observer
  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, options);

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSortBy('default');
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery || priceRange[0] > 0 || priceRange[1] < 10000 || minRating > 0 || sortBy !== 'default';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-beige-100'}`}>
      <TailwindNavbar
        onSearch={setSearchQuery}
        onCartOpen={() => setCartOpen(true)}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm md:text-base font-semibold">
            🎉 MEGA SALE! Up to 50% OFF on Electronics | Use code: LOOP50
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-brown-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-brown-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                showFilters
                  ? 'bg-brown-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-brown-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brown-500 cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-beige-200 rounded-lg appearance-none cursor-pointer accent-brown-500"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        minRating === rating
                          ? 'bg-brown-500 text-white'
                          : 'bg-beige-100 text-gray-700 hover:bg-brown-100'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}★+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Availability
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="inStock"
                    className="w-5 h-5 text-brown-500 rounded focus:ring-brown-500"
                  />
                  <label htmlFor="inStock" className="text-gray-700 cursor-pointer">
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-bold text-brown-600">{displayedProducts.length}</span> of{' '}
            <span className="font-bold text-brown-600">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-semibold text-gray-600 mb-4">No products found</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-brown-500 text-white rounded-xl font-semibold hover:bg-brown-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Indicator */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center items-center py-12">
                {loadingMore && (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 border-4 border-brown-200 border-t-brown-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading more products...</p>
                  </div>
                )}
              </div>
            )}

            {/* End Message */}
            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-12">
                <p className="text-xl font-semibold text-gray-600">
                  🎉 You've reached the end!
                </p>
                <p className="text-gray-500 mt-2">
                  Showing all {displayedProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <BackToTop />
    </div>
  );
}
