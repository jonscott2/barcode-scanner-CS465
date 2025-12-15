import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  initFirebaseRuntime,
  getAuthInstance
} from './firebase-config.js';
import { log } from '../utils/log.js';
import { uuid } from '../utils/uuid.js';

const LOCAL_USERS_KEY = 'barcode-scanner/localUsers';
const LOCAL_CURRENT_USER_KEY = 'barcode-scanner/localCurrentUser';

/**
 * Authentication service for Firebase
 * Handles user authentication with anonymous and email/password methods
 */

let currentUser = null;
let authStateListeners = [];

function _notifyAuthListeners(user) {
  authStateListeners.forEach(listener => {
    try {
      listener(user);
    } catch (e) {
      log.error('Error in auth state listener:', e);
    }
  });
}

/**
 * Initialize authentication and set up auth state listener
 * Returns a promise that resolves with the initial user state
 */
export function initAuth() {
  console.log('initAuth: Starting initialization...');

  // First, try to initialize Firebase if configured
  if (isFirebaseConfigured()) {
    console.log('initAuth: Firebase is configured, initializing...');
    const initResult = initFirebaseRuntime();
    if (initResult.error) {
      console.warn('initAuth: Firebase initialization failed:', initResult.error.message);
      log.warn(
        'Firebase initialization failed, falling back to local mode:',
        initResult.error.message
      );
    } else {
      console.log('initAuth: Firebase initialized successfully');
    }
  } else {
    console.log('initAuth: Firebase not configured, using local mode');
  }

  // Get the auth instance (this will initialize Firebase if needed)
  const authInstance = getAuthInstance();
  console.log('initAuth: Auth instance:', authInstance ? 'available' : 'null');

  if (!isFirebaseConfigured() || !authInstance) {
    console.log('initAuth: Firebase not available, using local mode');
    log.warn('Firebase not configured or failed to initialize. Running in local-only mode.');
    // Attempt to load local current user
    try {
      const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
      if (raw) {
        currentUser = JSON.parse(raw);
        console.log('initAuth: Found local user:', currentUser.uid);
      } else {
        currentUser = null;
        console.log('initAuth: No local user found');
      }
    } catch (_e) {
      currentUser = null;
      console.log('initAuth: Error loading local user, using null');
    }

    // Notify listeners asynchronously
    setTimeout(() => {
      authStateListeners.forEach(listener => {
        try {
          listener(currentUser);
        } catch (err) {
          log.error('Error in auth state listener:', err);
        }
      });
    }, 0);

    console.log('initAuth: Resolving with local user:', currentUser ? 'found' : 'null');
    return Promise.resolve(currentUser);
  }

  // Return a promise that resolves with the initial auth state
  // Add timeout to prevent hanging if Firebase doesn't respond
  return new Promise((resolve, reject) => {
    let resolved = false;
    let unsubscribe = null;

    // First, try to get current user synchronously (if available)
    try {
      const currentAuthUser = authInstance.currentUser;
      if (currentAuthUser !== null && currentAuthUser !== undefined) {
        console.log('Firebase auth: Found current user synchronously:', currentAuthUser.uid);
        currentUser = currentAuthUser;
        resolve(currentAuthUser);
        return;
      }
    } catch (e) {
      console.warn('Firebase auth: Error getting current user synchronously:', e);
      // Continue with async listener
    }

    // Timeout after 3 seconds to prevent infinite loading (reduced from 5s for faster UX)
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (unsubscribe) {
          try {
            unsubscribe();
          } catch (e) {
            // Ignore unsubscribe errors
          }
        }
        console.warn('Firebase auth check timed out after 3s, treating as unauthenticated');
        log.warn('Firebase auth check timed out, treating as unauthenticated');
        currentUser = null;
        resolve(null);
      }
    }, 3000);

    try {
      // Use a one-time listener just to get initial state
      console.log('Firebase auth: Setting up onAuthStateChanged listener...');
      unsubscribe = onAuthStateChanged(
        authInstance,
        user => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            currentUser = user;
            // Unsubscribe this one-time listener
            if (unsubscribe) {
              try {
                unsubscribe();
              } catch (e) {
                // Ignore unsubscribe errors
              }
            }
            console.log('Firebase auth initialized, user:', user ? user.uid : 'none');
            log.info('Firebase auth initialized, user:', user ? user.uid : 'none');
            resolve(user);
          }
        },
        error => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            if (unsubscribe) {
              try {
                unsubscribe();
              } catch (e) {
                // Ignore unsubscribe errors
              }
            }
            console.error('Auth state error:', error);
            log.error('Auth state error:', error);
            // Resolve with null instead of rejecting to prevent unhandled promise rejection
            currentUser = null;
            resolve(null);
          }
        }
      );
    } catch (error) {
      // If onAuthStateChanged throws synchronously, catch it
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.error('Error setting up auth state listener:', error);
        log.error('Error setting up auth state listener:', error);
        currentUser = null;
        resolve(null);
      }
    }
  });
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Called when auth state changes with user object or null
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  // Always support auth state listeners; for local-only mode this will use localStorage
  authStateListeners.push(callback);

  // For local-only mode, call immediately with stored user
  if (!isFirebaseConfigured() || !getAuthInstance()) {
    // Call immediately with current user for local mode only
    try {
      if (currentUser !== undefined) {
        callback(currentUser);
      }
    } catch (e) {
      log.error('Auth listener error:', e);
    }
    // Return an unsubscribe that removes the listener
    return () => {
      authStateListeners = authStateListeners.filter(l => l !== callback);
    };
  }

  // For Firebase mode, DO NOT call immediately - let Firebase's onAuthStateChanged
  // be the source of truth to avoid race conditions with persistence
  const authInstance = getAuthInstance();
  const unsubscribe = onAuthStateChanged(authInstance, user => {
    currentUser = user;
    callback(user);
  });

  return () => {
    unsubscribe();
    authStateListeners = authStateListeners.filter(l => l !== callback);
  };
}

