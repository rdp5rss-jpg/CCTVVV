import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingModal from '../components/LoadingModal';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const from = location.state?.from?.pathname || '/home';

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name: formData.name,
            phone: formData.phone,
            role: formData.email.toLowerCase() === 'stcctvsolutions1990@gmail.com' ? 'admin' : 'user'
          });
          if (profileError) throw profileError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-br from-bg-start to-bg-end relative overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />
      <LoadingModal isOpen={loading} />
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-[2.5rem] p-8 shadow-2xl relative z-10 w-full max-w-md mx-auto"
      >
        <div className="flex justify-between mb-8 relative">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 text-center py-3 font-semibold text-lg transition-colors ${isLogin ? 'text-white' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 text-center py-3 font-semibold text-lg transition-colors ${!isLogin ? 'text-white' : 'text-gray-400'}`}
          >
            Register
          </button>
          <motion.div
            layoutId="tab-indicator"
            className="absolute bottom-0 h-1 bg-accent rounded-full"
            initial={false}
            animate={{ left: isLogin ? '0%' : '50%', width: '50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {!isLogin && (
              <>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </>
            )}
            
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`mt-6 w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
