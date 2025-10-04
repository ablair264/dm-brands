import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import { useAuth } from '../contexts/AuthContext';
import './ImageBankAuthPage.css';

const ImageBankAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/image-bank');
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signup(
        userData.email,
        userData.password,
        `${userData.firstName} ${userData.lastName}`,
        userData.company
      );
      
      if (result.success) {
        if (result.needsApproval) {
          // New customer pending approval
          setSuccess('Account created successfully! 🎉\n\nYour account is now pending approval by our team. You will receive email confirmation once an administrator approves your request and grants access to the image bank.\n\nThis typically takes 1-2 business days.');
        } else {
          // Existing customer auto-approved
          setSuccess('Welcome back! 🎉\n\nYour account has been activated and you now have access to the DM Brands Image Bank.\n\nRedirecting you to the image bank...');
          
          // Auto-login the approved user
          setTimeout(async () => {
            try {
              await login(userData.email, userData.password);
              navigate('/image-bank');
            } catch (error) {
              console.error('Auto-login failed:', error);
              setError('Account created but auto-login failed. Please try signing in manually.');
            }
          }, 2000);
        }
      } else {
        setError('Email already exists or signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-bank-auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-hero">
            <div className="hero-content">
              <h1>DM Brands Image Bank</h1>
              <p>Access high-quality product images from our brand portfolio</p>
              <div className="hero-features">
                <div className="feature">
                  <span className="feature-icon">📸</span>
                  <span>High-resolution images</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔍</span>
                  <span>Advanced search & filtering</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⬇️</span>
                  <span>Instant downloads</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🆓</span>
                  <span>Free access for customers</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="auth-forms">
            {isLogin ? (
              <LoginForm
                onSubmit={handleLogin}
                onSwitchToSignup={() => setIsLogin(false)}
                loading={loading}
                error={error}
              />
            ) : (
              <SignupForm
                onSubmit={handleSignup}
                onSwitchToLogin={() => setIsLogin(true)}
                loading={loading}
                error={error}
                success={success}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageBankAuthPage;