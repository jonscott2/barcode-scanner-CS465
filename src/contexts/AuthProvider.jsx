import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import {
  initAuth,
  onAuthStateChange,
  signInWithEmail,
  createAccount
} from '../js/services/firebase-auth.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  authState: 'loading', // 'loading' | 'authenticated' | 'unauthenticated'
  getIdToken: async () => null,
  signInWithEmail: async () => ({ error: null }),
  createAccount: async () => ({ error: null }),
  logout: async () => {},
  setLastPage: () => {},
  getLastPage: () => '/app/home'
});

// Constants
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIME = 9 * 60 * 1000; // 9 minutes (1 min before logout)
const SESSION_TIMESTAMP_KEY = 'barcode-scanner/sessionTimestamp';
const LAST_ACTIVITY_KEY = 'barcode-scanner/lastActivity';
const LAST_PAGE_KEY = 'barcode-scanner/lastPage';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const authInitialized = useRef(false);
  const activityListenersAdded = useRef(false);

  // Show inactivity warning
  const showWarning = useCallback(() => {
    // Remove existing warnings first
    document.querySelectorAll('[data-inactivity-warning]').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.setAttribute('data-inactivity-warning', 'true');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fff3cd 0%, #ffc107 100%);
      color: #856404;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-weight: 600;
      max-width: 350px;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="margin-bottom: 0.5rem;">Session Timeout Warning</div>
      <div style="font-weight: normal; font-size: 0.9rem;">You'll be signed out in 1 minute due to inactivity. Move your mouse or click to stay signed in.</div>
    `;
    document.body.appendChild(notification);
  }, []);

  // Handle logout due to inactivity
  const handleInactivityLogout = useCallback(async () => {
    // Remove warnings
    document.querySelectorAll('[data-inactivity-warning]').forEach(n => n.remove());

    try {
      const auth = getAuth();
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      // Ignore Firebase errors during logout
    }

    // Clear all state
    setUser(null);
    setAuthState('unauthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    // Show logout message
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2d5016 0%, #4a702c 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-weight: 600;
      max-width: 350px;
    `;
    notification.textContent = 'Session expired due to inactivity. Please sign in again.';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Remove existing warnings
    document.querySelectorAll('[data-inactivity-warning]').forEach(n => n.remove());

    // Only set timers if user is authenticated
    if (user) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

      // Warning at 8 minutes
      warningTimeoutRef.current = setTimeout(showWarning, WARNING_TIME);

      // Logout at 10 minutes
      timeoutRef.current = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT);
    }
  }, [user, showWarning, handleInactivityLogout]);

  // Set up activity listeners (only once when user logs in)
  useEffect(() => {
    if (!user) {
      // Clear timers when logged out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      activityListenersAdded.current = false;
      return;
    }

    // Don't add listeners multiple times
    if (activityListenersAdded.current) return;
    activityListenersAdded.current = true;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => resetInactivityTimer();

    // Add listeners
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    // Start initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      activityListenersAdded.current = false;
    };
  }, [user, resetInactivityTimer]);

  // Initialize auth - runs ONCE
  useEffect(() => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const initialUser = await initAuth();

        if (!mounted) return;

        // Check for session expiry
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity && initialUser) {
          const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
          if (timeSinceActivity > INACTIVITY_TIMEOUT) {
            // Session expired - sign out
            try {
              const auth = getAuth();
              if (auth) await signOut(auth);
            } catch (e) {}

            localStorage.removeItem(SESSION_TIMESTAMP_KEY);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            localStorage.removeItem('user');

            setUser(null);
            setAuthState('unauthenticated');
            setLoading(false);
            return;
          }
        }

        if (initialUser) {
          setUser(initialUser);
          setAuthState('authenticated');
          // Initialize session timestamps
          const now = Date.now();
          localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
        } else {
          setUser(null);
          setAuthState('unauthenticated');
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setAuthState('unauthenticated');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(async (newUser) => {
      if (!mounted) return;

      if (newUser) {
        setUser(newUser);
        setAuthState('authenticated');
        // Update session timestamps
        const now = Date.now();
        if (!localStorage.getItem(SESSION_TIMESTAMP_KEY)) {
          localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
        }
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      } else {
        setUser(null);
        setAuthState('unauthenticated');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Get ID token for API calls
  const getIdToken = useCallback(async () => {
    if (!user) return null;
    try {
      if (typeof user.getIdToken === 'function') {
        return await user.getIdToken();
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [user]);

  // Logout function
  const logout = useCallback(async () => {
    // Clear timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Remove warnings
    document.querySelectorAll('[data-inactivity-warning]').forEach(n => n.remove());

    try {
      const auth = getAuth();
      if (auth) await signOut(auth);
    } catch (e) {
      // Ignore errors - continue with local cleanup
    }

    // Clear state
    setUser(null);
    setAuthState('unauthenticated');

    // Clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('scans');
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(LAST_PAGE_KEY);
  }, []);

  const value = {
    user,
    loading,
    authState,
    getIdToken,
    logout,
    signInWithEmail,
    createAccount,
    setLastPage: (page) => localStorage.setItem(LAST_PAGE_KEY, page),
    getLastPage: () => localStorage.getItem(LAST_PAGE_KEY) || '/app/home'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
