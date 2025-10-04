import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { eventService } from '../services/database';
import './EventsPage.css';

interface Brand {
  id: string;
  name: string;
  logo: string;
}

interface Event {
  id: string;
  name: string;
  coverImage: string;
  date: string;
  startTime: string;
  endTime: string;
  standNumber: string;
  location: string;
  brands: Brand[];
  description?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Try to load from database first
      try {
        const data = await eventService.getAll();
        if (data && data.length > 0) {
          setEvents(data.map((event: any) => ({
            id: event.id,
            name: event.name,
            coverImage: event.cover_image || '/images/events/spring-fair.svg',
            date: event.date,
            startTime: event.start_time,
            endTime: event.end_time,
            standNumber: event.stand_number,
            location: event.location,
            description: event.description,
            brands: event.event_brands?.map((eb: any) => ({
              id: eb.brands?.id || eb.brand_id,
              name: eb.brands?.name || 'Unknown',
              logo: eb.brands?.logo_url || ''
            })) || []
          })));
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.warn('Database not available, no events to display');
      }

      // No fallback data - only show what's in the database or admin
      setEvents([]);
      setLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="container">
          <div className="loading">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="container">
        <div className="page-header">
          <h1>Upcoming Events</h1>
          <p>Meet us at trade shows and exhibitions</p>
        </div>

        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img src={event.coverImage} alt={event.name} />
              </div>
              
              <div className="event-content">
                <h2 className="event-name">{event.name}</h2>
                
                <div className="event-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{event.standNumber}</span>
                  </div>
                </div>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-brands">
                  <span className="brands-label">Brands exhibiting:</span>
                  <div className="brand-logos">
                    {event.brands.slice(0, 5).map(brand => (
                      <div key={brand.id} className="brand-circle" title={brand.name}>
                        <img src={brand.logo} alt={brand.name} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="no-events">
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;