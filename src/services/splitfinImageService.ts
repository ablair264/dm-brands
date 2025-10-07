import { createClient } from '@supabase/supabase-js';
import { ImageItem, SplitfinBrand } from '../types/imageBank';

// Splitfin Supabase configuration
const SPLITFIN_SUPABASE_URL = 'https://dcgagukbbzfqaymlxnzw.supabase.co';
const SPLITFIN_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZ2FndWtiYnpmcWF5bWx4bnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDE3NDcsImV4cCI6MjA3MTk3Nzc0N30.i0EiHKdEWeJVw6RY3AUp-6aqv-ywunCOFe4_7cV2KmM';
const SPLITFIN_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZ2FndWtiYnpmcWF5bWx4bnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwMTc0NywiZXhwIjoyMDcxOTc3NzQ3fQ.kDM90xZ_nBas9h6GhdjGtDqEK3b8nbW3hqfptmOPncU';

// Create Splitfin Supabase client with service role for admin operations
export const splitfinSupabase = createClient(SPLITFIN_SUPABASE_URL, SPLITFIN_SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false, // Don't persist auth for this external connection
    autoRefreshToken: false,
    storageKey: 'splitfin-service-token', // avoid sharing storage key with other clients
  },
});

// Create Splitfin Supabase client for customer operations (uses customer auth session)
export const splitfinCustomerSupabase = createClient(SPLITFIN_SUPABASE_URL, SPLITFIN_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Persist customer sessions
    autoRefreshToken: true,
    storageKey: 'splitfin-customer-token', // separate storage key
  },
});

// Known DM Brands company ID in Splitfin system
const DM_BRANDS_COMPANY_ID = '87dcc6db-2e24-46fb-9a12-7886f690a326';

class SplitfinImageService {
  // Test connection to Splitfin Supabase
  async testConnection(asAdmin: boolean = false): Promise<{ connected: boolean; error?: string }> {
    try {
      console.log('🔗 Testing Splitfin Supabase connection...');
      
      // Simple test query to check connection
      const client = asAdmin ? splitfinSupabase : splitfinCustomerSupabase;
      const { error } = await client
        .from('brands')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Connection test failed:', error);
        return { connected: false, error: error.message };
      }

      console.log('✅ Splitfin Supabase connection successful');
      return { connected: true };
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Load brands that belong to DM Brands company
  async loadBrands(asAdmin: boolean = false): Promise<SplitfinBrand[]> {
    try {
      console.log('🔍 Loading brands from Splitfin...');
      console.log('DM_BRANDS_COMPANY_ID:', DM_BRANDS_COMPANY_ID);
      const client = asAdmin ? splitfinSupabase : splitfinCustomerSupabase;
      
      // First, let's see ALL brands to debug
      console.log('🔍 First, checking all brands in the database...');
      const { data: allBrands, error: allBrandsError } = await client
        .from('brands')
        .select('id, brand_name, brand_normalized, logo_url, is_active, company_id')
        .limit(10);

      if (allBrandsError) {
        console.error('❌ Error loading all brands:', allBrandsError);
      } else {
        console.log('📋 Total brands in database:', allBrands?.length || 0);
        console.log('📋 All brands sample:', allBrands);
        
        // Check company_ids
        const companyIds = Array.from(new Set(allBrands?.map(b => b.company_id)));
        console.log('🏢 Unique company IDs found:', companyIds);
        
        // Check active status
        const activeBrands = allBrands?.filter(b => b.is_active);
        console.log('✅ Active brands:', activeBrands?.length || 0);
      }
      
      // Now try the specific query
      console.log('🎯 Now querying for DM Brands specifically...');
      const { data: brandsData, error } = await client
        .from('brands')
        .select('id, brand_name, brand_normalized, logo_url, is_active, company_id')
        .eq('is_active', true)
        .eq('company_id', DM_BRANDS_COMPANY_ID)
        .order('brand_name');

      if (error) {
        console.error('❌ Error loading DM Brands:', error);
        console.log('🔍 Error details:', {
          message: error.message,
          error: error
        });
        return [];
      }

      console.log('✅ DM Brands loaded successfully:', brandsData?.length || 0, 'brands found');
      console.log('📋 DM Brand details:', brandsData);
      
      // If no DM brands found, let's try without the company_id filter
      if (!brandsData || brandsData.length === 0) {
        console.log('🔍 No DM brands found, trying without company_id filter...');
        const { data: anyActiveBrands, error: anyError } = await client
          .from('brands')
          .select('id, brand_name, brand_normalized, logo_url, is_active, company_id')
          .eq('is_active', true)
          .order('brand_name');
          
        if (!anyError && anyActiveBrands) {
          console.log('📋 Any active brands:', anyActiveBrands.length);
          console.log('📋 Active brands details:', anyActiveBrands);
        }
      }
      
      return brandsData || [];
    } catch (error) {
      console.error('❌ Failed to load brands from Splitfin:', error);
      return [];
    }
  }

  // List all available buckets for debugging
  async listAllBuckets(): Promise<string[]> {
    try {
      console.log('🗂️ Listing all available storage buckets...');
      const { data: buckets, error } = await splitfinCustomerSupabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Error listing buckets:', error);
        console.log('🔍 This might be a permissions issue - anonymous key may not have bucket list access');
        return [];
      }
      
      const bucketNames = buckets?.map(b => b.name) || [];
      console.log('📋 Available buckets:', bucketNames);
      
      // If no buckets found, it's likely a permissions issue
      if (bucketNames.length === 0) {
        console.warn('⚠️ No buckets found - this suggests the anonymous key lacks permissions');
        console.log('💡 Solution: Add public read policies to storage buckets or use service role key');
      }
      
      return bucketNames;
    } catch (error) {
      console.error('❌ Failed to list buckets:', error);
      return [];
    }
  }

