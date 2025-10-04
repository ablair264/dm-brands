import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are not provided
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please restart the app after adding credentials to .env file.');
    return null;
  }
  
  // Check if placeholder value is still there
  if (supabaseAnonKey === 'your_anon_key_here') {
    console.warn('Please replace "your_anon_key_here" with your actual Supabase anon key in the .env file.');
    return null;
  }
  
  console.log('Supabase connected successfully to:', supabaseUrl);
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database types
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  color?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  name: string;
  cover_image?: string;
  date: string;
  start_time: string;
  end_time: string;
  stand_number: string;
  location: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventBrand {
  id?: string;
  event_id: string;
  brand_id: string;
}

export interface Catalogue {
  id: string;
  brand_id: string;
  year: string;
  season?: string;
  pdf_url?: string;
  file_path?: string;
  color?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}