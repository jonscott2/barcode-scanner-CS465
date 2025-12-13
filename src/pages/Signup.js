import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import './Login.css';

export default function Signup() {
  const { user, createAccount, signInAnonymous } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result = await createAccount(email, password, displayName);
      if (result && result.error) {
        setError(result.error.message || 'Failed to create account. Please try again.');
        setLoading(false);
      } else if (result && !result.error) {
        // Successful account creation - navigate to dashboard immediately
        // The useEffect will also handle redirect when user state updates
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 300);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInAnonymous();
      if (result && !result.error) {
        // Successful guest login - navigate to dashboard immediately
        // The useEffect will also handle redirect when user state updates
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 300);
      } else {
        setError('Failed to continue as guest. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login
    console.log('Google login clicked');
  };

  const handleGitHubLogin = () => {
    // Placeholder for GitHub login
    console.log('GitHub login clicked');
  };

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left Side - Signup Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join us to start tracking your groceries</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="displayName">Display Name (optional)</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength="6"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button
                type="button"
                className="btn btn-social btn-google"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="btn btn-social btn-github"
                onClick={handleGitHubLogin}
                disabled={loading}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="#24292e">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
              <button
                type="button"
                className="btn btn-guest"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Background Image */}
        <div className="auth-image-section">
          <div className="auth-image-content">
            <h2 className="auth-image-title">Join Thousands of Users</h2>
            <p className="auth-image-subtitle">Start your food waste reduction journey</p>
            <div className="auth-image-features">
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">💰</div>
                <div className="auth-image-feature-text">Save money on groceries</div>
              </div>
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">🌱</div>
                <div className="auth-image-feature-text">Help the environment</div>
              </div>
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">☁️</div>
                <div className="auth-image-feature-text">Cloud sync across devices</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

