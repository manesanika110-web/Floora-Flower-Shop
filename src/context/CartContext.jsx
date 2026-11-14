import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUid = currentUser?.uid || 'guest';
  
  const [cart, setCart] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const prevUidRef = useRef(currentUid);

  // Load user-scoped cart when active user changes (and preserve/merge guest items on login)
  useEffect(() => {
    try {
      const guestSaved = localStorage.getItem('floora_cart_guest');
      let guestItems = [];
      if (guestSaved) {
        try { guestItems = JSON.parse(guestSaved); } catch {}
      }

      const userSaved = localStorage.getItem(`floora_cart_${currentUid}`);
      let userItems = [];
      if (userSaved) {
        try { userItems = JSON.parse(userSaved); } catch {}
      }

      // If user transitioned from guest to authenticated user and had items in guest cart:
      if (currentUid !== 'guest' && prevUidRef.current === 'guest' && Array.isArray(guestItems) && guestItems.length > 0) {
        const merged = [...userItems];
        for (const gItem of guestItems) {
          const existing = merged.find(i => i.id === gItem.id);
          if (existing) {
            existing.quantity = Math.max(existing.quantity, gItem.quantity);
          } else {
            merged.push(gItem);
          }
        }
        setCart(merged);
        localStorage.setItem(`floora_cart_${currentUid}`, JSON.stringify(merged));
        localStorage.removeItem('floora_cart_guest');
      } else {
        setCart(userItems);
      }
    } catch {
      setCart([]);
    }
    prevUidRef.current = currentUid;
  }, [currentUid]);

  // Save user-scoped cart on updates
  useEffect(() => {
    if (prevUidRef.current === currentUid) {
      try {
        localStorage.setItem(`floora_cart_${currentUid}`, JSON.stringify(cart));
      } catch (e) {
        console.warn("Could not save cart to localStorage", e);
      }
    }
  }, [cart, currentUid]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (options.cardMessage) updated[existingIndex].cardMessage = options.cardMessage;
        if (options.deliveryDate) updated[existingIndex].deliveryDate = options.deliveryDate;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            product,
            quantity,
            deliveryDate: options.deliveryDate || 'Today (Express 2-Hour)',
            cardMessage: options.cardMessage || ''
          }
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
    try {
      localStorage.removeItem(`floora_cart_${currentUid}`);
    } catch {}
  };

  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'FLORA10') {
      setActiveCoupon({ code: 'FLORA10', discountType: 'percentage', value: 0.10 });
      setCouponError('');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'FREESHIP') {
      setActiveCoupon({ code: 'FREESHIP', discountType: 'shipping', value: 0 });
      setCouponError('');
      return { success: true, message: 'Free express shipping applied!' };
    } else {
      setCouponError('Invalid coupon code. Try FLORA10 for 10% off.');
      return { success: false, message: 'Invalid coupon code.' };
    }
  };

  const generateAndApplyCoupon = () => {
    const generatedCode = `FLORA${Math.floor(10 + Math.random() * 90)}`;
    setActiveCoupon({ code: generatedCode, discountType: 'percentage', value: 0.10 });
    setCouponError('');
    return { success: true, code: generatedCode, message: `10% discount (${generatedCode}) applied!` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponError('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  let discount = 0;
  if (activeCoupon?.discountType === 'percentage') {
    discount = Math.round(subtotal * (activeCoupon.value || 0.10));
  }

  // Delivery fee: ₹99 flat, free above ₹999 or with coupon
  let deliveryFee = subtotal >= 999 || subtotal === 0 || activeCoupon?.code === 'FREESHIP' ? 0 : 99;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      generateAndApplyCoupon,
      removeCoupon,
      activeCoupon,
      couponError,
      subtotal,
      discount,
      deliveryFee,
      total,
      totalItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
