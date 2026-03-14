import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import LoadingModal from '../components/LoadingModal';
import { supabase } from '../lib/supabase';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format the data to match the expected structure
        const formattedOrders = data?.map((order: any) => ({
          id: order.id,
          totalAmount: order.total_amount,
          status: order.status,
          paymentMethod: order.payment_method,
          createdAt: order.created_at,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            image: item.product_image
          }))
        })) || [];
        
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const activeOrders = orders.filter((o: any) => o.status !== 'Delivered');
  const historyOrders = orders.filter((o: any) => o.status === 'Delivered');

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Placed': return <Package size={16} className="text-blue-400" />;
      case 'Dispatched': return <Truck size={16} className="text-yellow-400" />;
      case 'Delivered': return <CheckCircle2 size={16} className="text-emerald-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">My Orders</h1>
          
          <div className="flex bg-white/5 rounded-2xl p-1 relative">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors relative z-10 ${activeTab === 'active' ? 'text-white' : 'text-gray-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors relative z-10 ${activeTab === 'history' ? 'text-white' : 'text-gray-400'}`}
            >
              History
            </button>
            <motion.div
              layoutId="orderTab"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-xl shadow-sm"
              initial={false}
              animate={{ left: activeTab === 'active' ? '4px' : 'calc(50% + 2px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        {displayOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {activeTab} orders found.</p>
          </div>
        ) : (
          displayOrders.map((order: any) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl overflow-hidden"
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Package size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Order #{order.id}</p>
                    <p className="font-bold text-white">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    {getStatusIcon(order.status)}
                    <span className="text-xs font-medium text-white/80">{order.status}</span>
                  </div>
                  {expandedOrder === order.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 bg-black/20 p-4 flex flex-col gap-4">
                      {/* Progress Bar */}
                      <div className="relative pt-4 pb-2 px-2">
                        <div className="absolute top-6 left-6 right-6 h-1 bg-white/10 rounded-full">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: order.status === 'Placed' ? '0%' : order.status === 'Dispatched' ? '50%' : '100%' }}
                            className="h-full bg-accent rounded-full"
                          />
                        </div>
                        <div className="flex justify-between relative z-10">
                          {['Placed', 'Dispatched', 'Delivered'].map((step, idx) => {
                            const isCompleted = 
                              order.status === 'Delivered' || 
                              (order.status === 'Dispatched' && idx <= 1) || 
                              (order.status === 'Placed' && idx === 0);
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCompleted ? 'bg-accent shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-gray-700'}`}>
                                  {isCompleted && <CheckCircle2 size={12} className="text-bg-start" />}
                                </div>
                                <span className={`text-[10px] font-medium ${isCompleted ? 'text-accent' : 'text-gray-500'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mt-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        <p>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1">Payment: {order.paymentMethod}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
