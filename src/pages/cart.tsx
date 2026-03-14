import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/BottomNav';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <ShoppingBag size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="glass p-4 rounded-2xl flex gap-4 relative"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-white line-clamp-2">{item.name}</h3>
                      <p className="text-lg font-bold gradient-text mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-lg font-medium text-white/80"
                        >-</button>
                        <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-lg font-medium text-white/80"
                        >+</button>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 bg-red-400/10 rounded-full"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-8 glass p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-400 text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-2xl font-black gradient-text">₹{total.toLocaleString('en-IN')}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30"
              >
                Proceed to Checkout
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
