import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration
 * Preferred methods to provide config (in order):
 * 1. Add a small script tag before the app that sets `window.__FIREBASE_CONFIG__` (recommended for local testing):
 *    <script>
 *      window.__FIREBASE_CONFIG__ = {
 *        apiKey: '...', authDomain: '...', projectId: '...', storageBucket: '...', messagingSenderId: '...', appId: '...'
 *      };
 *    </script>
 * 2. During build, inject `process.env.FIREBASE_*` variables (CI / build tooling).
 * If neither is present, the placeholders below will be used and Firebase will be considered not configured.
 */
let firebaseConfig = null;

if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
  // Allow developers to drop a script with `window.__FIREBASE_CONFIG__` for quick local setup
  firebaseConfig = window.__FIREBASE_CONFIG__;
} else {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyB3pqOLSVYd34ZuxYrgQ1WbA4aQ87UvlyI',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'barcode-scanner-cs465.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'barcode-scanner-cs465',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'barcode-scanner-cs465.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1016848066280',
    appId: process.env.FIREBASE_APP_ID || '1:1016848066280:web:99eabe356f4acbc452cb5d',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-5SN0SF9MGE'
  };
}

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
         firebaseConfig.projectId &&
         firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
         firebaseConfig.projectId !== 'YOUR_PROJECT_ID';
};

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;

/**
 * Initialize Firebase at runtime. This is safe to call multiple times.
 * If a config object is provided it will be used, otherwise the module-level
 * `firebaseConfig` (or `window.__FIREBASE_CONFIG__`) will be used.
 *
 * @param {object|null} configOverride
 * @returns {{ error: Error|null }}
 */
function _initializeFirebase(configOverride = null) {
  if (configOverride) {
    firebaseConfig = configOverride;
  }

  if (!isFirebaseConfigured()) {
    return { error: new Error('Firebase not configured') };
  }

  if (app && auth && db) {
    return { error: null };
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Set auth persistence to LOCAL (survives browser restarts)
    // This ensures users stay logged in across sessions
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn('Could not set auth persistence:', err);
    });

    return { error: null };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { error };
  }
}

/**
 * Public initializer to allow runtime configuration (e.g. paste config in UI).
 */
export function initFirebaseRuntime(configOverride = null) {
  return _initializeFirebase(configOverride);
}

/**
 * Get the auth instance, initializing Firebase if needed
 */
export function getAuthInstance() {
  if (!auth && isFirebaseConfigured()) {
    _initializeFirebase();
  }
  return auth;
}

/**
 * Get the Firestore instance, initializing Firebase if needed
 */
export function getDbInstance() {
  if (!db && isFirebaseConfigured()) {
    _initializeFirebase();
  }
  return db;
}

// Auto-initialize Firebase if configured
if (isFirebaseConfigured()) {
  _initializeFirebase();
  console.log('Firebase initialized automatically');
}

export { app, auth, db, isFirebaseConfigured };

