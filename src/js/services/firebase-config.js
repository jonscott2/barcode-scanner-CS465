import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * Firebase configuration
 * Firebase config for barcode-scanner-cs465 project
 * For Firebase JS SDK v7.20.0 and later, measurementId is optional
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyB3pqOLSVYd34ZuxYrgQ1WbA4aQ87UvlyI',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'barcode-scanner-cs465.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'barcode-scanner-cs465',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'barcode-scanner-cs465.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1016848066280',
  appId: process.env.FIREBASE_APP_ID || '1:1016848066280:web:99eabe356f4acbc452cb5d',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-5SN0SF9MGE'
};

// Try to get from window object (for runtime override)
if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
  Object.assign(firebaseConfig, window.__FIREBASE_CONFIG__);
}

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const hasApiKey =
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 0 &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY';
  const hasProjectId =
    firebaseConfig.projectId &&
    firebaseConfig.projectId.length > 0 &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

  return hasApiKey && hasProjectId;
};

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;
let analytics = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Analytics if supported (only in browser environment)
    if (typeof window !== 'undefined') {
      isSupported()
        .then(supported => {
          if (supported) {
            analytics = getAnalytics(app);
          }
        })
        .catch(() => {
          // Analytics not supported or failed to initialize
        });
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

/**
 * Initialize Firebase from runtime configuration
 * This function checks for window.__FIREBASE_CONFIG__ and reinitializes Firebase if needed
 */
const initFirebaseRuntime = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // If Firebase is already initialized, don't reinitialize
  if (app) {
    return;
  }

  // Check for runtime config override
  if (window.__FIREBASE_CONFIG__) {
    Object.assign(firebaseConfig, window.__FIREBASE_CONFIG__);
    
    // Re-check if Firebase should be configured
    if (isFirebaseConfigured()) {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Initialize Analytics if supported
        if (typeof window !== 'undefined') {
          isSupported()
            .then(supported => {
              if (supported) {
                analytics = getAnalytics(app);
              }
            })
            .catch(() => {
              // Analytics not supported or failed to initialize
            });
        }
      } catch (error) {
        console.error('Error initializing Firebase from runtime config:', error);
      }
    }
  }
};

export { app, auth, db, analytics, isFirebaseConfigured, initFirebaseRuntime };
