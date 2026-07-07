import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getWishlist, addToWishlist as apiAdd, removeFromWishlist as apiRemove } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    getWishlist()
      .then((res) => {
        const ids = res.data.map((item) => item._id);
        setWishlistIds(new Set(ids));
      })
      .catch(() => setWishlistIds(new Set()));
  }, [user]);

  const isWishlisted = useCallback((id) => wishlistIds.has(id), [wishlistIds]);

  const toggleWishlist = useCallback(async (id) => {
    if (!user) return false;
    if (wishlistIds.has(id)) {
      await apiRemove(id);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return false;
    } else {
      await apiAdd(id);
      setWishlistIds((prev) => new Set(prev).add(id));
      return true;
    }
  }, [user, wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
