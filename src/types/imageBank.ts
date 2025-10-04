// Types for Image Bank functionality
export interface ImageItem {
  id: string;
  name: string;
  url: string;
  brand_id: string;
  brand_name: string;
  brand_normalized: string;
  actual_bucket_name?: string;
  size: number;
  uploaded_at: string;
  content_type: string;
}

export interface SplitfinBrand {
  id: string;
  brand_name: string;
  brand_normalized: string;
  logo_url?: string;
  is_active: boolean;
  company_id?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface ImageBankFilters {
  searchQuery: string;
  selectedBrand: string | null;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}