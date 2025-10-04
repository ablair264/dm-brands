import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'customer';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireRole }) => {
  const { user, isAdmin, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Role-based checks
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireRole === 'admin' && !isAdmin) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireRole === 'customer' && role !== 'customer') return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

export default PrivateRoute;
