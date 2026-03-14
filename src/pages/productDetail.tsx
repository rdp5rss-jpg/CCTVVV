import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Heart, Share2, CheckCircle2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingModal from '../components/LoadingModal';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (product) {
      addToCart({ ...product, quantity });
      toast.success('Added to cart');
      const audio = new Audio('/sounds/add-to-cart.mp3');
      audio.play().catch(() => {});
    }
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (!product && !loading) return <div className="text-center mt-20">Product not found</div>;

  // Mock multiple images for the slider
  const images = product ? [product.image, product.image, product.image] : [];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass px-4 py-3 flex justify-between items-center">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 glass rounded-full">
          <ArrowLeft size={24} />
        </motion.button>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleWishlist} className="p-2 glass rounded-full">
            <Heart size={20} className={product && isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="p-2 glass rounded-full">
            <Share2 size={20} />
          </motion.button>
        </div>
      </div>

      {product && (
        <div className="max-w-md mx-auto pt-16">
          {/* Image Slider */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-square relative"
          >
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="w-full h-full rounded-b-[3rem] shadow-2xl overflow-hidden"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

          {/* Details */}
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <p className="text-sm text-accent font-medium uppercase tracking-wider mb-2">{product.category}</p>
                <h1 className="text-2xl font-bold text-white leading-tight">{product.name}</h1>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-sm">{product.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-black gradient-text">₹{product.price.toLocaleString('en-IN')}</span>
              {product.stock > 0 ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium ml-4 bg-emerald-400/10 px-2 py-1 rounded-md">
                  <CheckCircle2 size={14} /> In Stock
                </span>
              ) : (
                <span className="text-red-400 text-xs font-medium ml-4 bg-red-400/10 px-2 py-1 rounded-md">Out of Stock</span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 text-white/90">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between glass p-4 rounded-2xl mb-8">
              <span className="font-medium text-white/80">Quantity</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium"
                >-</button>
                <span className="font-bold w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium"
                >+</button>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4 pb-safe z-40">
            <div className="max-w-md mx-auto flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Total Price</p>
                <p className="text-xl font-bold text-white">₹{(product.price * quantity).toLocaleString('en-IN')}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-[2] gradient-bg text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
