import { supabase } from '../lib/supabase';
import type { Brand, Event, Catalogue } from '../lib/supabase';

// Check if Supabase is configured
const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please add your anon key to the .env file.');
  }
  return supabase;
};

// Brand operations
export const brandService = {
  async getAll() {
    const client = checkSupabase();
    const { data, error } = await client
      .from('brands')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data as Brand[];
  },

  async getById(id: string) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Brand;
  },

  async create(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('brands')
      .insert([brand])
      .select()
      .single();
    
    if (error) throw error;
    return data as Brand;
  },

  async update(id: string, brand: Partial<Brand>) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('brands')
      .update(brand)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Brand;
  },

  async delete(id: string) {
    const client = checkSupabase();
    const { error } = await client
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Event operations
export const eventService = {
  async getAll() {
    const client = checkSupabase();
    const { data, error } = await client
      .from('events')
      .select(`
        *,
        event_brands (
          brand_id,
          brands (*)
        )
      `)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('events')
      .select(`
        *,
        event_brands (
          brand_id,
          brands (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>, brandIds: string[]) {
    const client = checkSupabase();
    // Start a transaction
    const { data: eventData, error: eventError } = await client
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (eventError) throw eventError;

    // Add brand associations
    if (brandIds.length > 0) {
      const eventBrands = brandIds.map(brandId => ({
        event_id: eventData.id,
        brand_id: brandId
      }));

      const { error: brandsError } = await client
        .from('event_brands')
        .insert(eventBrands);
      
      if (brandsError) throw brandsError;
    }

    return eventData;
  },

  async update(id: string, event: Partial<Event>, brandIds?: string[]) {
    const client = checkSupabase();
    const { data: eventData, error: eventError } = await client
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();
    
    if (eventError) throw eventError;

    // Update brand associations if provided
    if (brandIds) {
      // Remove existing associations
      await client
        .from('event_brands')
        .delete()
        .eq('event_id', id);

      // Add new associations
      if (brandIds.length > 0) {
        const eventBrands = brandIds.map(brandId => ({
          event_id: id,
          brand_id: brandId
        }));

        const { error: brandsError } = await client
          .from('event_brands')
          .insert(eventBrands);
        
        if (brandsError) throw brandsError;
      }
    }

    return eventData;
  },

  async delete(id: string) {
    const client = checkSupabase();
    const { error } = await client
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Catalogue operations
export const catalogueService = {
  async getAll() {
    const client = checkSupabase();
    const { data, error } = await client
      .from('catalogues')
      .select(`
        *,
        brands (*)
      `)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByBrand(brandId: string) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('catalogues')
      .select('*')
      .eq('brand_id', brandId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data as Catalogue[];
  },

  async create(catalogue: Omit<Catalogue, 'id' | 'created_at' | 'updated_at'>) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('catalogues')
      .insert([catalogue])
      .select()
      .single();
    
    if (error) throw error;
    return data as Catalogue;
  },

  async update(id: string, catalogue: Partial<Catalogue>) {
    const client = checkSupabase();
    const { data, error } = await client
      .from('catalogues')
      .update(catalogue)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Catalogue;
  },

  async delete(id: string) {
    const client = checkSupabase();
    const { error } = await client
      .from('catalogues')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadPDF(file: File, path: string) {
    const client = checkSupabase();
    const { error } = await client.storage
      .from('catalogues')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = client.storage
      .from('catalogues')
      .getPublicUrl(path);

    return publicUrl;
  }
};