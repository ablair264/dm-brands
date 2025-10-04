import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import './PDFViewer.css';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, onClose }) => {
  // Try to use the advanced PDF viewer if available, otherwise fallback to iframe
  const [useAdvancedViewer, setUseAdvancedViewer] = React.useState(false);
  const [pdfComponents, setPdfComponents] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Check if advanced PDF viewer packages are installed
    try {
      const coreModule = require('@react-pdf-viewer/core');
      const defaultLayoutModule = require('@react-pdf-viewer/default-layout');
      require('@react-pdf-viewer/core/lib/styles/index.css');
      require('@react-pdf-viewer/default-layout/lib/styles/index.css');
      
      setPdfComponents({
        Worker: coreModule.Worker,
        Viewer: coreModule.Viewer,
        SpecialZoomLevel: coreModule.SpecialZoomLevel,
        defaultLayoutPlugin: defaultLayoutModule.defaultLayoutPlugin
      });
      setUseAdvancedViewer(true);
    } catch {
      setUseAdvancedViewer(false);
      setPdfComponents(null);
    }
  }, []);

  if (useAdvancedViewer && pdfComponents) {
    try {
      const { Worker, Viewer, SpecialZoomLevel, defaultLayoutPlugin } = pdfComponents;
      
      const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs: any[]) => [
          defaultTabs[0], // Thumbnails
          defaultTabs[1], // Bookmarks
        ],
      });

      return (
        <div className="pdf-viewer-modal">
          <div className="pdf-viewer-container">
            <div className="pdf-viewer-header">
              <h2>{title}</h2>
              <div className="pdf-viewer-actions">
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
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                <Viewer
                  fileUrl={pdfUrl}
                  plugins={[defaultLayoutPluginInstance]}
                  defaultScale={SpecialZoomLevel.PageWidth}
                />
              </Worker>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.log('Advanced PDF viewer not available, using fallback');
      setUseAdvancedViewer(false);
    }
  }

  // Fallback to iframe viewer
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
              border: 'none',
              backgroundColor: '#525252'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;