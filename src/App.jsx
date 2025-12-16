import React, { useEffect, useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { AuthProvider, useAuth } from './contexts/AuthProvider.jsx';
import { getTheme, toggleTheme } from './js/services/theme.js';

// Page Imports
import LandingPage from './pages/LandingPage.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import HomePage from './HomePage.jsx';
import Scanner from './pages/Scanner.jsx';
import Ingredients from './pages/Ingredients.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Faq from './pages/Faq.jsx';
import Recipes from './pages/Recipes.jsx';
import Account from './pages/Account.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';

// Style Imports
import './css/main.css';

// Register custom web components
import './js/components/bs-auth.js';

/**
 * Loading spinner shown while auth state is being determined
 */
function AuthLoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--food-green) 0%, var(--food-mint) 100%)',
        color: 'white'
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <div style={{ fontSize: '1rem', marginTop: '1rem', opacity: 0.9 }}>Loading...</div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Layout component for authenticated users with navigation
 */
function AppLayout() {
  const { logout, setLastPage, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(getTheme());

  // Track current page for "continue where you left off" feature
  useEffect(() => {
    if (location.pathname.startsWith('/app/') && user) {
      setLastPage(location.pathname);
    }
  }, [location.pathname, setLastPage, user]);

  // Update theme state when it changes
  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(getTheme());
    };

    // Listen for storage changes (if theme is changed in another tab)
    window.addEventListener('storage', handleThemeChange);

    // Check theme periodically (in case changed programmatically)
    const interval = setInterval(handleThemeChange, 1000);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async e => {
    e.preventDefault();
    e.stopPropagation();

    await logout();
    navigate('/', { replace: true });
  };

  const handleThemeToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  return (
    <div>
      <header className="navigation">
        <nav>
          <div className="nav-brand">
            <img 
              src="/assets/logo.svg" 
              alt="Sifts Logo" 
              style={{ width: '32px', height: '32px', marginRight: '0.5rem', borderRadius: '4px' }}
            />
            <span style={{ fontWeight: 700, color: 'white' }}>Sifts</span>
          </div>
          <div className="nav-links">
            <Link to="/app/home">Home</Link>
            <Link to="/app/scanner">Scanner</Link>
            <Link to="/app/ingredients">Ingredients</Link>
            <Link to="/app/recipes">Recipes</Link>
            <button
              type="button"
              onClick={handleThemeToggle}
              className="theme-toggle-button"
              aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              {currentTheme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

/**
 * Protected route wrapper - requires authentication
 * Shows loading spinner while auth state is being determined
 * Redirects to login if not authenticated
 *
 * Auth state logic:
 * - If loading is true OR authState is 'loading': show spinner
 * - Check React state first (user or authState === 'authenticated')
 * - Fallback: check Firebase auth directly (in case React state hasn't updated yet)
 * - Otherwise: redirect to login
 */
function ProtectedRoutes() {
  const { user, loading, authState } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Check Firebase auth directly as a fallback (in case React state hasn't updated)
  useEffect(() => {
    try {
      const auth = getAuth();
      if (auth) {
        const currentUser = auth.currentUser;
        setFirebaseUser(currentUser);
      }
    } catch (e) {
      // Firebase not initialized or error
      setFirebaseUser(null);
    }
  }, [user, authState]); // Re-check when React state changes

  // Show loading while auth state is being determined
  if (loading || authState === 'loading') {
    return <AuthLoadingSpinner />;
  }

  // Check if user is authenticated (React state OR Firebase direct check)
  const isAuthenticated = user || authState === 'authenticated' || firebaseUser;

  // Only redirect if we're sure the user is not authenticated
  if (!loading && !isAuthenticated && authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // If authenticated (by any means), allow access
  if (isAuthenticated) {
    return <AppLayout />;
  }

  // Fallback: if we're not loading but don't have clear auth state, redirect to login
  return <Navigate to="/login" replace />;
}

/**
 * Public route wrapper - for landing, login, signup pages
 * Redirects authenticated users to the app
 *
 * Auth state logic:
 * - If loading: show spinner
 * - If authenticated (user exists OR authState is 'authenticated' OR Firebase has user): redirect to app
 * - Otherwise: show public content
 */
function PublicRoute({ children, redirectAuthenticated = true }) {
  const { user, loading, authState } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Check Firebase auth directly as a fallback (in case React state hasn't updated yet)
  // This is critical for immediate redirects after login
  useEffect(() => {
    let unsubscribe = null;
    
    try {
      const auth = getAuth();
      if (auth) {
        // Check current user immediately
        const currentUser = auth.currentUser;
        if (currentUser) {
          setFirebaseUser(currentUser);
        }
        
        // Listen for auth state changes to catch immediate updates
        // This fires immediately with current user, then on every change
        unsubscribe = auth.onAuthStateChanged(newUser => {
          console.log('PublicRoute: Firebase auth state changed', newUser ? newUser.uid : 'null');
          setFirebaseUser(newUser);
        });
      }
    } catch (e) {
      // Firebase not initialized or error
      setFirebaseUser(null);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Only run once on mount - the listener will catch all changes

  // Show loading while auth state is being determined
  if (loading || authState === 'loading') {
    return <AuthLoadingSpinner />;
  }

  // Redirect authenticated users to app home
  // Check React state AND Firebase directly to catch immediate auth changes
  const isAuthenticated = user || authState === 'authenticated' || firebaseUser;
  
  if (redirectAuthenticated && isAuthenticated) {
    // Use Navigate component for React Router navigation
    // This will work with HashRouter
    return <Navigate to="/app/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes - Redirect to home if already logged in */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Info pages - accessible to everyone, no redirect */}
          <Route
            path="/about"
            element={
              <PublicRoute redirectAuthenticated={false}>
                <About />
              </PublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicRoute redirectAuthenticated={false}>
                <Contact />
              </PublicRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicRoute redirectAuthenticated={false}>
                <Faq />
              </PublicRoute>
            }
          />

          {/* Protected Routes - require authentication */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/app/home" element={<HomePage />} />
            <Route path="/app/scanner" element={<Scanner />} />
            <Route path="/app/ingredients" element={<Ingredients />} />
            <Route path="/app/recipes" element={<Recipes />} />
            <Route path="/app/account" element={<Account />} />
            <Route path="/app/history" element={<History />} />
            <Route path="/app/settings" element={<Settings />} />
          </Route>

          {/* Fallback: Redirect unknown paths to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
