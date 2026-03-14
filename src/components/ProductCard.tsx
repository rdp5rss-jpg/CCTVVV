import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, MoreVertical, Heart, Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

export default function ProductCard({ product }: { product: Product; key?: React.Key }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart({ ...product, quantity: 1 });
    toast.success('Added to cart');
    // Play sound effect
    const audio = new Audio('/sounds/add-to-cart.mp3');
    audio.play().catch(() => {});
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setShowMenu(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: `${window.location.origin}/product/${product.id}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      toast.success('Link copied to clipboard');
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl overflow-hidden relative group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 glass px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 glass rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-36 glass rounded-xl shadow-xl overflow-hidden z-20"
                >
                  <button
                    onClick={handleWishlist}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Heart size={14} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
                    {isInWishlist(product.id) ? 'Remove' : 'Wishlist'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-accent mb-1 font-medium uppercase tracking-wider">{product.category}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">₹{product.price.toLocaleString('en-IN')}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/30"
            >
              <ShoppingCart size={16} />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
