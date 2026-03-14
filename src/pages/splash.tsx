import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Splash() {
  const navigate = useNavigate();
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      if (hasSeenSplash) {
        navigate('/home', { replace: true });
        return;
      }

      if (!isSupabaseConfigured) {
        // If no supabase, simulate a quick loading sequence
        if (isMounted) setLoadingText('Initializing offline mode...');
        if (isMounted) setProgress(50);
        
        setTimeout(() => {
          if (isMounted) {
            setProgress(100);
            setLoadingText('Ready!');
            
            setTimeout(() => {
              if (isMounted) {
                sessionStorage.setItem('hasSeenSplash', 'true');
                navigate('/home', { replace: true });
              }
            }, 500);
          }
        }, 1000);
        return;
      }

      try {
        if (isMounted) setLoadingText('Loading resources...');
        if (isMounted) setProgress(20);
        
        // Fetch banners and categories to preload their images, with a 3-second timeout
        const fetchPromise = Promise.all([
          supabase.from('banners').select('image').limit(5),
          supabase.from('categories').select('image').limit(10)
        ]);
        
        const timeoutFetchPromise = new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 3000)
        );

        const [bannersRes, categoriesRes] = await Promise.race([
          fetchPromise,
          timeoutFetchPromise
        ]);

        if (isMounted) setProgress(50);
        if (isMounted) setLoadingText('Preloading images...');

        const imageUrls: string[] = [];
        
        if (bannersRes.data) {
          bannersRes.data.forEach(b => b.image && imageUrls.push(b.image));
        }
        if (categoriesRes.data) {
          categoriesRes.data.forEach(c => c.image && imageUrls.push(c.image));
        }

        // Preload images
        const preloadPromises = imageUrls.map(url => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // Resolve anyway to not block
          });
        });

        // Wait for images to load, but timeout after 3 seconds so we don't hang forever
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        
        await Promise.race([
          Promise.all(preloadPromises),
          timeoutPromise
        ]);

        if (isMounted) setProgress(100);
        if (isMounted) setLoadingText('Ready!');

      } catch (error) {
        console.error('Error preloading data:', error);
        if (isMounted) setProgress(100);
        if (isMounted) setLoadingText('Continuing offline...');
      } finally {
        // Always navigate to home after a short delay to show 100%
        setTimeout(() => {
          if (isMounted) {
            sessionStorage.setItem('hasSeenSplash', 'true');
            navigate('/home', { replace: true });
          }
        }, 500);
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-bg-start to-bg-end relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-xs"
      >
        <div className="w-32 h-32 rounded-full glass-glow flex items-center justify-center mb-8 bg-gradient-to-tr from-primary to-secondary shadow-[0_0_40px_rgba(34,211,238,0.4)]">
          <Camera size={64} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tighter mb-2 text-center">ST CCTV SOLUTIONS</h1>
        <p className="text-accent tracking-widest uppercase text-sm font-medium mb-12">Capture the Future</p>
        
        {/* Loading Progress */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span>{loadingText}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50"
      />
    </div>
  );
}
