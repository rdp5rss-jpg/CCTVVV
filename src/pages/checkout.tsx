import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, MapPin, User, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingModal from '../components/LoadingModal';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    paymentMethod: 'COD'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill all details');
      return;
    }

    if (!user) {
      alert('Please login to place an order');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: total,
          status: 'Placed',
          payment_method: formData.paymentMethod,
          shipping_address: formData.address,
          contact_phone: formData.phone,
          contact_name: formData.name
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name,
        product_image: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      const audio = new Audio('/sounds/order-success.mp3');
      audio.play().catch(() => {});
      navigate('/order-confirmed');
    } catch (error) {
      console.error('Failed to place order', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Checkout</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="glass p-6 rounded-3xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-accent" /> Shipping Details
          </h2>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <textarea
              name="address"
              placeholder="Full Delivery Address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
        </div>

        <div className="glass p-6 rounded-3xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-accent" /> Payment Method
          </h2>
          <div className="flex flex-col gap-3">
            <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${formData.paymentMethod === 'COD' ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={formData.paymentMethod === 'COD'}
                onChange={handleChange}
                className="hidden"
              />
              <Banknote size={24} className={formData.paymentMethod === 'COD' ? 'text-accent' : 'text-gray-400'} />
              <span className="font-medium text-white">Cash on Delivery</span>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${formData.paymentMethod === 'Card' ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="Card"
                disabled
                className="hidden"
              />
              <CreditCard size={24} className="text-gray-400" />
              <span className="font-medium text-gray-400">Credit/Debit Card (Coming Soon)</span>
            </label>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-2xl font-black gradient-text">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmOrder}
            className="w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30"
          >
            Confirm Order
          </motion.button>
        </div>
      </div>
    </div>
  );
}
