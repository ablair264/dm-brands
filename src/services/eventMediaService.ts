import { supabase } from '../lib/supabase';

export interface EventMedia {
  logoUrl: string | null;
  photoUrls: string[];
}

const BUCKET = 'events';

export const eventMediaService = {
  async uploadLogo(eventId: string, file: File): Promise<string | null> {
    if (!supabase) throw new Error('Supabase not configured');
    const path = `${eventId}/logo.png`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return publicUrl;
  },

  async uploadPhotos(eventId: string, files: File[]): Promise<string[]> {
    if (!supabase) throw new Error('Supabase not configured');
    const uploaded: string[] = [];
    for (const file of files) {
      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const path = `${eventId}/photos/${safeName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, cacheControl: '3600' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push(publicUrl);
    }
    return uploaded;
  },

  async listMedia(eventId: string): Promise<EventMedia> {
    if (!supabase) return { logoUrl: null, photoUrls: [] };
    // Logo URL (public)
    const { data: { publicUrl: logoUrl } } = supabase.storage.from(BUCKET).getPublicUrl(`${eventId}/logo.png`);

    // Photos list
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(`${eventId}/photos`, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return { logoUrl, photoUrls: [] };

    const photoUrls = (files || [])
      .filter((f) => !!f.name)
      .map((f) => supabase.storage.from(BUCKET).getPublicUrl(`${eventId}/photos/${f.name}`).data.publicUrl);

    return { logoUrl, photoUrls };
  }
};

