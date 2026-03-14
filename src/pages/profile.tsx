import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, Settings, Palette, HelpCircle, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      updateUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="text-accent text-sm font-medium">
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="glass p-6 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
          
          <div className="w-24 h-24 rounded-full glass-glow flex items-center justify-center mb-4 bg-gradient-to-tr from-primary to-secondary relative z-10 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <User size={48} className="text-white" strokeWidth={1.5} />
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-4 relative z-10">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-center focus:outline-none focus:border-accent"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-center focus:outline-none focus:border-accent"
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-center focus:outline-none focus:border-accent resize-none"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="w-full gradient-bg text-white font-bold py-3 rounded-2xl shadow-lg"
              >
                Save Changes
              </motion.button>
            </div>
          ) : (
            <div className="text-center relative z-10">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mb-2">
                <Mail size={14} /> {user.email}
              </p>
              {user.phone && (
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mb-2">
                  <Phone size={14} /> {user.phone}
                </p>
              )}
              {user.address && (
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                  <MapPin size={14} /> {user.address}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          <div className="p-2 flex flex-col gap-1">
            <button onClick={() => navigate('/theme')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Palette size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Theme Settings</h3>
                <p className="text-xs text-gray-400">Change app appearance</p>
              </div>
            </button>
            
            <button onClick={() => navigate('/support')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HelpCircle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Support Tickets</h3>
                <p className="text-xs text-gray-400">Get help with your orders</p>
              </div>
            </button>

            <button onClick={() => navigate('/games')} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Gamepad2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Mini Games</h3>
                <p className="text-xs text-gray-400">Play and win coupons</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center text-gray-400">
                <Settings size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Account Settings</h3>
                <p className="text-xs text-gray-400">Password and security</p>
              </div>
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full glass border border-red-500/30 text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
