import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Mode démo actif quand Supabase n'est pas configuré
const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;
const DEMO_EMAIL = 'admin@demo.fr';
const DEMO_PASSWORD = 'admin123';

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      const session = localStorage.getItem('demo_admin_session');
      setIsAdmin(!!session);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (DEMO_MODE) {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem('demo_admin_session', '1');
        setIsAdmin(true);
        return { error: null };
      }
      return { error: 'Email ou mot de passe incorrect.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Email ou mot de passe incorrect.' };
    return { error: null };
  };

  const logout = async () => {
    if (DEMO_MODE) {
      localStorage.removeItem('demo_admin_session');
      setIsAdmin(false);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
