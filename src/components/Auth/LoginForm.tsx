import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import './AuthForms.css';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSwitchToSignup,
  loading = false,
  error = null
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      setFormError('Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access your image bank</p>
      </div>

      {(error || formError) && (
        <div className="auth-error">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="auth-submit-button"
          disabled={loading}
        >
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button 
            type="button"
            className="auth-switch-button"
            onClick={onSwitchToSignup}
            disabled={loading}
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;