import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export default function NoInternet() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-center"
        >
          <div className="glass bg-red-500/20 border-red-500/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg shadow-red-500/20">
            <WifiOff size={20} className="text-red-400" />
            <span className="text-white font-medium text-sm">No Internet Connection</span>
            <button 
              onClick={() => window.location.reload()}
              className="ml-2 text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
