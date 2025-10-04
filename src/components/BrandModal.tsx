// src/components/BrandModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BrandModal.css';

interface BrandModalProps {
  brand: {
    id: string;
    name: string;
    description: string;
    website: string;
    color: string;
  };
  onClose: () => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ brand, onClose }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: brand.color }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header" style={{ background: `linear-gradient(135deg, ${brand.color}22 0%, transparent 100%)` }}>
          <h2 className="modal-title">{brand.name}</h2>
        </div>

        <div className="modal-body">
          <p className="modal-description">{brand.description}</p>

          <div className="modal-actions">
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link website-link"
              style={{ backgroundColor: brand.color }}
            >
              <ExternalLink size={18} />
              <span>Visit Website</span>
            </a>

            <Link
              to="/catalogues"
              className="modal-link catalogue-link"
            >
              <Book size={18} />
              <span>View Catalogues</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BrandModal;
