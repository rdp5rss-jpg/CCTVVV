import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const themes = [
    { id: 'dark', name: 'Dark Mode (Default)', colors: ['#0B1220', '#2563EB'] },
    { id: 'light', name: 'Light Mode', colors: ['#F8FAFC', '#3B82F6'] },
    { id: 'blue', name: 'Ocean Blue', colors: ['#082F49', '#0284C7'] },
    { id: 'gold', name: 'Premium Gold', colors: ['#451A03', '#D97706'] },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Theme Settings</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(t.id as any)}
            className={`glass p-4 rounded-3xl flex items-center justify-between border-2 transition-colors ${theme === t.id ? 'border-accent bg-white/10' : 'border-transparent'}`}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full shadow-inner border border-white/20"
                style={{ background: `linear-gradient(to bottom right, ${t.colors[0]}, ${t.colors[1]})` }}
              />
              <span className="font-medium text-white text-lg">{t.name}</span>
            </div>
            {theme === t.id && (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-start">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
