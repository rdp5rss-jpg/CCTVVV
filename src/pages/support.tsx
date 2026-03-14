import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingModal from '../components/LoadingModal';
import { supabase } from '../lib/supabase';

export default function Support() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format to match expected structure
        const formattedTickets = data?.map((ticket: any) => ({
          id: ticket.id,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          reply: ticket.reply,
          createdAt: ticket.created_at
        })) || [];
        
        setTickets(formattedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .insert([{
          user_id: user.id,
          subject,
          message,
          status: 'Open'
        }]);
        
      if (error) throw error;
      
      setSubject('');
      setMessage('');
      
      // Refetch tickets
      const { data: newTickets, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      const formattedTickets = newTickets?.map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        reply: ticket.reply,
        createdAt: ticket.created_at
      })) || [];
      
      setTickets(formattedTickets);
    } catch (error) {
      console.error('Failed to create ticket', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-bg-start to-bg-end flex flex-col">
      <LoadingModal isOpen={loading} />
      
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-bold text-white">Support Chat</h1>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col gap-4 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No support tickets yet. How can we help?</p>
          </div>
        ) : (
          tickets.map((ticket: any) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-3xl flex flex-col gap-2 relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ticket.status === 'Open' ? 'bg-accent/20 text-accent' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {ticket.status}
                </span>
              </div>
              <h3 className="font-bold text-white">{ticket.subject}</h3>
              <p className="text-sm text-gray-300 bg-black/20 p-3 rounded-2xl">{ticket.message}</p>
              {ticket.reply && (
                <div className="mt-2 bg-accent/10 border border-accent/20 p-3 rounded-2xl">
                  <p className="text-xs text-accent font-bold mb-1">Admin Reply:</p>
                  <p className="text-sm text-gray-300">{ticket.reply}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4 pb-safe z-40">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/30"
            >
              <Send size={20} className="ml-1" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
