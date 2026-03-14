import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/orders');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-bg-start to-bg-end relative overflow-hidden px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass rounded-[3rem] p-12 flex flex-col items-center text-center relative z-10 shadow-[0_0_60px_rgba(34,211,238,0.2)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
        >
          <CheckCircle size={48} className="text-emerald-400" strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Order Confirmed!
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-lg"
        >
          Thank you for shopping with ST CCTV SOLUTIONS.
        </motion.p>
      </motion.div>
      
      {/* Confetti-like background elements */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: '100vh', 
            x: Math.random() * window.innerWidth,
            opacity: 1 
          }}
          animate={{ 
            y: '-10vh',
            x: Math.random() * window.innerWidth,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
          className="absolute w-4 h-4 rounded-full bg-accent/50"
          style={{
            backgroundColor: ['#22D3EE', '#3B82F6', '#8B5CF6', '#10B981'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}
    </div>
  );
}
