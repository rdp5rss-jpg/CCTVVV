import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingModal({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="glass p-8 rounded-3xl flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute inset-0 border-4 border-transparent border-t-accent border-r-primary rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-2 border-4 border-transparent border-b-secondary border-l-accent rounded-full opacity-50"
              />
            </div>
            <p className="text-sm font-medium tracking-widest uppercase gradient-text animate-pulse">
              Loading...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
