import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Package, FileText, Plus, Edit2, Trash2, Save, X, LogOut, Image } from 'lucide-react';
import { eventService, brandService, catalogueService } from '../services/database';
import { eventMediaService } from '../services/eventMediaService';
import { useAuth } from '../contexts/AuthContext';
import { customerAuthService, CustomerUser } from '../services/customerAuthService';
import './AdminDashboard.css';

interface Event {
  id: string;
  name: string;
  cover_image?: string;
  date: string;
  start_time: string;
  end_time: string;
  stand_number: string;
  location: string;
  description?: string;
  brands?: string[];
}

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
}

interface Catalogue {
  id: string;
  brand_id: string;
  brand?: Brand;
  title?: string;
  year: string;
  season?: string;
  pdf_url?: string;
  color?: string;
  order_index?: number;
}

// Use CustomerUser from service instead
type Customer = CustomerUser;

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingCatalogue, setIsAddingCatalogue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(true);
  const [managingMediaFor, setManagingMediaFor] = useState<Event | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const loadStaticData = useCallback(() => {
    // Static fallback data
    const staticBrands: Brand[] = [
      { id: '1', name: 'Elvang', logo_url: '/images/brands/elvang-logo.svg' },
      { id: '2', name: 'Gefu', logo_url: '/images/brands/gefu-logo.svg' },
      { id: '3', name: 'PPD', logo_url: '/images/brands/ppd-logo.svg' },
      { id: '4', name: 'My Flame', logo_url: '/images/brands/myflame-logo.svg' },
      { id: '5', name: 'Relaxound', logo_url: '/images/brands/relaxound-logo.svg' },
      { id: '6', name: 'Räder', logo_url: '/images/brands/rader-logo.svg' },
      { id: '7', name: 'Remember', logo_url: '/images/brands/remember-logo.svg' }
    ];
    setBrands(staticBrands);

    // Only load default event if none exist
    if (activeTab === 'events' && events.length === 0) {
      const staticEvents: Event[] = [
        {
          id: '1',
          name: 'Spring Fair 2025',
          cover_image: '/images/events/spring-fair.svg',
          date: '2025-02-02',
          start_time: '09:00',
          end_time: '18:00',
          stand_number: 'Hall 5, Stand H42',
          location: 'NEC Birmingham',
          brands: ['1', '2', '3'],
          description: 'Join us at the UK\'s largest home and gift trade show'
        }
      ];
      setEvents(staticEvents);
    }

    // Static catalogues
    if (activeTab === 'catalogues') {
      const staticCatalogues: Catalogue[] = [
        { id: '1', brand_id: '1', year: '2025', color: '#C4A274', pdf_url: '/catalogues/Elvang/elvang_2025.pdf' },
        { id: '2', brand_id: '2', year: '2025', color: '#2E7D32', pdf_url: '/catalogues/Gefu/gefu_2025.pdf' },
        { id: '3', brand_id: '3', year: '2025', color: '#8E24AA', pdf_url: '/catalogues/PPD/ppd_2025.pdf' },
      ];
      setCatalogues(staticCatalogues);
    }
  }, [activeTab, events.length]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useDatabase) {
        try {
          if (activeTab === 'events') {
            const data = await eventService.getAll();
            setEvents(data.map((event: any) => ({
              ...event,
              brands: event.event_brands?.map((eb: any) => eb.brand_id) || []
            })));
          } else if (activeTab === 'brands') {
            const data = await brandService.getAll();
            setBrands(data);
          } else if (activeTab === 'catalogues') {
            const catalogueData = await catalogueService.getAll();
            setCatalogues(catalogueData);
            const brandData = await brandService.getAll();
            setBrands(brandData);
          } else if (activeTab === 'customers') {
            // Inline customer load to avoid extra hook deps
            try {
              console.log('📋 Loading customer users from Splitfin database...');
              const customerUsers = await customerAuthService.getAllCustomerUsers();
              setCustomers(customerUsers);
              console.log(`✅ Loaded ${customerUsers.length} customer users`);
            } catch (error) {
              console.error('❌ Failed to load customer users:', error);
              setError('Failed to load customer users');
            }
          }
        } catch (dbError) {
          console.warn('Database not configured, using static data:', dbError);
          setUseDatabase(false);
          loadStaticData();
          if (activeTab === 'customers') {
            try {
              const customerUsers = await customerAuthService.getAllCustomerUsers();
              setCustomers(customerUsers);
            } catch (error) {
              console.error('❌ Failed to load customer users:', error);
              setError('Failed to load customer users');
            }
          }
        }
      } else {
        loadStaticData();
        if (activeTab === 'customers') {
          try {
            const customerUsers = await customerAuthService.getAllCustomerUsers();
            setCustomers(customerUsers);
          } catch (error) {
            console.error('❌ Failed to load customer users:', error);
            setError('Failed to load customer users');
          }
        }
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, useDatabase, loadStaticData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  

  const loadCustomers = async () => {
    try {
      console.log('📋 Loading customer users from Splitfin database...');
      const customerUsers = await customerAuthService.getAllCustomerUsers();
      setCustomers(customerUsers);
      console.log(`✅ Loaded ${customerUsers.length} customer users`);
    } catch (error) {
      console.error('❌ Failed to load customer users:', error);
      setError('Failed to load customer users');
    }
  };

  const handleCustomerStatusChange = async (customerId: string, newStatus: 'approved' | 'rejected' | 'disabled') => {
    try {
      console.log(`🔄 Updating customer ${customerId} status to ${newStatus}`);
      
      const isActive = newStatus === 'approved';
      const result = await customerAuthService.updateCustomerUserStatus(customerId, isActive);
      
      if (result.success) {
        // Reload customer list to get updated data
        await loadCustomers();
        console.log(`✅ Customer status updated to ${newStatus}`);
      } else {
        setError(result.error || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('❌ Failed to update customer status:', error);
      setError('Failed to update customer status');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        console.log(`🗑️ Deleting customer ${customerId}`);
        
        const result = await customerAuthService.deleteCustomerUser(customerId);
        
        if (result.success) {
          // Reload customer list to get updated data
          await loadCustomers();
          console.log('✅ Customer deleted successfully');
        } else {
          setError(result.error || 'Failed to delete customer');
        }
      } catch (error) {
        console.error('❌ Failed to delete customer:', error);
        setError('Failed to delete customer');
      }
    }
  };

  const handleSaveEvent = async (event: Event) => {
    setLoading(true);
    setError(null);

    try {
      if (useDatabase) {
        if (editingEvent) {
          await eventService.update(event.id, event, event.brands);
        } else {
          await eventService.create(
            { 
              name: event.name,
              cover_image: event.cover_image,
              date: event.date,
              start_time: event.start_time,
              end_time: event.end_time,
              stand_number: event.stand_number,
              location: event.location,
              description: event.description
            },
            event.brands || []
          );
        }
        await loadData();
      } else {
        // Static mode - just update local state
        if (editingEvent) {
          setEvents(events.map(e => e.id === event.id ? event : e));
        } else {
          setEvents([...events, { ...event, id: Date.now().toString() }]);
        }
      }
      
      setEditingEvent(null);
      setIsAddingEvent(false);
    } catch (err) {
      setError('Failed to save event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setLoading(true);
      try {
        if (useDatabase) {
          await eventService.delete(id);
          await loadData();
        } else {
          setEvents(events.filter(e => e.id !== id));
        }
      } catch (err) {
        setError('Failed to delete event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveCatalogue = async (catalogue: Catalogue, pdfFile?: File) => {
    setLoading(true);
    setError(null);

    try {
      let pdfUrl = catalogue.pdf_url;

      // Upload PDF if provided
      if (pdfFile && useDatabase) {
        const path = `${catalogue.brand_id}/${catalogue.year}-${catalogue.season || 'main'}.pdf`;
        pdfUrl = await catalogueService.uploadPDF(pdfFile, path);
      }

      const catalogueData = {
        brand_id: catalogue.brand_id,
        title: catalogue.title,
        year: catalogue.year,
        season: catalogue.season,
        pdf_url: pdfUrl,
        color: catalogue.color || '#91868e',
        order_index: catalogue.order_index || 0
      };

      if (useDatabase) {
        if (editingCatalogue) {
          await catalogueService.update(catalogue.id, catalogueData);
        } else {
          await catalogueService.create(catalogueData);
        }
        await loadData();
      } else {
        // Static mode
        if (editingCatalogue) {
          setCatalogues(catalogues.map(c => c.id === catalogue.id ? { ...catalogue, pdf_url: pdfUrl } : c));
        } else {
          setCatalogues([...catalogues, { ...catalogueData, id: Date.now().toString() }]);
        }
      }

      setEditingCatalogue(null);
      setIsAddingCatalogue(false);
    } catch (err) {
      setError('Failed to save catalogue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCatalogue = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this catalogue?')) {
      setLoading(true);
      try {
        if (useDatabase) {
          await catalogueService.delete(id);
          await loadData();
        } else {
          setCatalogues(catalogues.filter(c => c.id !== id));
        }
      } catch (err) {
        setError('Failed to delete catalogue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Event Form Component
  const EventForm: React.FC<{ event: Event | null; onSave: (event: Event) => void; onCancel: () => void; onManageMedia?: (eventId: string) => void }> = ({ event, onSave, onCancel, onManageMedia }) => {
    const [formData, setFormData] = useState<Event>(
      event || {
        id: '',
        name: '',
        cover_image: '',
        date: '',
        start_time: '',
        end_time: '',
        stand_number: '',
        location: '',
        brands: [],
        description: ''
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const toggleBrand = (brandId: string) => {
      setFormData({
        ...formData,
        brands: formData.brands?.includes(brandId)
          ? formData.brands.filter(b => b !== brandId)
          : [...(formData.brands || []), brandId]
      });
    };

    return (
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              type="text"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              placeholder="/images/events/event-name.jpg"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Stand Number</label>
            <input
              type="text"
              value={formData.stand_number}
              onChange={(e) => setFormData({ ...formData, stand_number: e.target.value })}
              placeholder="Hall 5, Stand H42"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="NEC Birmingham"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Event description (optional)"
            />
          </div>

          <div className="form-group full-width">
            <label>Participating Brands (max 5)</label>
            <div className="brand-selector">
              {brands.map(brand => (
                <label key={brand.id} className="brand-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.brands?.includes(brand.id) || false}
                    onChange={() => toggleBrand(brand.id)}
                    disabled={!formData.brands?.includes(brand.id) && (formData.brands?.length || 0) >= 5}
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            Save Event
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            <X size={16} />
            Cancel
          </button>
          {event?.id && onManageMedia && (
            <button type="button" className="btn" onClick={() => onManageMedia(event.id)}>
              <Image size={16} /> Manage Media
            </button>
          )}
        </div>
      </form>
    );
  };

  // Catalogue Form Component
  const CatalogueForm: React.FC<{ 
    catalogue: Catalogue | null; 
    onSave: (catalogue: Catalogue, file?: File) => void; 
    onCancel: () => void 
  }> = ({ catalogue, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Catalogue>(
      catalogue || {
        id: '',
        brand_id: brands[0]?.id || '',
        title: '',
        year: new Date().getFullYear().toString(),
        season: '',
        pdf_url: '',
        color: '#91868e',
        order_index: 0
      }
    );
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData, pdfFile || undefined);
    };

    const colors = [
      '#C4A274', '#2E7D32', '#8E24AA', '#F4A460', 
      '#6FBE89', '#8B6DB5', '#E6A4C4', '#91868e',
      '#FFB74D', '#9575CD', '#7E57C2', '#673AB7',
      '#512DA8', '#D1879C'
    ];

    return (
      <form onSubmit={handleSubmit} className="catalogue-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Brand</label>
            <select
              value={formData.brand_id}
              onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
              required
            >
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Spring Collection, Product Catalog"
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2025"
              required
            />
          </div>

          <div className="form-group">
            <label>Season (Optional)</label>
            <input
              type="text"
              value={formData.season || ''}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              placeholder="Spring/Summer, Fall/Winter, etc."
            />
          </div>

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              value={formData.order_index || 0}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <div className="color-presets">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className="color-preset"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>PDF File</label>
            {formData.pdf_url && !pdfFile && (
              <div className="current-file">
                Current: <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer">View PDF</a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
            {!useDatabase && (
              <small>Note: PDF upload requires database connection</small>
            )}
          </div>

          <div className="form-group full-width">
            <label>PDF URL (Alternative)</label>
            <input
              type="text"
              value={formData.pdf_url || ''}
              onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              placeholder="/catalogues/brand/catalogue.pdf"
              disabled={!!pdfFile}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            Save Catalogue
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your website content</p>
          {!useDatabase && (
            <p className="db-warning">
              Database not connected. Configure Supabase in .env file for full functionality.
            </p>
          )}
        </div>
        <div className="admin-header-actions">
          <Link 
            to="/image-bank"
            className="image-bank-button" 
            title="Access Image Bank"
          >
            <Image size={18} />
            Image Bank
          </Link>
          <div className="user-info">
            <span>Logged in as: {user?.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={18} />
          Events
        </button>
        <button
          className={`tab ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          <Package size={18} />
          Brands
        </button>
        <button
          className={`tab ${activeTab === 'catalogues' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogues')}
        >
          <FileText size={18} />
          Catalogues
        </button>
        <button
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} />
          Customers
        </button>
      </div>

      <div className="admin-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Events Management */}
        {activeTab === 'events' && !loading && (
          <div className="events-management">
            <div className="section-header">
              <h2>Manage Events</h2>
              {!isAddingEvent && !editingEvent && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAddingEvent(true)}
                >
                  <Plus size={16} />
                  Add Event
                </button>
              )}
            </div>

            {isAddingEvent && (
              <div className="form-container">
                <h3>Add New Event</h3>
                <EventForm
                  event={null}
                  onSave={handleSaveEvent}
                  onCancel={() => setIsAddingEvent(false)}
                />
              </div>
            )}

            {editingEvent && (
              <div className="form-container">
                <h3>Edit Event</h3>
                <EventForm
                  event={editingEvent}
                  onSave={handleSaveEvent}
                  onCancel={() => setEditingEvent(null)}
                  onManageMedia={(id: string) => {
                    const ev = events.find(e => e.id === id) || editingEvent;
                    setManagingMediaFor(ev);
                  }}
                />
              </div>
            )}

            {!isAddingEvent && !editingEvent && (
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-info">
                      <h3>{event.name}</h3>
                      <p>{new Date(event.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</p>
                      <p>{event.location} - {event.stand_number}</p>
                    </div>
                    <div className="event-actions">
                      <button
                        className="btn btn-icon"
                        title="Manage event media"
                        onClick={() => setManagingMediaFor(event)}
                      >
                        <Image size={16} />
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p>No events yet. Click "Add Event" to create one.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Catalogues Management */}
        {activeTab === 'catalogues' && !loading && (
          <div className="catalogues-management">
            <div className="section-header">
              <h2>Manage Catalogues</h2>
              {!isAddingCatalogue && !editingCatalogue && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAddingCatalogue(true)}
                >
                  <Plus size={16} />
                  Add Catalogue
                </button>
              )}
            </div>

            {isAddingCatalogue && (
              <div className="form-container">
                <h3>Add New Catalogue</h3>
                <CatalogueForm
                  catalogue={null}
                  onSave={handleSaveCatalogue}
                  onCancel={() => setIsAddingCatalogue(false)}
                />
              </div>
            )}

            {editingCatalogue && (
              <div className="form-container">
                <h3>Edit Catalogue</h3>
                <CatalogueForm
                  catalogue={editingCatalogue}
                  onSave={handleSaveCatalogue}
                  onCancel={() => setEditingCatalogue(null)}
                />
              </div>
            )}

            {!isAddingCatalogue && !editingCatalogue && (
              <div className="catalogues-list">
                {catalogues.map(catalogue => {
                  const brand = brands.find(b => b.id === catalogue.brand_id);
                  return (
                    <div key={catalogue.id} className="catalogue-item">
                      <div 
                        className="catalogue-color" 
                        style={{ backgroundColor: catalogue.color }}
                      />
                      <div className="catalogue-info">
                        <h3>{brand?.name || 'Unknown Brand'}</h3>
                        <p>{catalogue.year} {catalogue.season && `- ${catalogue.season}`}</p>
                        {catalogue.pdf_url && (
                          <a href={catalogue.pdf_url} target="_blank" rel="noopener noreferrer">
                            View PDF
                          </a>
                        )}
                      </div>
                      <div className="catalogue-actions">
                        <button
                          className="btn btn-icon"
                          onClick={() => setEditingCatalogue(catalogue)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleDeleteCatalogue(catalogue.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {catalogues.length === 0 && (
                  <p>No catalogues yet. Click "Add Catalogue" to create one.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Brands Management */}
        {activeTab === 'brands' && !loading && (
          <div className="section-placeholder">
            <h2>Brand Management</h2>
            <div className="brands-list">
              {brands.map(brand => (
                <div key={brand.id} className="brand-item">
                  {brand.logo_url && <img src={brand.logo_url} alt={brand.name} />}
                  <span>{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Management */}
        {activeTab === 'customers' && !loading && (
          <div className="customers-management">
            <div className="section-header">
              <h2>Customer Management</h2>
              <div className="customer-stats">
                <span className="stat">
                  <strong>{customers.filter(c => !c.is_active).length}</strong> Pending
                </span>
                <span className="stat">
                  <strong>{customers.filter(c => c.is_active).length}</strong> Approved
                </span>
                <span className="stat">
                  <strong>{customers.length}</strong> Total
                </span>
              </div>
            </div>

            <div className="customers-list">
              {customers.length === 0 ? (
                <div className="empty-state">
                  <p>No customer accounts found.</p>
                  <p>Customers will appear here when they sign up for image bank access.</p>
                </div>
              ) : (
                <div className="customers-table">
                  <div className="table-header">
                    <div className="col-name">Customer</div>
                    <div className="col-company">Company</div>
                    <div className="col-status">Status</div>
                    <div className="col-date">Joined</div>
                    <div className="col-actions">Actions</div>
                  </div>
                  
                  {customers.map(customer => (
                    <div key={customer.id} className={`customer-row status-${customer.is_active ? 'approved' : 'pending'}`}>
                      <div className="col-name">
                        <div className="customer-info">
                          <strong>{customer.name}</strong>
                          <span className="email">{customer.email}</span>
                          {customer.contact_type && (
                            <span className="contact-type">{customer.contact_type}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-company">
                        {customer.customer?.trading_name || customer.customer?.display_name || 'Unknown'}
                      </div>
                      <div className="col-status">
                        <span className={`status-badge ${customer.is_active ? 'approved' : 'pending'}`}>
                          {customer.is_active ? 'Approved' : 'Pending'}
                        </span>
                        {customer.master_user && <span className="master-badge">Master</span>}
                      </div>
                      <div className="col-date">
                        {new Date(customer.created_date).toLocaleDateString()}
                        {customer.last_login && (
                          <div className="last-login">
                            Last: {new Date(customer.last_login).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="col-actions">
                        {!customer.is_active && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCustomerStatusChange(customer.id, 'approved')}
                            title="Approve"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {customer.is_active && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCustomerStatusChange(customer.id, 'disabled')}
                            title="Disable"
                          >
                            Disable
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {managingMediaFor && (
        <div className="media-overlay" onClick={() => setManagingMediaFor(null)}>
          <div className="media-manager" onClick={(e) => e.stopPropagation()}>
            <div className="media-header">
              <h3>Manage Media — {managingMediaFor.name}</h3>
              <button className="btn btn-icon" onClick={() => setManagingMediaFor(null)}><X size={16} /></button>
            </div>
            <div className="media-body">
              <div className="media-section">
                <label>Event Logo (PNG recommended)</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                <button
                  className="btn btn-primary"
                  disabled={!logoFile || mediaUploading}
                  onClick={async () => {
                    if (!managingMediaFor || !logoFile) return;
                    try {
                      setMediaUploading(true);
                      await eventMediaService.uploadLogo(managingMediaFor.id, logoFile);
                      alert('Logo uploaded');
                      setLogoFile(null);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to upload logo');
                    } finally {
                      setMediaUploading(false);
                    }
                  }}
                >Upload Logo</button>
              </div>

              <div className="media-section">
                <label>Event Photos</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setPhotoFiles(e.target.files)} />
                <button
                  className="btn btn-primary"
                  disabled={!photoFiles || photoFiles.length === 0 || mediaUploading}
                  onClick={async () => {
                    if (!managingMediaFor || !photoFiles) return;
                    try {
                      setMediaUploading(true);
                      await eventMediaService.uploadPhotos(managingMediaFor.id, Array.from(photoFiles));
                      alert('Photos uploaded');
                      setPhotoFiles(null);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to upload photos');
                    } finally {
                      setMediaUploading(false);
                    }
                  }}
                >Upload Photos</button>
              </div>

              <p className="media-hint">These files are stored under the <code>events</code> storage bucket. The homepage recent events section pulls the latest event and shows its logo and photos.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
