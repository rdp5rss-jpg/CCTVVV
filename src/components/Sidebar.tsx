import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Grid, Heart, MessageCircle, Gamepad2, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/products', icon: Grid, label: 'Products' },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/support', icon: MessageCircle, label: 'Support' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 glass border-r border-white/10 z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold gradient-text tracking-tight">Mi Kings</h2>
              <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-6">
                {user ? (
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-gray-400">Welcome back,</p>
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                ) : (
                  <div className="glass p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-400 mb-3">Sign in to access all features</p>
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="block w-full py-2 gradient-bg text-white font-bold rounded-lg text-sm"
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
              </div>

              <nav className="px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Icon size={20} className="text-gray-400" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-accent hover:bg-white/10 rounded-xl transition-colors mt-4 border border-accent/30"
                  >
                    <ShieldCheck size={20} />
                    <span className="font-bold">Admin Panel</span>
                  </Link>
                )}
              </nav>
            </div>

            {user && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
