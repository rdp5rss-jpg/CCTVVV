import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Users, ShoppingCart, MessageSquare, Gamepad2, ArrowLeft, Plus, Edit, Trash2, TrendingUp, DollarSign, Activity, Image as ImageIcon, CheckCircle, XCircle, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { seedDemoData } from '../lib/seed';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ totalSales: 0, activeOrders: 0, totalProducts: 0, openTickets: 0, chartData: [] });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', category: '', image: '', stock: ''
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', image: '' });

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [gameFormData, setGameFormData] = useState({
    title: '', url: '', thumbnail: ''
  });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({ image: '', link: '' });

  const [replyingToTicket, setReplyingToTicket] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/home');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    fetchStats();
    fetchProducts();
    fetchCategories();
    fetchOrders();
    fetchTickets();
    fetchGames();
    fetchBanners();
  };

  const fetchStats = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('total_amount, status, created_at');
      const { count: productsCount, error: productsError } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: ticketsCount, error: ticketsError } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Open');

      if (ordersError) throw ordersError;
      if (productsError) throw productsError;
      if (ticketsError) throw ticketsError;

      const totalSales = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const activeOrders = ordersData?.filter(order => order.status !== 'Delivered').length || 0;

      // Mock chart data for now
      const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
      ];

      setStats({
        totalSales,
        activeOrders,
        totalProducts: productsCount || 0,
        openTickets: ticketsCount || 0,
        chartData
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(name, email),
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedOrders = data?.map((order: any) => ({
        id: order.id,
        totalAmount: order.total_amount,
        status: order.status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        userName: order.profiles?.name || 'Unknown',
        userEmail: order.profiles?.email || 'Unknown',
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
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles:user_id(name, email)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedTickets = data?.map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        reply: ticket.reply,
        createdAt: ticket.created_at,
        userName: ticket.profiles?.name || 'Unknown',
        userEmail: ticket.profiles?.email || 'Unknown'
      })) || [];
      
      setTickets(formattedTickets);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Failed to fetch banners', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setForm: Function, formState: any, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...formState, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success('Product added');
      }
      setIsProductModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to save product', error);
      toast.error(`Failed to save product: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete product', error);
      toast.error(`Failed to delete product: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      const payload = {
        name: categoryFormData.name,
        image: categoryFormData.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80'
      };
      const { error } = await supabase.from('categories').insert([payload]);
      if (error) throw error;
      toast.success('Category added');
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to add category', error);
      toast.error(`Failed to add category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category', error);
      toast.error(`Failed to delete category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Order status updated');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateTicketStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Ticket status updated');
      fetchTickets();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleReplyToTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingToTicket) return;
    try {
      const { error } = await supabase.from('tickets').update({ reply: ticketReply, status: 'Closed' }).eq('id', replyingToTicket.id);
      if (error) throw error;
      toast.success('Reply sent');
      setReplyingToTicket(null);
      setTicketReply('');
      fetchTickets();
      fetchStats();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameFormData.title || !gameFormData.url) {
      toast.error('Please fill in both Title and Game URL');
      return;
    }
    try {
      if (editingGame) {
        const { error } = await supabase.from('games').update(gameFormData).eq('id', editingGame.id);
        if (error) throw error;
        toast.success('Game updated');
      } else {
        const { error } = await supabase.from('games').insert([gameFormData]);
        if (error) throw error;
        toast.success('Game added');
      }
      setIsGameModalOpen(false);
      fetchGames();
    } catch (error: any) {
      console.error('Failed to save game', error);
      toast.error(`Failed to save game: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteGame = async (id: number) => {
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
      toast.success('Game deleted');
      fetchGames();
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.image) {
      toast.error('Please provide a banner image');
      return;
    }
    try {
      const { error } = await supabase.from('banners').insert([bannerFormData]);
      if (error) throw error;
      toast.success('Banner added');
      setIsBannerModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      console.error('Failed to save banner', error);
      toast.error(`Failed to save banner: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const handleSeedData = async () => {
    try {
      toast.loading('Seeding demo data...', { id: 'seed' });
      await seedDemoData(true);
      toast.success('Demo data seeded successfully!', { id: 'seed' });
      fetchData();
    } catch (error) {
      console.error('Failed to seed data', error);
      toast.error('Failed to seed demo data', { id: 'seed' });
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', description: '', category: categories[0]?.name || '', image: '', stock: '10' });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      image: product.image,
      stock: product.stock.toString()
    });
    setIsProductModalOpen(true);
  };

  const openAddGameModal = () => {
    setEditingGame(null);
    setGameFormData({ title: '', url: '', thumbnail: '' });
    setIsGameModalOpen(true);
  };

  const openEditGameModal = (game: any) => {
    setEditingGame(game);
    setGameFormData({
      title: game.title,
      url: game.url,
      thumbnail: game.thumbnail
    });
    setIsGameModalOpen(true);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'games', label: 'Games', icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end text-white pb-24">
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'gradient-bg text-white font-bold' : 'glass text-gray-400'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="glass rounded-3xl p-6 min-h-[50vh]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <div className="flex gap-2">
                  <button onClick={handleSeedData} className="flex items-center gap-2 bg-accent/20 text-accent hover:bg-accent/30 px-4 py-2 rounded-xl text-sm border border-accent/30 transition-colors">
                    <Database size={16} /> Seed Demo Data
                  </button>
                  <div className="bg-white/5 px-4 py-2 rounded-xl text-sm text-gray-400 border border-white/10">
                    Last 7 Days
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <DollarSign size={48} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Total Sales</p>
                  <p className="text-3xl font-bold gradient-text">₹{stats.totalSales.toLocaleString()}</p>
                  <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" /> +12.5%
                  </div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <ShoppingCart size={48} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Active Orders</p>
                  <p className="text-3xl font-bold gradient-text">{stats.activeOrders}</p>
                  <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" /> +5.2%
                  </div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Package size={48} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Total Products</p>
                  <p className="text-3xl font-bold gradient-text">{stats.totalProducts}</p>
                  <div className="mt-4 flex items-center text-gray-400 text-sm font-medium">
                    <Activity size={16} className="mr-1" /> Stable
                  </div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <MessageSquare size={48} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Open Tickets</p>
                  <p className="text-3xl font-bold gradient-text">{stats.openTickets}</p>
                  <div className="mt-4 flex items-center text-red-400 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" /> +2
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mt-6">
                <h3 className="text-lg font-bold mb-6">Sales Overview</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#22D3EE' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Products</h2>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-medium">
                  <Plus size={18} /> Add Product
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="p-3 font-medium">Image</th>
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Stock</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        </td>
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3 text-gray-400">{product.category}</td>
                        <td className="p-3">₹{product.price.toLocaleString()}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(product)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Categories</h2>
                <button onClick={() => { setCategoryFormData({ name: '', image: '' }); setIsCategoryModalOpen(true); }} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-medium">
                  <Plus size={18} /> Add Category
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {category.image && <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-full p-6 text-center text-gray-400">No categories found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Customer: {order.userName} ({order.userEmail})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">₹{order.totalAmount.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                          order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 mb-4">
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                            <span className="flex-1">{item.name}</span>
                            <span className="text-gray-400">x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex gap-2">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-accent"
                      >
                        <option value="pending" className="bg-gray-900">Pending</option>
                        <option value="processing" className="bg-gray-900">Processing</option>
                        <option value="shipped" className="bg-gray-900">Shipped</option>
                        <option value="delivered" className="bg-gray-900">Delivered</option>
                        <option value="cancelled" className="bg-gray-900">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-6 text-center text-gray-400">No orders found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Support Tickets</h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{ticket.subject}</p>
                        <p className="text-sm text-gray-400">From: {ticket.userName} ({ticket.userEmail})</p>
                        <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2 bg-black/20 p-3 rounded-lg">{ticket.message}</p>
                    {ticket.reply && (
                      <div className="mt-2 bg-accent/10 border border-accent/20 p-3 rounded-lg">
                        <p className="text-xs text-accent font-bold mb-1">Admin Reply:</p>
                        <p className="text-sm text-gray-300">{ticket.reply}</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end gap-2">
                      {ticket.status === 'Open' ? (
                        <>
                          <button onClick={() => { setReplyingToTicket(ticket); setTicketReply(''); }} className="flex items-center gap-1 text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-500/30">
                            <MessageSquare size={14} /> Reply
                          </button>
                          <button onClick={() => handleUpdateTicketStatus(ticket.id, 'Closed')} className="flex items-center gap-1 text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-500/30">
                            <CheckCircle size={14} /> Mark as Closed
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleUpdateTicketStatus(ticket.id, 'Open')} className="flex items-center gap-1 text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg hover:bg-yellow-500/30">
                          <XCircle size={14} /> Reopen Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="p-6 text-center text-gray-400">No support tickets found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Games</h2>
                <button onClick={openAddGameModal} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-medium">
                  <Plus size={18} /> Add Game
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {games.map((game) => (
                  <div key={game.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
                    <div className="h-32 relative">
                      <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => openEditGameModal(game)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteGame(game.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate">{game.title}</h3>
                      <p className="text-xs text-gray-400 truncate mt-1">{game.url}</p>
                    </div>
                  </div>
                ))}
                {games.length === 0 && (
                  <div className="col-span-full p-6 text-center text-gray-400">No games found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Banners</h2>
                <button onClick={() => { setBannerFormData({ image: '', link: '' }); setIsBannerModalOpen(true); }} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-medium">
                  <Plus size={18} /> Add Banner
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
                    <div className="h-40 relative">
                      <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {banner.link && (
                      <div className="p-4">
                        <p className="text-xs text-gray-400 truncate">Link: {banner.link}</p>
                      </div>
                    )}
                  </div>
                ))}
                {banners.length === 0 && (
                  <div className="col-span-full p-6 text-center text-gray-400">No banners found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stock</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent">
                  <option value="" disabled className="bg-gray-900">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name} className="bg-gray-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormData, formData, 'image')} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Or paste image URL below:</p>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent mt-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent h-24 resize-none"></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-sm"
          >
            <h2 className="text-2xl font-bold mb-6">Add Category</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category Name</label>
                <input type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {categoryFormData.image && (
                    <img src={categoryFormData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setCategoryFormData, categoryFormData, 'image')} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Or paste image URL below:</p>
                <input type="text" value={categoryFormData.image} onChange={e => setCategoryFormData({...categoryFormData, image: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Game Modal */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold mb-6">{editingGame ? 'Edit Game' : 'Add Game'}</h2>
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input type="text" value={gameFormData.title} onChange={e => setGameFormData({...gameFormData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Game URL (HTML5)</label>
                <input type="text" value={gameFormData.url} onChange={e => setGameFormData({...gameFormData, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Thumbnail</label>
                <div className="flex items-center gap-4">
                  {gameFormData.thumbnail && (
                    <img src={gameFormData.thumbnail} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setGameFormData, gameFormData, 'thumbnail')} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Or paste image URL below:</p>
                <input type="text" value={gameFormData.thumbnail} onChange={e => setGameFormData({...gameFormData, thumbnail: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsGameModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                  {editingGame ? 'Save Changes' : 'Add Game'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Add Banner</h2>
            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {bannerFormData.image && (
                    <img src={bannerFormData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBannerFormData, bannerFormData, 'image')} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Or paste image URL below:</p>
                <input type="text" value={bannerFormData.image} onChange={e => setBannerFormData({...bannerFormData, image: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent mt-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link (Optional - Product or Category URL)</label>
                <input type="text" value={bannerFormData.link} onChange={e => setBannerFormData({...bannerFormData, link: e.target.value})} placeholder="/products?category=Lens" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                  Add Banner
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingToTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Reply to Ticket</h2>
            <div className="mb-4 bg-black/20 p-3 rounded-lg">
              <p className="font-bold text-sm">{replyingToTicket.subject}</p>
              <p className="text-xs text-gray-400 mt-1">{replyingToTicket.message}</p>
            </div>
            <form onSubmit={handleReplyToTicket} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Your Reply</label>
                <textarea required value={ticketReply} onChange={e => setTicketReply(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent h-32 resize-none"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setReplyingToTicket(null)} className="flex-1 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                  Send Reply
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

