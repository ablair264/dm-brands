// src/pages/CataloguesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Download } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import { catalogueService } from '../services/database';
import './CataloguesPage.css';

interface Catalogue {
  id: string;
  brand_id?: string;
  brand?: any;
  title?: string;
  year: string;
  season?: string;
  pdf_url?: string;
  color?: string;
  order_index?: number;
}

const CataloguesPage: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(true);

  const loadCatalogues = useCallback(async () => {
    try {
      // Try to load from database first
      if (useDatabase) {
        try {
          const data = await catalogueService.getAll();
          if (data && data.length > 0) {
            setCatalogues(data);
            setLoading(false);
            return;
          }
        } catch (dbError) {
          console.warn('Database not configured, falling back to static data:', dbError);
          setUseDatabase(false);
        }
      }

      // Fallback - no static data, only what's managed through admin
      setCatalogues([]);
    } catch (error) {
      console.error('Error loading catalogues:', error);
      setError('Failed to load catalogues');
    } finally {
      setLoading(false);
    }
  }, [useDatabase]);

  useEffect(() => {
    loadCatalogues();
    
    // Reload catalogues when window gains focus (helps when switching from admin tab)
    const handleFocus = () => {
      loadCatalogues();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadCatalogues]);

  const handleViewPDF = (catalogue: Catalogue) => {
    const brandName = catalogue.brand?.name || 'Catalogue';
    let title;
    
    if (catalogue.title) {
      title = `${brandName} - ${catalogue.title}`;
    } else {
      title = `${brandName} - ${catalogue.year} ${catalogue.season || ''}`.trim();
    }
    
    setSelectedPDF({
      url: catalogue.pdf_url || '',
      title
    });
  };

  if (loading) {
    return (
      <div className="catalogues-loading">
        <div className="spinner"></div>
        <p>Loading catalogues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalogues-loading">
        <p>{error}</p>
      </div>
    );
  }

  // Check if we have any catalogues
  if (catalogues.length === 0) {
    return (
      <div className="catalogues-page">
        <div className="gradient-overlay" />
        <div className="floating-accent" />
        
        <div className="catalogues-header">
          <div className="title-section">
            <h1 className="page-title">Catalogue Library</h1>
            <p className="page-subtitle">Browse our collection of brand catalogues and product guides</p>
          </div>
        </div>

        <div className="no-catalogues">
          <p>No catalogues available at the moment.</p>
          <p className="admin-hint">Add catalogues through the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  // Split catalogues into two shelves
  const midpoint = Math.ceil(catalogues.length / 2);
  const shelf1 = catalogues.slice(0, midpoint);
  const shelf2 = catalogues.slice(midpoint);

  return (
    <div className="catalogues-page">
      <div className="gradient-overlay" />
      <div className="floating-accent" />
      
      <div className="catalogues-header">
        <div className="title-section">
          <h1 className="page-title">Catalogue Library</h1>
          <p className="page-subtitle">Browse our collection of brand catalogues and product guides</p>
          {!useDatabase && (
            <p className="info-message">
              Connect to Supabase to manage catalogues dynamically. 
              See .env.example for configuration.
            </p>
          )}
        </div>
      </div>

      <div className="bookcase">
        {/* First Shelf */}
        <div className="shelf">
          <div className="books-row">
            {shelf1.map((catalogue, index) => (
              <div
                key={catalogue.id}
                className="book"
                style={{
                  '--animation-delay': `${index * 0.1}s`,
                  background: `linear-gradient(145deg, ${catalogue.color} 0%, ${catalogue.color}cc 100%)`
                } as React.CSSProperties}
              >
                <div className="book-spine">
                  {catalogue.title ? (
                    <div className="book-title">{catalogue.title}</div>
                  ) : (
                    <div className="book-year">{catalogue.year}</div>
                  )}
                  {catalogue.brand && (
                    <div className="brand-name">{catalogue.brand.name}</div>
                  )}
                </div>
                
                <div className="book-cover">
                  <div className="book-actions">
                    <button
                      onClick={() => handleViewPDF(catalogue)}
                      className="quick-action" 
                      title="View Catalogue"
                    >
                      <Eye size={18} />
                    </button>
                    <a 
                      href={catalogue.pdf_url} 
                      download
                      className="quick-action" 
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
                
                <div className="page-turn" />
              </div>
            ))}
          </div>
          <div className="shelf-board" />
        </div>

        {/* Second Shelf */}
        {shelf2.length > 0 && (
          <div className="shelf">
            <div className="books-row">
              {shelf2.map((catalogue, index) => (
                <div
                  key={catalogue.id}
                  className="book"
                  style={{
                    '--animation-delay': `${(midpoint + index) * 0.1}s`,
                    background: `linear-gradient(145deg, ${catalogue.color} 0%, ${catalogue.color}cc 100%)`
                  } as React.CSSProperties}
                >
                  <div className="book-spine">
                    {catalogue.title ? (
                      <div className="book-title">{catalogue.title}</div>
                    ) : (
                      <div className="book-year">{catalogue.year}</div>
                    )}
                    {catalogue.brand && (
                      <div className="brand-name">{catalogue.brand.name}</div>
                    )}
                  </div>
                  
                  <div className="book-cover">
                    <div className="book-actions">
                      <button
                        onClick={() => handleViewPDF(catalogue)}
                        className="quick-action" 
                        title="View Catalogue"
                      >
                        <Eye size={18} />
                      </button>
                      <a 
                        href={catalogue.pdf_url} 
                        download
                        className="quick-action" 
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="page-turn" />
                </div>
              ))}
            </div>
            <div className="shelf-board" />
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <PDFViewer
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
};

export default CataloguesPage;
