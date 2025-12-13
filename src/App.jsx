import React, { useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useNavigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider.jsx';

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
 * A layout component for the main application after a user is authenticated.
 * It includes the shared navigation header.
 */
function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log('Logout button clicked');
      await logout();
      console.log('Logout successful, redirecting...');
      // After logout, redirect user to the landing page for security.
      // The ProtectedRoutes component will ensure they can't access protected routes
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, try to redirect
      navigate('/', { replace: true });
    }
  };

  return (
    <div>
      <header className="navigation">
        <nav>
          <div className="nav-brand">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '0.5rem' }}
            >
              <rect width="32" height="32" rx="6" fill="var(--food-green)" />
              <path d="M16 8L20 14H12L16 8Z" fill="var(--food-mint)" />
              <path d="M8 20L12 26H4L8 20Z" fill="var(--food-mint)" />
              <path d="M24 20L28 26H20L24 20Z" fill="var(--food-mint)" />
            </svg>
            <span style={{ fontWeight: 700, color: 'white' }}>SNHU Scanner</span>
          </div>
          <div className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/scanner">Scanner</Link>
            <Link to="/ingredients">Ingredients</Link>
            <Link to="/recipes">Recipes</Link>
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
        {/* The nested route component will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}

/**
 * A component to guard routes that require authentication.
 * It checks the user's auth state and redirects to login if they are not authenticated.
 */
function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while checking auth state
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to the login page
    // This ensures users cannot access protected routes without authentication
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the main app layout which contains the nested routes
  return <AppLayout />;
}

/**
 * Component to protect public routes from logged-in users
 * Redirects logged-in users away from landing/login/signup pages
 * Also checks for expired sessions (10 minutes of inactivity)
 */
function PublicRoute({ children }) {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    // Check for expired session even if Firebase has a user
    const checkExpiredSession = async () => {
      const SESSION_TIMESTAMP_KEY = 'barcode-scanner/sessionTimestamp';
      const LAST_ACTIVITY_KEY = 'barcode-scanner/lastActivity';
      const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      const sessionTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

      // If timestamps exist, check if session expired
      if (lastActivity && sessionTimestamp) {
        const lastActivityTime = parseInt(lastActivity, 10);
        const timeSinceLastActivity = Date.now() - lastActivityTime;

        // If more than 10 minutes of inactivity, clear session
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.log('Session expired on public route. Clearing session...');
          localStorage.removeItem(SESSION_TIMESTAMP_KEY);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          localStorage.removeItem('user');
          // If user exists, logout will be handled by auth state change
        }
      } else if (user) {
        // If user exists but no session timestamps, clear them (session invalid)
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        localStorage.removeItem('user');
        try {
          await logout();
        } catch (error) {
          console.error('Error clearing expired session:', error);
        }
      }
    };

    if (!loading) {
      checkExpiredSession();
    }
  }, [user, loading, logout]);

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        Loading...
      </div>
    );
  }

  // Check session expiry before redirecting
  const SESSION_TIMESTAMP_KEY = 'barcode-scanner/sessionTimestamp';
  const LAST_ACTIVITY_KEY = 'barcode-scanner/lastActivity';
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  const sessionTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

  // If user exists but session has expired, don't redirect (let them see landing page)
  if (user && lastActivity && sessionTimestamp) {
    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    
    // If session is still valid, redirect to home
    if (timeSinceLastActivity <= INACTIVITY_TIMEOUT) {
      return <Navigate to="/home" replace />;
    }
    // Otherwise, session expired - allow access to public routes
  } else if (user && (!lastActivity || !sessionTimestamp)) {
    // User exists but no valid session timestamps - treat as logged out
    return children;
  }

  // If user is logged in with valid session, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
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
          {/* Public routes that don't require login check */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/account" element={<Account />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback: Redirect any unknown paths to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
