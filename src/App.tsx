// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import CataloguesPage from './pages/CataloguesPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import ImageBankAuthPage from './pages/ImageBankAuthPage';
import CustomerImageBank from './pages/CustomerImageBank';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Login route without header */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Image Bank Auth route without header */}
            <Route path="/image-bank-auth" element={<ImageBankAuthPage />} />
            
            {/* Protected Image Bank route without header */}
            <Route path="/image-bank" element={<CustomerImageBank />} />
            
            {/* Admin route with authentication */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            
            {/* Public routes with header */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/catalogues" element={<CataloguesPage />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;