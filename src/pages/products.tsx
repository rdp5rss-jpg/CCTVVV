import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowDownUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import LoadingModal from '../components/LoadingModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      try {
        let query = supabase.from('products').select('*');
        
        if (category) {
          query = query.eq('category', category);
        }

        const { data: resData, error } = await query;
        if (error) throw error;
        
        let data = resData || [];

        if (search) {
          const lowerSearch = search.toLowerCase();
          data = data.filter((p: any) => 
            p.name.toLowerCase().includes(lowerSearch) || 
            (p.description && p.description.toLowerCase().includes(lowerSearch))
          );
        }
        
        if (sortBy === 'price-low') data.sort((a: any, b: any) => a.price - b.price);
        else if (sortBy === 'price-high') data.sort((a: any, b: any) => b.price - a.price);
        else if (sortBy === 'rating') data.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        else data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (mounted) setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, [sortBy, category, search]);

  return (
    <div className="min-h-screen pb-24 relative bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      <Navbar />
      
      <div className="max-w-md mx-auto">
        <div className="px-4 py-4 flex items-center justify-between sticky top-[72px] z-30 glass border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Filter size={18} className="text-accent" />
            <span className="font-medium">All Products</span>
          </div>
          
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/10 border border-white/20 rounded-xl py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="newest" className="bg-bg-start">Newest</option>
              <option value="price-low" className="bg-bg-start">Price: Low to High</option>
              <option value="price-high" className="bg-bg-start">Price: High to Low</option>
              <option value="rating" className="bg-bg-start">Highest Rating</option>
            </select>
            <ArrowDownUp size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
