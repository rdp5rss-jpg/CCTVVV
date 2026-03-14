import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function CategoryScroll() {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 text-white">Categories</h2>
      <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/products?category=${category.name}`)}
            className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-accent shadow-lg overflow-hidden">
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-300">{category.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