  // Load images for specific brand or all DM Brands
  async loadImages(brandId?: string, asAdmin: boolean = false): Promise<ImageItem[]> {
    try {
      console.log('🖼️ Loading images from Splitfin storage...');
      const client = asAdmin ? splitfinSupabase : splitfinCustomerSupabase;

      const brands = await this.loadBrands();
      
      if (brands.length === 0) {
        console.warn('⚠️ No brands found, cannot load images');
        return [];
      }
      
      const imageItems: ImageItem[] = [];
      const brandsToProcess = brandId 
        ? brands.filter(b => b.id === brandId)
        : brands;

      console.log(`📁 Processing ${brandsToProcess.length} brands for images`);
      console.log('🔍 Brand names to look for:', brandsToProcess.map(b => b.brand_name));

      for (const brand of brandsToProcess) {
        try {
          console.log(`🔍 Checking bucket for brand: "${brand.brand_name}"`);
          
          // List files from brand bucket
          const { data: files, error: filesError } = await client.storage
            .from(brand.brand_name)
            .list('', {
              limit: 1000,
              offset: 0,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (filesError) {
            console.warn(`❌ Error accessing bucket '${brand.brand_name}':`, filesError);
            console.log('🔍 Error details:', {
              message: filesError.message,
              error: filesError
            });
            continue;
          }

          console.log(`📂 Found ${files?.length || 0} files in ${brand.brand_name} bucket`);

          if (files && files.length > 0) {
            console.log(`📄 File list for ${brand.brand_name}:`, files.map(f => f.name));
            
            const imageFiles = files.filter(file => file.name && this.isImageFile(file.name));
            console.log(`🖼️ Found ${imageFiles.length} image files in ${brand.brand_name}`);
            
            const brandImages = imageFiles.map((file: any) => {
              const { data } = client.storage
                .from(brand.brand_name)
                .getPublicUrl(file.name);

              console.log(`🔗 Generated URL for ${file.name}:`, data.publicUrl);

              return {
                id: file.id || `${brand.id}_${file.name}`,
                name: file.name,
                url: data.publicUrl,
                brand_id: brand.id,
                brand_name: brand.brand_name,
                brand_normalized: brand.brand_normalized,
                actual_bucket_name: brand.brand_name,
                size: file.metadata?.size || 0,
                uploaded_at: file.created_at || new Date().toISOString(),
                content_type: file.metadata?.mimetype || this.getMimeType(file.name)
              } as ImageItem;
            });
            
            imageItems.push(...brandImages);
          } else {
            console.log(`📭 No files found in bucket: ${brand.brand_name}`);
          }
        } catch (brandError) {
          console.error(`❌ Error processing brand ${brand.brand_name}:`, brandError);
          console.log('🔍 Brand error details:', brandError);
        }
      }

      console.log(`✅ Total images loaded: ${imageItems.length}`);
      return imageItems;
    } catch (error) {
      console.error('❌ Failed to load images from Splitfin:', error);
      return [];
    }
  }

  // Get download URL for image
  async getDownloadUrl(image: ImageItem, asAdmin: boolean = false): Promise<string> {
    try {
      const client = asAdmin ? splitfinSupabase : splitfinCustomerSupabase;
      const { data } = await client.storage
        .from(image.actual_bucket_name || image.brand_name)
        .createSignedUrl(image.name, 3600); // 1 hour expiry

      return data?.signedUrl || image.url;
    } catch (error) {
      console.error('Failed to create signed URL:', error);
      return image.url;
    }
  }

  // Helper to check if file is an image
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  // Helper to get MIME type from filename
  private getMimeType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  // Search images by query
  searchImages(images: ImageItem[], query: string): ImageItem[] {
    if (!query.trim()) return images;
    
    const searchTerm = query.toLowerCase();
    return images.filter(image => 
      image.name.toLowerCase().includes(searchTerm) ||
      image.brand_name.toLowerCase().includes(searchTerm)
    );
  }

  // Sort images
  sortImages(images: ImageItem[], sortBy: 'name' | 'date' | 'size', order: 'asc' | 'desc' = 'asc'): ImageItem[] {
    const sorted = [...images].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export const splitfinImageService = new SplitfinImageService();
