import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUid = currentUser?.uid || 'guest';

  const [wishlist, setWishlist] = useState([]);
  const prevUidRef = useRef(currentUid);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`floora_wishlist_${currentUid}`);
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else if (currentUid === 'ananya-floora-demo') {
        // Seed default wishlist for Ananya demo user only
        const defaultSeeds = ['fl-int-01', 'fl-ind-02'];
        setWishlist(defaultSeeds);
        localStorage.setItem(`floora_wishlist_${currentUid}`, JSON.stringify(defaultSeeds));
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    }
    prevUidRef.current = currentUid;
  }, [currentUid]);

  useEffect(() => {
    if (prevUidRef.current === currentUid) {
      try {
        localStorage.setItem(`floora_wishlist_${currentUid}`, JSON.stringify(wishlist));
      } catch (e) {
        console.warn("Could not save wishlist to localStorage", e);
      }
    }
  }, [wishlist, currentUid]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlist.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
