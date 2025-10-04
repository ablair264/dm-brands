# DM Brands Website

Premium lifestyle brands distributor website built with React and TypeScript.

## Features

- 🎨 Interactive brand showcase with accordion navigation
- 📚 Digital catalogue library with integrated PDF viewer
- 📅 Event management system for trade shows
- 💾 Supabase integration for dynamic content management
- 📄 Modern PDF viewer with zoom, download, and navigation
- 🔐 Admin dashboard for content management
- 📱 Fully responsive design

## Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase (optional but recommended):
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── admin/          # Admin dashboard components
├── components/     # Reusable components
│   ├── Header/     # Navigation header
│   ├── BrandModal/ # Brand detail modal
│   └── PDFViewer/  # PDF viewing component
├── lib/            # Supabase configuration
├── pages/          # Page components
├── services/       # Database services
└── styles/         # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Pages

- **Home** - Brand showcase with interactive accordion
- **Events** - Trade show and exhibition listings
- **About** - Company information and contact details
- **Catalogues** - Digital catalogue downloads with PDF viewer
- **Admin** - Content management dashboard

## Database Features

When connected to Supabase, the website supports:
- Dynamic event management
- PDF catalogue uploads and storage
- Brand information management
- Real-time content updates

## PDF Viewer

The integrated PDF viewer provides:
- Full-screen viewing
- Page navigation and thumbnails
- Zoom controls
- Direct download option
- Mobile-responsive design

## Technologies Used

- React 18
- TypeScript
- Supabase (Backend as a Service)
- @react-pdf-viewer (PDF rendering)
- Framer Motion (Animations)
- Lucide React (Icons)

## Contact

DM Brands Limited  
79 Waterworks Road  
Worcester WR1 3EZ  
Tel: 01905 616 006  
Email: sales@dmbrands.co.uk
