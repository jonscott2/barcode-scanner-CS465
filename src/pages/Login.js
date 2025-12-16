import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { getAuth } from 'firebase/auth';
import './Login.css';

export default function Login() {
  const { signInWithEmail, user, authState } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Validate email format
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: '', password: '', general: '' });

    // Validate inputs
    let hasError = false;
    const newErrors = { email: '', password: '', general: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', email.trim());
      const result = await signInWithEmail(email.trim(), password);
      console.log('Login result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        // Handle specific Firebase errors with user-friendly messages
        const errorCode = result.error.code || '';
        if (
          errorCode.includes('user-not-found') ||
          errorCode.includes('wrong-password') ||
          errorCode.includes('invalid-credential')
        ) {
          setErrors({ ...newErrors, general: 'Invalid email or password. Please try again.' });
        } else if (errorCode.includes('too-many-requests')) {
          setErrors({ ...newErrors, general: 'Too many failed attempts. Please try again later.' });
        } else if (errorCode.includes('network')) {
          setErrors({ ...newErrors, general: 'Network error. Please check your connection.' });
        } else {
          setErrors({
            ...newErrors,
            general: result.error.message || 'Failed to sign in. Please try again.'
          });
        }
        setLoading(false);
      } else if (result?.user) {
        console.log('Login successful, user:', result.user);
        // Mark login as successful FIRST - before any navigation
        setLoginSuccess(true);
        setSuccess(true);
        setLoading(false);
        
        // CRITICAL: Use window.location.hash for HashRouter - this is the most reliable method
        // React Router navigate() may not work immediately with HashRouter after auth state change
        console.log('Navigating to home after successful login using window.location.hash');
        
        // Immediate navigation using HashRouter's native method
        window.location.hash = '#/app/home';
        
        // Also try React Router navigation as backup
        navigate('/app/home', { replace: true });
        
        // Final backup - force navigation after short delay if still on login page
        setTimeout(() => {
          const currentPath = window.location.hash.replace('#', '') || window.location.pathname;
          if (currentPath === '/login' || currentPath === '/') {
            console.log('Backup: Force navigation to home');
            window.location.hash = '#/app/home';
          }
        }, 200);
      } else {
        console.warn('Login result has no error but no user either:', result);
        setErrors({ ...newErrors, general: 'An unexpected error occurred. Please try again.' });
        setLoading(false);
      }
    } catch (err) {
      setErrors({ ...newErrors, general: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  // Handle social login placeholders
  const handleGoogleLogin = () => {
    setErrors({
      email: '',
      password: '',
      general: 'Google login coming soon! Please use email for now.'
    });
  };

  const handleGitHubLogin = () => {
    setErrors({
      email: '',
      password: '',
      general: 'GitHub login coming soon! Please use email for now.'
    });
  };

  // Clear field-specific error when user starts typing
  const handleEmailChange = e => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  // Track if user intentionally navigated to login page (not from auto-redirect)
  const mountedRef = useRef(false);
  const intentionalNavigationRef = useRef(true);

  // Set flag on mount to track if this is an intentional navigation
  // Also clear form state to prevent autofill from triggering unwanted behavior
  useEffect(() => {
    // Don't clear state if login was just successful - let navigation happen
    if (loginSuccess) {
      return; // Don't interfere with successful login flow
    }
    
    // Clear form state on mount to prevent autofill issues
    setEmail('');
    setPassword('');
    setErrors({ email: '', password: '', general: '' });
    setLoading(false);
    setSuccess(false);
    
    // Check if user came from navigation (not page reload)
    const navigationType = window.performance?.getEntriesByType?.('navigation')?.[0]?.type;
    const isPageReload = navigationType === 'reload' || navigationType === 'back_forward';
    
    // If it's a page reload, don't auto-redirect immediately
    // Give user a chance to see the login page and enter credentials manually
    if (isPageReload) {
      intentionalNavigationRef.current = false;
      // Reset after a delay to allow intentional navigation check
      // This prevents immediate redirect on page reload
      setTimeout(() => {
        intentionalNavigationRef.current = true;
      }, 1500);
    }
    
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Navigate to home when auth state becomes authenticated after successful login
  // This is a backup in case the immediate navigation in handleSubmit didn't work
  useEffect(() => {
    if (loginSuccess && (user || authState === 'authenticated')) {
      console.log('Auth state updated after login, ensuring navigation to HomePage...');
      // Check current location - use window.location for HashRouter
      const currentPath = window.location.hash.replace('#', '') || window.location.pathname;
      if (currentPath !== '/app/home' && currentPath !== '/login') {
        // Only navigate if we're still on login page
        navigate('/app/home', { replace: true });
      }
    }
  }, [loginSuccess, user, authState, navigate]);

  // Also handle case where user is already authenticated (e.g., from another tab)
  // BUT only redirect if it's an intentional navigation, not a page reload with autofill
  useEffect(() => {
    // Don't redirect if:
    // 1. User just successfully logged in (handled by first useEffect)
    // 2. Component just mounted from a page reload (give user time to see login page)
    // 3. User hasn't intentionally navigated here
    if (loginSuccess) {
      return; // Already handled by first useEffect
    }

    if (user || authState === 'authenticated') {
      // Only redirect if:
      // - User intentionally navigated to login page (not a reload)
      // - OR enough time has passed since mount (user had chance to see page)
      if (intentionalNavigationRef.current && mountedRef.current) {
        console.log('User already authenticated, redirecting to home...');
        navigate('/app/home', { replace: true });
      } else {
        // User is authenticated but this might be from a page reload
        // Wait a bit before redirecting to give user a chance
        const timer = setTimeout(() => {
          if (mountedRef.current && (user || authState === 'authenticated') && !loginSuccess) {
            console.log('Delayed redirect for authenticated user after page reload');
            navigate('/app/home', { replace: true });
          }
        }, 2000); // 2 second delay to allow user to see login page
        return () => clearTimeout(timer);
      }
    }
  }, [user, authState, navigate, loginSuccess]);

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left Side - Login Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <Link to="/" className="auth-back-link">
                ← Back to Home
              </Link>
              <h1>Welcome back</h1>
              <p>Sign in to continue</p>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="auth-form" 
              noValidate
              autoComplete="off"
              onKeyDown={(e) => {
                // Prevent form submission on Enter if form is not ready
                if (e.key === 'Enter' && (loading || !email.trim() || !password)) {
                  e.preventDefault();
                }
              }}
            >
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Enter your email"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <span id="email-error" className="field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    data-lpignore="true"
                    data-form-type="other"
                    placeholder="Enter your password"
                    disabled={loading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <span id="password-error" className="field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              {errors.general && (
                <div className="error-message" role="alert">
                  {errors.general}
                </div>
              )}

              {success && (
                <div className="success-message" role="status">
                  Login successful! Redirecting...
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading || success}>
                {loading ? 'Signing in...' : success ? 'Success!' : 'Sign In'}
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
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
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
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Background Image */}
        <div className="auth-image-section">
          <div className="auth-image-content">
            <h2 className="auth-image-title">Smart Food Tracking</h2>
            <p className="auth-image-subtitle">Reduce waste, save money, eat smarter</p>
            <div className="auth-image-features">
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">📷</div>
                <div className="auth-image-feature-text">Scan barcodes instantly</div>
              </div>
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">⏰</div>
                <div className="auth-image-feature-text">Track expiration dates</div>
              </div>
              <div className="auth-image-feature">
                <div className="auth-image-feature-icon">🍳</div>
                <div className="auth-image-feature-text">Discover recipes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
