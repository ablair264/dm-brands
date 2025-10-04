import { supabase } from '../lib/supabase';

export type AppRole = 'Admin' | 'Manager' | 'Sales' | 'User' | 'Customer' | string;

export const roleService = {
  async getUserRole(authUserId: string): Promise<AppRole | null> {
    if (!supabase) return null;
    // Assumes Splitfin has a `users` table with `auth_user_id` and `role`
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error) return null;
    return (data?.role as AppRole) || null;
  }
};

