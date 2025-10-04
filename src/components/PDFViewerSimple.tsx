import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import './PDFViewer.css';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, onClose }) => {
  return (
    <div className="pdf-viewer-modal">
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <h2>{title}</h2>
          <div className="pdf-viewer-actions">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-action-button"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <a
              href={pdfUrl}
              download
              className="pdf-action-button"
              title="Download PDF"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="pdf-action-button"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="pdf-viewer-content">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            title={title}
            className="pdf-iframe"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;