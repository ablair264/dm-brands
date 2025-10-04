import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  email: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin credentials for fallback (change these in production!)
const DEFAULT_ADMIN_EMAIL = 'admin@dmbrands.co.uk';
const DEFAULT_ADMIN_PASSWORD = 'DMBrands2025!';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check localStorage first for simple auth
      const storedAuth = localStorage.getItem('dm-brands-auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Check Supabase session if available
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            id: session.user.id
          });
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Try Supabase authentication first
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (!error && data.user) {
            setUser({
              email: data.user.email || '',
              id: data.user.id
            });
            setIsAdmin(true);
            return { error: null };
          }

          if (error && error.message !== 'Invalid login credentials') {
            // If it's not a credentials error, there might be a Supabase issue
            console.warn('Supabase auth error:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase not configured for auth, using fallback');
        }
      }

      // Fallback to simple authentication
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
        const userData = { email };
        setUser(userData);
        setIsAdmin(true);
        
        // Store in localStorage
        localStorage.setItem('dm-brands-auth', JSON.stringify({
          user: userData,
          timestamp: Date.now()
        }));
        
        return { error: null };
      }

      return { error: 'Invalid email or password' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An error occurred during sign in' };
    }
  };

  const signOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('dm-brands-auth');
      
      // Sign out from Supabase if available
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};