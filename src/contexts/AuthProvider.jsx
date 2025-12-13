import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import {
  initAuth,
  onAuthStateChange,
  getCurrentUser,
  signInWithEmail,
  createAccount,
  signInAnonymous
} from '../js/services/firebase-auth.js';

const AuthContext = createContext({
  user: null,
  getIdToken: async () => null,
  signInWithEmail: async () => ({ error: null }),
  createAccount: async () => ({ error: null }),
  signInAnonymous: async () => ({ error: null })
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
  const WARNING_TIME = 18 * 60 * 1000; // Show warning 2 minutes before logout (18 minutes)

  // Function to show warning notification
  const showWarning = useCallback(() => {
    if (user) {
      // Create a notification element
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FFC72C 0%, #FFB81C 100%);
        color: #003366;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 700;
        font-size: 1rem;
        max-width: 400px;
        border: 2px solid #003366;
      `;
      notification.setAttribute('data-inactivity-warning', 'true');
      notification.innerHTML = `
        <div style="margin-bottom: 0.5rem; font-size: 1.1rem;">⚠️ Session Timeout Warning</div>
        <div>You will be logged out in 2 minutes due to inactivity.</div>
        <div style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.9;">Move your mouse or click anywhere to stay logged in.</div>
      `;
      document.body.appendChild(notification);

      // Remove notification after 2 minutes or when user becomes active
      setTimeout(
        () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        },
        2 * 60 * 1000
      );
    }
  }, [user]);

  // Function to handle inactivity logout
  const handleInactivity = useCallback(async () => {
    if (user) {
      console.log('User inactive for 20 minutes. Auto-logging out...');
      // Remove warning notification if it exists
      const warningNotifications = document.querySelectorAll('[data-inactivity-warning]');
      warningNotifications.forEach(n => n.remove());

      try {
        await signOut(getAuth());
        setUser(null);
        localStorage.removeItem('user');
        // Show logout notification
        const logoutNotification = document.createElement('div');
        logoutNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #003366 0%, #001f3f 100%);
          color: #FFC72C;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          font-weight: 700;
          font-size: 1rem;
          border: 2px solid #FFC72C;
        `;
        logoutNotification.textContent = 'You have been logged out due to inactivity.';
        document.body.appendChild(logoutNotification);
        setTimeout(() => {
          if (logoutNotification.parentNode) {
            logoutNotification.parentNode.removeChild(logoutNotification);
          }
        }, 5000);
        // Redirect will happen via ProtectedRoutes component
      } catch (error) {
        console.error('Auto-logout failed:', error);
      }
    }
  }, [user]);

  // Function to reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Remove any existing warning notifications
    const warningNotifications = document.querySelectorAll('[data-inactivity-warning]');
    warningNotifications.forEach(n => n.remove());

    // Only set timers if user is logged in
    if (user) {
      // Set warning timer (18 minutes)
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, WARNING_TIME);

      // Set logout timer (20 minutes)
      timeoutRef.current = setTimeout(() => {
        handleInactivity();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, handleInactivity, showWarning, INACTIVITY_TIMEOUT, WARNING_TIME]);

  // Set up activity tracking
  useEffect(() => {
    if (!user) {
      // Clear timer if user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Set initial timer
    resetInactivityTimer();

    // Add event listeners to reset timer on activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    let mounted = true;
    initAuth()
      .then(u => {
        if (mounted) setUser(u || getCurrentUser() || null);
      })
      .catch(() => {
        if (mounted) setUser(getCurrentUser() || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsub = onAuthStateChange(u => {
      setUser(u || null);
      setLoading(false);
    });
    return () => {
      try {
        unsub && unsub();
      } catch (e) {}
      mounted = false;
    };
  }, []);

  async function getIdToken() {
    if (!user) return null;
    try {
      if (typeof user.getIdToken === 'function') return await user.getIdToken();
      return null;
    } catch (e) {
      return null;
    }
  }

  async function logout() {
    try {
      console.log('Starting logout process...');

      // Clear inactivity timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      // Remove any warning notifications
      const warningNotifications = document.querySelectorAll('[data-inactivity-warning]');
      warningNotifications.forEach(n => n.remove());

      // Sign out from Firebase
      const auth = getAuth();
      if (auth) {
        await signOut(auth);
        console.log('Firebase signOut successful');
      } else {
        console.warn('Firebase auth not initialized');
      }

      // Clear user state
      setUser(null);

      // Clear any stored user data
      localStorage.removeItem('user');
      localStorage.removeItem('scans'); // Also clear scan history

      console.log('Logout completed successfully');

      // The onAuthStateChange listener will automatically update the user state.
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if Firebase signOut fails, clear local state
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('scans');
      throw error; // Re-throw so caller can handle it
    }
  }

  const value = {
    user,
    getIdToken,
    loading,
    logout,
    signInWithEmail,
    createAccount,
    signInAnonymous
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
