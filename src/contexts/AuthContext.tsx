import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { customerAuthService, CustomerUser } from '../services/customerAuthService';

interface User {
  email: string;
  id?: string;
  displayName?: string;
  company?: string;
  isAdmin?: boolean;
  customerUser?: CustomerUser; // Add full customer user data
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName: string, company: string) => Promise<{ success: boolean; needsApproval?: boolean }>;
  logout: () => Promise<void>;
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
      // Check localStorage for admin auth
      const storedAuth = localStorage.getItem('dm-brands-auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
        setIsAdmin(authData.user.isAdmin || false);
        setLoading(false);
        return;
      }

      // Check DM Brands Supabase for admin auth
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            id: session.user.id,
            isAdmin: true
          });
          setIsAdmin(true);
          setLoading(false);
          return;
        }
      }

      // Check Splitfin Supabase for customer auth
      const customerUser = await customerAuthService.getCurrentUser();
      if (customerUser) {
        const userData = {
          email: customerUser.email,
          id: customerUser.id,
          displayName: customerUser.name,
          company: customerUser.customer?.trading_name || customerUser.customer?.display_name,
          isAdmin: false,
          customerUser: customerUser
        };
        
        setUser(userData);
        setIsAdmin(false);
        setLoading(false);
        return;
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

  // Customer authentication methods
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Customer login attempt:', email);
      
      const result = await customerAuthService.signIn(email, password);
      
      if (result.success && result.user) {
        const userData = {
          email: result.user.email,
          id: result.user.id,
          displayName: result.user.name,
          company: result.user.customer?.trading_name || result.user.customer?.display_name,
          isAdmin: false,
          customerUser: result.user
        };
        
        setUser(userData);
        setIsAdmin(false);
        
        console.log('✅ Customer login successful');
        return true;
      } else {
        console.log('❌ Customer login failed:', result.error);
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string, company: string): Promise<{ success: boolean; needsApproval?: boolean }> => {
    try {
      console.log('📝 Customer signup attempt:', email);
      
      const result = await customerAuthService.signUp({
        name: displayName,
        email,
        company,
        contactType: 'admin' // Default contact type
      }, password);
      
      if (result.success) {
        console.log('✅ Customer signup successful');
        return { success: true, needsApproval: result.needsApproval };
      } else {
        console.log('❌ Customer signup failed:', result.error);
        throw new Error(result.error || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Customer logout');
      await customerAuthService.signOut();
      setUser(null);
      setIsAdmin(false);
      console.log('✅ Customer logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      login, 
      signup, 
      logout, 
      isAdmin 
    }}>
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