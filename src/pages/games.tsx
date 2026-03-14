import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gamepad2, Play } from 'lucide-react';
import LoadingModal from '../components/LoadingModal';
import { supabase } from '../lib/supabase';

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase.from('games').select('*');
        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error('Failed to fetch games', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (activeGame) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="glass px-4 py-3 flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveGame(null)} className="p-2 text-white">
            <ArrowLeft size={24} />
          </motion.button>
          <h1 className="text-lg font-bold text-white">Playing Game</h1>
          <div className="w-10" />
        </div>
        <iframe src={activeGame} className="flex-1 w-full border-none" title="Game" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end">
      <LoadingModal isOpen={loading} />
      
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Mini Games</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="glass p-6 rounded-3xl mb-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/30 flex items-center justify-center">
              <Gamepad2 size={24} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Play & Win</h2>
              <p className="text-sm text-purple-200">Earn exclusive discount coupons!</p>
            </div>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No games available right now.</p>
          </div>
        ) : (
          games.map((game: any) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass rounded-3xl overflow-hidden relative group cursor-pointer"
              onClick={() => setActiveGame(game.url)}
            >
              <div className="aspect-[16/9] relative">
                <img src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'} alt={game.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-16 h-16 rounded-full glass-glow bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play size={32} className="text-white ml-2" fill="white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{game.title}</h3>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
