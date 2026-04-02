import { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToWishlist = useCallback((product) => {
    setItems((prev) => prev.find((i) => i._id === product._id) ? prev : [...prev, product]);
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const isWishlisted = useCallback((id) => items.some((i) => i._id === id), [items]);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) =>
      prev.find((i) => i._id === product._id)
        ? prev.filter((i) => i._id !== product._id)
        : [...prev, product]
    );
  }, []);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
