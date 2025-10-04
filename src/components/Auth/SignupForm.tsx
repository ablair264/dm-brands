import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import './AuthForms.css';

interface SignupFormProps {
  onSubmit: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  loading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.company) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company
      });
    } catch (err) {
      setFormError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Create Your Account</h2>
        <p>Join DM Brands Image Bank - Free Access</p>
      </div>

      {success && (
        <div className="auth-success">
          {success.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {(error || formError) && !success && (
        <div className="auth-error">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First name"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last name"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="company">Company</label>
          <div className="input-with-icon">
            <Building size={18} className="input-icon" />
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create a password"
              required
              autoComplete="new-password"
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p className="terms-text">
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
        <p>
          Already have an account?{' '}
          <button 
            type="button"
            className="auth-switch-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;