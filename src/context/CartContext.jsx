import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('loopkart-cart') || '[]');
    } catch {
      return [];
    }
  });

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) return prev.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { _id: product._id, name: product.name, emoji: product.emoji, image: product.image || '', price: product.price, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  useEffect(() => {
    localStorage.setItem('loopkart-cart', JSON.stringify(items));
  }, [items]);

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
