import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Grid, List, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { splitfinImageService } from '../services/splitfinImageService';
import { ImageItem, SplitfinBrand, ImageBankFilters } from '../types/imageBank';
import './CustomerImageBank.css';

const CustomerImageBank: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [brands, setBrands] = useState<SplitfinBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [filters, setFilters] = useState<ImageBankFilters>({
    searchQuery: '',
    selectedBrand: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadOnMount = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await loadData();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test connection first
      console.log('🚀 Starting image bank data load...');
      const connectionTest = await splitfinImageService.testConnection(isAdmin);
      
      if (!connectionTest.connected) {
        setError(`Connection failed: ${connectionTest.error}`);
        setLoading(false);
        return;
      }
      
      console.log('🔄 Loading brands and images...');
      const [brandsData, imagesData] = await Promise.all([
        splitfinImageService.loadBrands(isAdmin),
        splitfinImageService.loadImages(undefined, isAdmin)
      ]);
      
      console.log(`📊 Load complete - ${brandsData.length} brands, ${imagesData.length} images`);
      setBrands(brandsData);
      setImages(imagesData);
      
      if (imagesData.length === 0) {
        setError('No images found. This could be due to: \n• No images uploaded to Splitfin storage\n• Brand buckets not created\n• Access permissions');
      }
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError('Failed to load images. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDownload = async (image: ImageItem) => {
    try {
      const url = await splitfinImageService.getDownloadUrl(image, isAdmin);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleBulkDownload = async () => {
    if (selectedImages.length === 0) return;
    
    for (const imageId of selectedImages) {
      const image = filteredImages.find(img => img.id === imageId);
      if (image) {
        await handleDownload(image);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setSelectedImages([]);
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const filteredImages = useMemo(() => {
    let filtered = [...images];
    
    // Apply search filter
    if (filters.searchQuery) {
      filtered = splitfinImageService.searchImages(filtered, filters.searchQuery);
    }
    
    // Apply brand filter
    if (filters.selectedBrand) {
      filtered = filtered.filter(img => img.brand_id === filters.selectedBrand);
    }
    
    // Apply sorting
    filtered = splitfinImageService.sortImages(filtered, filters.sortBy, filters.sortOrder);
    
    return filtered;
  }, [images, filters]);

  const updateFilters = (updates: Partial<ImageBankFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="customer-image-bank">
      {/* Header */}
      <div className="image-bank-header">
        <div className="header-left">
          <h1>DM Brands Image Bank</h1>
          <p>{filteredImages.length} images available</p>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <User size={18} />
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="image-bank-controls">
        <div className="controls-left">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search images..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="search-input"
            />
          </div>
          
          <select
            value={filters.selectedBrand || ''}
            onChange={(e) => updateFilters({ selectedBrand: e.target.value || null })}
            className="brand-filter"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>

        <div className="controls-right">
          {selectedImages.length > 0 && (
            <button onClick={handleBulkDownload} className="bulk-download-btn">
              <Download size={16} />
              Download Selected ({selectedImages.length})
            </button>
          )}
          
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
              updateFilters({ sortBy, sortOrder });
            }}
            className="sort-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
          
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="image-bank-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading images...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadData} className="retry-btn">Try Again</button>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>No images found</h3>
            <p>
              {filters.searchQuery 
                ? `No images match "${filters.searchQuery}"`
                : 'No images available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className={`images-container ${viewMode}`}>
            {filteredImages.map(image => (
              <div key={image.id} className={`image-item ${selectedImages.includes(image.id) ? 'selected' : ''}`}>
                <div className="image-preview">
                  <img
                    src={image.url}
                    alt={image.name}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <button
                      onClick={() => toggleImageSelection(image.id)}
                      className="select-btn"
                    >
                      {selectedImages.includes(image.id) ? '✓' : '+'}
                    </button>
                    <button
                      onClick={() => handleDownload(image)}
                      className="download-btn"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="image-info">
                  <div className="image-name" title={image.name}>
                    {image.name}
                  </div>
                  <div className="image-meta">
                    <span className="brand-tag">{image.brand_name}</span>
                    <span className="file-size">
                      {splitfinImageService.formatFileSize(image.size)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerImageBank;