/**
 * Sign in anonymously
 * This allows users to start using the app without creating an account
 * @returns {Promise<{error: null|Error, user: object|null}>}
 */
export async function signInAnonymous() {
  const authInstance = getAuthInstance();
  if (!isFirebaseConfigured() || !authInstance) {
    // Local fallback anonymous user
    try {
      const localUser = { uid: `local-${uuid()}`, isAnonymous: true };
      currentUser = localUser;
      try {
        localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(localUser));
      } catch (_e) {
        /* ignore */
      }
      log.info('Signed in anonymously (local):', localUser.uid);
      // Notify listeners about auth change
      _notifyAuthListeners(currentUser);
      return { error: null, user: localUser };
    } catch (err) {
      return { error: err, user: null };
    }
  }

  try {
    const result = await firebaseSignInAnonymously(authInstance);
    currentUser = result.user;
    log.info('Signed in anonymously:', result.user.uid);
    return { error: null, user: result.user };
  } catch (error) {
    log.error('Error signing in anonymously:', error);
    return { error, user: null };
  }
}

/**
 * Create a new account with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} displayName - Optional display name
 * @returns {Promise<{error: null|Error, user: object|null}>}
 */
export async function createAccount(email, password, displayName = '') {
  const authInstance = getAuthInstance();
  if (!isFirebaseConfigured() || !authInstance) {
    console.warn('Firebase not configured or not initialized, using local storage fallback');
    // Local fallback: create a user in localStorage (for development/testing only)
    try {
      if (!email || !password) {
        return {
          error: new Error('Email and password are required for local account'),
          user: null
        };
      }

      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];

      if (users.find(u => u.email === email)) {
        return {
          error: Object.assign(new Error('auth/email-already-in-use'), {
            code: 'auth/email-already-in-use'
          }),
          user: null
        };
      }

      const newUser = { uid: `local-${uuid()}`, email, password, displayName, isAnonymous: false };
      users.push(newUser);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      currentUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        isAnonymous: false
      };
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));
      log.info('Local account created:', currentUser.uid);
      // Notify listeners about new account / sign-in
      _notifyAuthListeners(currentUser);
      return { error: null, user: currentUser };
    } catch (error) {
      log.error('Error creating local account:', error);
      return { error, user: null };
    }
  }

  try {
    console.log('Creating account with Firebase:', { email, displayName });
    const result = await createUserWithEmailAndPassword(authInstance, email, password);

    // Set display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    currentUser = result.user;
    console.log('Firebase account created successfully:', result.user.uid);
    return { error: null, user: result.user };
  } catch (error) {
    console.error('Firebase account creation failed:', error);
    return { error, user: null };
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{error: null|Error, user: object|null}>}
 */
export async function signInWithEmail(email, password) {
  const authInstance = getAuthInstance();
  if (!isFirebaseConfigured() || !authInstance) {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) {
        return {
          error: Object.assign(new Error('auth/user-not-found'), { code: 'auth/user-not-found' }),
          user: null
        };
      }
      currentUser = {
        uid: found.uid,
        email: found.email,
        displayName: found.displayName || '',
        isAnonymous: false
      };
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));
      log.info('Signed in locally:', currentUser.uid);
      // Notify listeners about sign-in
      _notifyAuthListeners(currentUser);
      return { error: null, user: currentUser };
    } catch (error) {
      log.error('Error signing in locally:', error);
      return { error, user: null };
    }
  }

  try {
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    currentUser = result.user;
    log.info('Signed in with email:', result.user.uid);
    return { error: null, user: result.user };
  } catch (error) {
    log.error('Error signing in with email:', error);
    return { error, user: null };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: null|Error}>}
 */
export async function signOut() {
  const authInstance = getAuthInstance();
  if (!isFirebaseConfigured() || !authInstance) {
    // Local sign out
    try {
      currentUser = null;
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
      log.info('Signed out (local)');
      // Notify listeners about sign-out
      _notifyAuthListeners(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  try {
    await firebaseSignOut(authInstance);
    currentUser = null;
    log.info('Signed out');
    return { error: null };
  } catch (error) {
    log.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Get the current user
 * @returns {object|null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Get the current user's ID
 * @returns {string|null}
 */
export function getUserId() {
  return currentUser?.uid || null;
}
