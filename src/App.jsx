import { useEffect } from 'react';
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

  // Track current page for "continue where you left off" feature
  useEffect(() => {
    if (location.pathname.startsWith('/app/') && user) {
      setLastPage(location.pathname);
    }
  }, [location.pathname, setLastPage, user]);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await logout();
    navigate('/', { replace: true });
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
            <Link to="/app/home">Home</Link>
            <Link to="/app/scanner">Scanner</Link>
            <Link to="/app/ingredients">Ingredients</Link>
            <Link to="/app/recipes">Recipes</Link>
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
 */
function ProtectedRoutes() {
  const { user, loading, authState } = useAuth();

  // Show loading while auth state is being determined
  if (loading || authState === 'loading') {
    return <AuthLoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user || authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - render the app layout
  return <AppLayout />;
}

/**
 * Public route wrapper - for landing, login, signup pages
 * Redirects authenticated users to the app
 */
function PublicRoute({ children, redirectAuthenticated = true }) {
  const { user, loading, authState } = useAuth();

  // Show loading while auth state is being determined
  if (loading || authState === 'loading') {
    return <AuthLoadingSpinner />;
  }

  // Redirect authenticated users to app home
  if (redirectAuthenticated && user && authState === 'authenticated') {
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
