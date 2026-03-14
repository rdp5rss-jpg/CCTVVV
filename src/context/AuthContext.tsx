import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) setLoading(false);
        return;
      }
      
      // Fallback to ensure loading doesn't hang forever
      const fallbackTimer = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Auth initialization timed out, continuing anyway');
          setLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && mounted) {
          setToken(session.access_token);
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profile && mounted) {
            const isAdminEmail = session.user.email?.toLowerCase() === 'stcctvsolutions1990@gmail.com';
            let currentRole = profile.role || 'user';
            
            if (isAdminEmail && currentRole !== 'admin') {
              // Update the database so RLS policies work
              await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id);
              currentRole = 'admin';
            }

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile.name || '',
              phone: profile.phone || '',
              address: profile.address || '',
              role: currentRole
            });
          } else if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: '',
              role: session.user.email?.toLowerCase() === 'stcctvsolutions1990@gmail.com' ? 'admin' : 'user'
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        clearTimeout(fallbackTimer);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    let subscription: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session?.user && mounted) {
            setToken(session.access_token);
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
              
            if (profile && mounted) {
              const isAdminEmail = session.user.email?.toLowerCase() === 'stcctvsolutions1990@gmail.com';
              let currentRole = profile.role || 'user';
              
              if (isAdminEmail && currentRole !== 'admin') {
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id);
                currentRole = 'admin';
              }

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                role: currentRole
              });
            } else if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: '',
                role: session.user.email?.toLowerCase() === 'stcctvsolutions1990@gmail.com' ? 'admin' : 'user'
              });
            }
          } else if (mounted) {
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          if (mounted) setLoading(false);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error from server, forcing local signout:', error);
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (error) {
      console.error('Logout exception:', error);
      await supabase.auth.signOut({ scope: 'local' });
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
