// src/pages/HomePage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandModal from '../components/BrandModal';
import PhotoStack from '../components/PhotoStack';
import { eventService } from '../services/database';
import { eventMediaService } from '../services/eventMediaService';
import './HomePage.css';

interface Brand {
  id: string;
  name: string;
  image: string;
  description: string;
  website: string;
  color: string;
}

const HomePage: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const brands: Brand[] = [
    {
      id: 'elvang',
      name: 'Elvang',
      image: '/images/elvang-banner.jpg',
      description: 'Elvang is a Danish design company specializing in high-quality home textiles and throws. Founded with a passion for Scandinavian design, Elvang creates timeless pieces that combine functionality with aesthetic appeal. Their products feature sustainable materials and traditional craftsmanship, bringing warmth and comfort to modern living spaces.',
      website: 'https://www.elvang.co.uk',
      color: '#C4A274'
    },
    {
      id: 'gefu',
      name: 'Gefu',
      image: '/images/gefu-banner.jpg',
      description: 'GEFU is a German manufacturer of innovative kitchen tools and gadgets since 1943. Known for their precision engineering and functional design, GEFU products make cooking preparation easier and more enjoyable. From spiralizers to garlic presses, their range combines German quality with practical innovation.',
      website: 'https://www.gefu.com',
      color: '#2E7D32'
    },
    {
      id: 'ppd',
      name: 'PPD',
      image: '/images/banner3.jpg',
      description: 'Paper Products Design (PPD) creates beautiful paper napkins, tissues, and tableware featuring artwork from talented artists worldwide. Their collections transform everyday items into decorative pieces, perfect for entertaining or gifting. PPD brings art to the table with eco-friendly products.',
      website: 'https://paperproductsdesign.de',
      color: '#8E24AA'
    },
    {
      id: 'myflame',
      name: 'My Flame Lifestyle',
      image: '/images/myflame-banner.jpg',
      description: 'My Flame Lifestyle creates scented candles with a personal touch. Each candle features unique, heartwarming quotes that inspire and bring joy. Made with natural soy wax and premium fragrances, their products combine beautiful design with meaningful messages for every occasion.',
      website: 'https://www.myflame.nl',
      color: '#F4A460'
    },
    {
      id: 'relaxound',
      name: 'Relaxound',
      image: '/images/relaxound-banner.jpg',
      description: 'Relaxound brings nature sounds into your home with their innovative Zwitscherbox motion-activated sound boxes. These unique devices play authentic bird songs, creating a calming atmosphere. Perfect for reducing stress and bringing a touch of nature to urban living.',
      website: 'https://www.relaxound.com',
      color: '#6FBE89'
    },
    {
      id: 'rader',
      name: 'Räder',
      image: '/images/rader-banner.jpg',
      description: 'Räder creates poetic living accessories that tell stories and touch hearts. This German brand combines minimalist design with meaningful messages, creating products that celebrate lifes special moments. From decorative items to gifts, each piece is designed to inspire and delight.',
      website: 'https://www.raeder.de',
      color: '#8B6DB5'
    },
    {
      id: 'remember',
      name: 'Remember',
      image: '/images/remember-banner.jpg',
      description: 'Remember brings color and joy to everyday life with their vibrant games, home accessories, and gifts. Known for their bold patterns and playful designs, Remember products transform ordinary items into extraordinary pieces that spark happiness and create memories.',
      website: 'https://www.remember.de',
      color: '#E6A4C4'
    }
  ];

  const brandLogos: string[] = [
    '/images/brands/elvang-logo.svg',
    '/images/brands/gefu-logo.svg',
    '/images/brands/ppd-logo.svg',
    '/images/brands/myflame-logo.svg',
    '/images/brands/relaxound-logo.svg',
    '/images/brands/rader-logo.svg',
    '/images/brands/remember-logo.svg',
  ];

  // Recent event gallery (drop images into public/images/events/three-counties-autumn-2025)
  const [dynamicEventImages, setDynamicEventImages] = useState<string[] | null>(null);
  const [dynamicEventLogo, setDynamicEventLogo] = useState<string | null>(null);
  const pastEventImages: string[] = [
    '/images/events/three-counties-autumn-2025/01.jpg',
    '/images/events/three-counties-autumn-2025/02.jpg',
    '/images/events/three-counties-autumn-2025/03.jpg',
    '/images/events/three-counties-autumn-2025/04.jpg',
    '/images/events/three-counties-autumn-2025/05.jpg',
    '/images/events/three-counties-autumn-2025/06.jpg',
  ];

  // Try to load latest event media from Supabase if configured
  React.useEffect(() => {
    (async () => {
      try {
        const all = await eventService.getAll();
        if (Array.isArray(all) && all.length > 0) {
          const sorted = [...all].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const latest = sorted[0];
          const media = await eventMediaService.listMedia(latest.id);
          if (media.photoUrls && media.photoUrls.length > 0) setDynamicEventImages(media.photoUrls);
          if (media.logoUrl) setDynamicEventLogo(media.logoUrl);
        }
      } catch (e) {
        // ignore if supabase not configured
      }
    })();
  }, []);

  return (
    <div className="homepage">
      
      <section className="hero-section">
        <div className="accordion-wrapper">
          <div className="image-accordion">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                className={`accordion-item ${hoveredIndex === index ? 'active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${brand.image})`,
                  backgroundColor: brand.color,
                  flex: hoveredIndex === index ? 3 : 1,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedBrand(brand)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="accordion-content">
                  <h3 className="brand-name">{brand.name}</h3>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="brand-preview"
                    >
                      <p className="brand-tagline">Click to explore</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="brand-marquee">
        <div className="marquee-track">
          {[...brandLogos, ...brandLogos].map((src, i) => (
            <div className="marquee-item" key={`${src}-${i}`}>
              <img src={src} alt="brand" />
            </div>
          ))}
        </div>
      </section>

      
      <section className="catalogues-cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Explore Our Catalogues</h2>
            <p>
              Discover the complete product range from each of our brands. 
              Browse through our digital catalogues to find inspiration and detailed product information.
            </p>
            <Link to="/catalogues" className="cta-button">
              <span>View All Catalogues</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      
      <section className="brands-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Brands</h2>
            <p>Design-led collections across home, kitchen, gifts and wellbeing</p>
          </div>
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand.id} className="brand-card" style={{ ['--brand-color' as any]: brand.color }}>
                <div className="brand-media" style={{ backgroundImage: `url(${brand.image})` }} />
                <div className="brand-info">
                  <h3>{brand.name}</h3>
                  <p>{brand.description}</p>
                  <div className="brand-actions">
                    <button className="btn-secondary" onClick={() => setSelectedBrand(brand)}>View</button>
                    <a className="btn-link" href={brand.website} target="_blank" rel="noreferrer">Website →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Recent Events</h2>
            <p>3 Counties Autumn Show — highlights from our stand</p>
          </div>

          <div className="events-split">
            <div className="event-card glass">
              <div className="event-logo">
                <img src={dynamicEventLogo || '/images/events/three-counties-autumn-2025/logo.png'} alt="3 Counties Autumn" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="event-meta">
                <h3>3 Counties Autumn Show</h3>
                <p>Great Malvern • 2025</p>
                <ul>
                  <li>Showcasing our autumn/winter ranges</li>
                  <li>Live demos and product highlights</li>
                  <li>Thank you to everyone who visited</li>
                </ul>
              </div>
            </div>
            <div className="event-stack">
              <PhotoStack images={dynamicEventImages || pastEventImages} />
            </div>
          </div>

          <div className="events-note">Have more photos? Drop them into <code>public/images/events/three-counties-autumn-2025</code> using 01.jpg, 02.jpg, …</div>
        </div>
      </section>

      
      <AnimatePresence>
        {selectedBrand && (
          <BrandModal
            brand={selectedBrand}
            onClose={() => setSelectedBrand(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
