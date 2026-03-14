import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BannerSlider from '../components/BannerSlider';
import CategoryScroll from '../components/CategoryScroll';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import LoadingModal from '../components/LoadingModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);
          
        if (error) throw error;
        if (mounted) setProducts(data || []);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen pb-24 relative bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      <Navbar />
      
      <div className="max-w-md mx-auto">
        <BannerSlider />
        <CategoryScroll />
        
        <div className="px-4 py-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white">Recent Products</h2>
            <button onClick={() => navigate('/products')} className="text-sm text-accent font-medium">See All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white">Recommended</h2>
            <button onClick={() => navigate('/products')} className="text-sm text-accent font-medium">See All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {products.slice(4, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
