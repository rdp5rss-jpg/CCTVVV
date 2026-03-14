import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id, products(*)')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          if (data) {
            const products = data.map((item: any) => item.products);
            setWishlist(products);
          }
        } catch (err) {
          console.error('Failed to fetch wishlist', err);
        }
      } else {
        setWishlist([]);
      }
    };
    
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product: Product) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id, product_id: product.id }]);
        
      if (error) throw error;
      
      setWishlist(prev => [...prev, product]);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
        
      if (error) throw error;
      
      setWishlist(prev => prev.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
