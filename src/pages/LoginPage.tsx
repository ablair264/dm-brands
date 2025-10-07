import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAny, login, signup, user, isAdmin, role } = useAuth();

  // Derive redirect dynamically after successful login

  useEffect(() => {
    // If already logged in, redirect based on role
    if (user) {
      if (isAdmin) navigate('/admin', { replace: true });
      else if (role === 'customer') navigate('/image-bank', { replace: true });
    }
  }, [user, isAdmin, role, navigate]);

  // Default to signup view if path is /signup
  useEffect(() => {
    if (location.pathname.toLowerCase().includes('signup')) {
      setIsLogin(false);
    }
  }, [location.pathname]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await loginAny(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      } else {
        if (result.role === 'admin') navigate('/admin', { replace: true });
        else navigate('/image-bank', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
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
          setSuccess('Account created successfully! 🎉\n\nYour account is now pending approval by our team. You will receive email confirmation once approved.');
        } else {
          setSuccess('Welcome! 🎉 Your account is active. Redirecting...');
          setTimeout(async () => {
            try {
              await login(userData.email, userData.password);
              navigate('/image-bank');
            } catch (err) {
              setError('Account created but auto-login failed. Please sign in.');
              setIsLogin(true);
            }
          }, 1500);
        }
      } else {
        setError('Email already exists or signup failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
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
            <div className="login-logo"><Lock size={32} /></div>
            <h1>{isLogin ? 'Sign In' : 'Create Account'}</h1>
            <p>Access DM Brands tools and the Image Bank</p>
            <div className="auth-toggle">
              <button className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }} disabled={loading}>Sign In</button>
              <button className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }} disabled={loading}>Sign Up</button>
            </div>
          </div>

          <div className="login-form">
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

          <div className="login-footer">
            <button onClick={() => navigate('/')} className="back-link">← Back to website</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
