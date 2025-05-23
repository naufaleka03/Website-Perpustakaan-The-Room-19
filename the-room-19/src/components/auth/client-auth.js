'use client';
import { createClient } from '@/app/supabase/client';
import { useState, useEffect, createContext, useContext } from 'react';

// Context untuk menyimpan informasi user
const AuthContext = createContext(null);

// Provider untuk seluruh aplikasi
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Periksa status autentikasi saat ini
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (user) {
          setUser(user);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Jalankan pengecekan autentikasi
    checkAuth();
    
    // Set up listener untuk perubahan autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    // Cleanup ketika komponen di-unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fungsi untuk login client-side
  const login = async (email, password) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk logout
  const logout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Nilai yang akan di-provide ke consumer
  const value = {
    user,
    loading,
    error,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook untuk mengakses auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 