import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'customer';
  allowedRoles?: Array<'admin' | 'customer'>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireRole, allowedRoles }) => {
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
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = (isAdmin && allowedRoles.includes('admin')) || (role === 'customer' && allowedRoles.includes('customer'));
    if (!isAllowed) return <Navigate to="/login" state={{ from: location }} replace />;
  } else if (requireRole) {
    if (requireRole === 'admin' && !isAdmin) return <Navigate to="/login" state={{ from: location }} replace />;
    if (requireRole === 'customer' && role !== 'customer') return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
