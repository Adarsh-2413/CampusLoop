import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { cartService } from '../services/api';
import { isUserOwnProduct } from '../utils/formatters';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('campusloop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with backend cart if available
  useEffect(() => {
    let isMounted = true;
    const fetchBackendCart = async () => {
      if (!currentUser) return;
      try {
        const res = await cartService.getCart();
        if (isMounted && res?.data?.items && res.data.items.length > 0) {
          setCartItems(res.data.items);
        }
      } catch (err) {
        // Fallback to local storage
      }
    };

    fetchBackendCart();
    return () => { isMounted = false; };
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('campusloop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantityToAdd = 1) => {
    // Prevent self-purchase
    if (isUserOwnProduct(currentUser, product)) {
      showToast('You cannot purchase your own listed item.', 'error');
      return false;
    }

    // Check availability
    if (product.status && product.status !== 'ACTIVE') {
      showToast('This item is currently unavailable or sold out.', 'warning');
      return false;
    }

    if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
      showToast('This item is sold out.', 'warning');
      return false;
    }

    let updated = false;

    setCartItems((prev) => {
      const prodId = product.id || product._id;
      const existingIndex = prev.findIndex((item) => (item.product.id || item.product._id) === prodId);

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];

        // Enforce quantity 1 for unique single-unit used goods
        if (product.isUniqueItem) {
          showToast('This is a unique single-unit used item (Max: 1).', 'warning');
          return prev;
        }

        const newQty = existingItem.quantity + quantityToAdd;
        if (product.stockQuantity && newQty > product.stockQuantity) {
          showToast(`Only ${product.stockQuantity} unit(s) available in stock.`, 'warning');
          return prev;
        }

        const next = [...prev];
        next[existingIndex] = {
          ...existingItem,
          quantity: newQty
        };
        updated = true;
        return next;
      } else {
        // New item
        if (product.isUniqueItem && quantityToAdd > 1) {
          quantityToAdd = 1;
        }
        updated = true;
        return [...prev, { product, quantity: quantityToAdd, addedAt: new Date().toISOString() }];
      }
    });

    if (updated) {
      const targetId = product._id || product.id;
      if (currentUser && targetId && targetId.length === 24) {
        cartService.addItem(targetId, quantityToAdd).catch(() => {});
      }
      showToast(`Added "${product.title.slice(0, 24)}..." to cart`, 'success');
    }
    return updated;
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) => {
      return prev.map((item) => {
        const pId = item.product.id || item.product._id;
        if (pId === productId) {
          if (item.product.isUniqueItem && newQuantity > 1) {
            showToast('Unique used items cannot exceed quantity 1.', 'warning');
            return item;
          }
          if (item.product.stockQuantity && newQuantity > item.product.stockQuantity) {
            showToast(`Cannot exceed stock limit (${item.product.stockQuantity}).`, 'warning');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });

    if (currentUser && productId && productId.length === 24) {
      cartService.updateQuantity(productId, newQuantity).catch(() => {});
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const target = prev.find((i) => (i.product.id || i.product._id) === productId);
      if (target) {
        showToast(`Removed from cart`, 'info');
      }
      return prev.filter((item) => (item.product.id || item.product._id) !== productId);
    });

    if (currentUser && productId && productId.length === 24) {
      cartService.removeItem(productId).catch(() => {});
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUser) {
      cartService.clear().catch(() => {});
    }
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const handoverFee = 0;
  const platformFee = 0;
  const finalTotal = subtotal + handoverFee + platformFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        handoverFee,
        platformFee,
        finalTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
