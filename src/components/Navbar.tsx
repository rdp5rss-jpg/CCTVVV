import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-3 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-white"
            >
              <Menu size={24} />
            </motion.button>
            <h1 className="text-xl font-bold gradient-text tracking-tight">ST CCTV SOLUTIONS</h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} className="relative p-2 text-white">
            <Bell size={24} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-start" />
          </motion.button>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cameras, lenses..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-inner"
          />
        </form>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
