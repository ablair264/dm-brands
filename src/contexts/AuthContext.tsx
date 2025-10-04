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
  role: 'admin' | 'customer' | null;
  loginAny: (email: string, password: string) => Promise<{ success: boolean; role?: 'admin' | 'customer'; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin credentials for fallback (change these in production!)
const DEFAULT_ADMIN_EMAIL = 'admin@dmbrands.co.uk';
const DEFAULT_ADMIN_PASSWORD = 'DMBrands2025!';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);

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
        setRole(authData.user.isAdmin ? 'admin' : 'customer');
        setLoading(false);
        return;
      }

      // Check Splitfin Supabase session (single auth source)
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Determine app role from Splitfin users table
          try {
            const { data, error } = await supabase
              .from('users')
              .select('role')
              .eq('auth_user_id', session.user.id)
              .maybeSingle();
            const roleName = (!error && data?.role) ? String(data.role) : null;
            const adminLike = roleName === 'Admin' || roleName === 'Manager';
            setUser({ email: session.user.email || '', id: session.user.id, isAdmin: adminLike });
            setIsAdmin(adminLike);
            setRole(adminLike ? 'admin' : 'customer');
          } catch {
            setUser({ email: session.user.email || '', id: session.user.id, isAdmin: false });
            setIsAdmin(false);
            setRole('customer');
          }
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
        setRole('customer');
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
            // Look up role in Splitfin users table
            try {
              const { data: roleRow } = await supabase
                .from('users')
                .select('role')
                .eq('auth_user_id', data.user.id)
                .maybeSingle();
              const roleName = roleRow?.role ? String(roleRow.role) : null;
              const adminLike = roleName === 'Admin' || roleName === 'Manager';
              const userData = { email: data.user.email || '', id: data.user.id, isAdmin: adminLike };
              setUser(userData);
              setIsAdmin(adminLike);
              setRole(adminLike ? 'admin' : 'customer');
              localStorage.setItem('dm-brands-auth', JSON.stringify({ user: userData, timestamp: Date.now() }));
              return { error: null };
            } catch {
              const userData = { email: data.user.email || '', id: data.user.id, isAdmin: false };
              setUser(userData);
              setIsAdmin(false);
              setRole('customer');
              localStorage.setItem('dm-brands-auth', JSON.stringify({ user: userData, timestamp: Date.now() }));
              return { error: null };
            }
          }

          if (error && error.message !== 'Invalid login credentials') {
            // If it's not a credentials error, there might be a Supabase issue
            console.warn('Supabase auth error:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase not configured for auth, using fallback');
        }
      }

      // No fallback credentials — Splitfin Auth only

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
        setRole('customer');
        
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
      setRole(null);
      console.log('✅ Customer logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Unified login that tries admin first, then customer
  const loginAny = async (email: string, password: string): Promise<{ success: boolean; role?: 'admin' | 'customer'; error?: string }> => {
    // Try admin (DM Brands Supabase)
    const adminAttempt = await signIn(email, password);
    if (!adminAttempt.error) {
      return { success: true, role: 'admin' };
    }
    // If not admin credentials, try customer (Splitfin Supabase)
    try {
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
        setRole('customer');
        return { success: true, role: 'customer' };
      }
      return { success: false, error: result.error || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
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
      isAdmin,
      role,
      loginAny,
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
