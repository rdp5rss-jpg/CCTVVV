import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingCart, Clock, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const { cart } = useCart();
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/products', icon: Grid, label: 'Categories' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cart.length },
    { path: '/orders', icon: Clock, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/products' && location.pathname.startsWith('/product'));
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center p-2">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative ${isActive ? 'text-accent' : 'text-gray-400'}`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </motion.div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-accent font-medium' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-accent"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
