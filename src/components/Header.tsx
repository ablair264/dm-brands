// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  // const { user, isAdmin } = useAuth();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
    { path: '/catalogues', label: 'Catalogues' },
    // Always link to image bank; unauthenticated users will be redirected to login
    { path: '/image-bank', label: 'Image Bank' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo on the left */}
        <div className="header-logo">
          <Link to="/">
            <img 
              src="/images/dmb-logo.png" 
              alt="DM Brands Ltd" 
              className="logo-image"
            />
          </Link>
        </div>

        {/* Navigation in the middle */}
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User icon on the right */}
        <div className="header-actions">
          <Link to="/admin" className="user-icon" title="Admin">
            <User size={24} />
          </Link>
          
          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
