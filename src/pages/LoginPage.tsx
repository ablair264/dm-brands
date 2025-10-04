import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginAny, user, isAdmin, role } = useAuth();

  // Derive redirect dynamically after successful login

  useEffect(() => {
    // If already logged in, redirect based on role
    if (user) {
      if (isAdmin) navigate('/admin', { replace: true });
      else if (role === 'customer') navigate('/image-bank', { replace: true });
    }
  }, [user, isAdmin, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAny(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      } else {
        // Route by role
        if (result.role === 'admin') navigate('/admin', { replace: true });
        else navigate('/image-bank', { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-overlay" />
        <div className="floating-accent" />
      </div>

      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">
              <Lock size={32} />
            </div>
            <h1>Sign In</h1>
            <p>Sign in to access DM Brands tools and the Image Bank</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner small" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <button 
              onClick={() => navigate('/')}
              className="back-link"
            >
              ← Back to website
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="back-link"
            >
              Create a customer account →
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
