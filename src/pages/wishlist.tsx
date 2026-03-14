import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    toast.success('Added to cart');
    const audio = new Audio('/sounds/add-to-cart.mp3');
    audio.play().catch(() => {});
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">My Wishlist</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <Heart size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Your wishlist is empty</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass rounded-2xl overflow-hidden relative group flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-white/5 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 glass rounded-full text-red-400 hover:bg-white/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-bold gradient-text">₹{item.price.toLocaleString('en-IN')}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/30"
                      >
                        <ShoppingCart size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
