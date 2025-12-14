import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { app } from './firebase-config.js';

const auth = getAuth(app);

/**
 * Listens for authentication state changes and calls the provided callback.
 * This is the central piece for managing user sessions.
 * @param {function(User|null): void} callback
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Signs the current user out.
 */
export async function logOut() {
  try {
    await signOut(auth);
    console.log('User signed out successfully.');
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

/**
 * Creates a new user account with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: import("firebase/auth").User|null, error: string|null}>}
 */
export async function signUpWithEmail(email, password) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Account created successfully:', user);
    return { user, error: null };
  } catch (error) {
    console.error('Error creating account:', error.code);
    return { user: null, error: error.code };
  }
}

/**
 * Signs in a user with their email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: import("firebase/auth").User|null, error: string|null}>}
 */
export async function signInWithEmail(email, password) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in with email:', user.uid);
    return { user, error: null };
  } catch (error) {
    console.error('Email sign-in failed:', error.code);
    return { user: null, error: error.code };
  }
}
