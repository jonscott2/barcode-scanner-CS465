import { onAuthChange, logOut, signUpWithEmail, signInWithEmail } from './firebase-auth.js';

// This is a placeholder for your actual UI update functions
import { updateUserUI, showAuthError, hideAuthDialog } from './ui.js';

// --- Page & State Management ---

const PAGES = {
  LOADER: 'app-loader',
  LANDING: 'landing-page', // Public page with login/signup
  APP: 'app-container' // Protected main application
};

/**
 * Manages page visibility to create a single-page application (SPA) feel.
 * Hides all main pages and shows only the one specified.
 * @param {string} pageId - The ID of the page container to show.
 */
function showPage(pageId) {
  // Ensure your main content divs have these IDs in your HTML
  Object.values(PAGES).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
    }
  });

  const pageToShow = document.getElementById(pageId);
  if (pageToShow) {
    // Use 'block' or 'flex' depending on your layout needs
    pageToShow.style.display = 'block';
  }
}

// --- Error Handling ---

/**
 * Translates Firebase error codes into user-friendly messages.
 * @param {string} errorCode - The error code from Firebase Auth.
 * @returns {string}
 */
function getFriendlyAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    default:
      console.error('Unhandled auth error:', errorCode); // Log for debugging
      return 'An unexpected error occurred. Please try again.';
  }
}

// --- Session Inactivity Timer ---

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_TIMEOUT_MS = 9 * 60 * 1000; // 9 minutes

let sessionTimer = null;
let warningTimer = null;

/** Resets the inactivity timer on user activity. */
function resetSessionTimer() {
  clearTimeout(sessionTimer);
  clearTimeout(warningTimer);

  warningTimer = setTimeout(() => {
    // You can replace this with a more elegant modal/toast notification
    alert('You will be logged out in 1 minute due to inactivity.');
  }, WARNING_TIMEOUT_MS);

  sessionTimer = setTimeout(() => {
    console.log('User inactive for 10 minutes. Logging out.');
    alert('Session expired. You have been logged out.');
    logOut();
  }, INACTIVITY_TIMEOUT_MS);
}

/** Starts listening for user activity to manage the session timer. */
function startSessionTracking() {
  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
  activityEvents.forEach(event => {
    window.addEventListener(event, resetSessionTimer);
  });
  resetSessionTimer(); // Start the timer immediately
}

/** Stops the session timer and removes activity listeners. */
function stopSessionTracking() {
  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
  activityEvents.forEach(event => {
    window.removeEventListener(event, resetSessionTimer);
  });
  clearTimeout(sessionTimer);
  clearTimeout(warningTimer);
}
/**
 * A helper function to handle form submissions for authentication.
 * It manages button state, calls the appropriate auth function, and handles errors.
 * @param {HTMLFormElement} form - The form being submitted.
 * @param {function(string, string): Promise<{user: any, error: string|null}>} authFunction - The async auth function to call.
 * @param {string} inProgressText - The text to display on the button during submission.
 */
async function handleAuthFormSubmit(form, authFunction, inProgressText) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : 'Submit';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = inProgressText;
  }

  try {
    const email = form.email.value;
    const password = form.password.value;
    const { error } = await authFunction(email, password);

    if (error) {
      showAuthError(getFriendlyAuthErrorMessage(error));
    } else {
      hideAuthDialog(); // Success! onAuthChange will handle the UI update.
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}
// --- Event Listener Setup ---

/**
 * Sets up event listeners for login, logout, and sign-up forms.
 */
function bindAuthEventListeners() {
  // --- Assume these elements exist in your HTML ---
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logOut();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      await handleAuthFormSubmit(loginForm, signInWithEmail, 'Signing In...');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      await handleAuthFormSubmit(signupForm, signUpWithEmail, 'Creating Account...');
    });
  }
}

// --- Core Application Logic ---

/**
 * Handles changes in the authentication state. This is the single source of truth
 * for the user's session status.
 * @param {import("firebase/auth").User | null} user
 */
function handleAuthStateChange(user) {
  if (user) {
    // --- AUTHENTICATED STATE ---
    console.log('Auth state changed: User is AUTHENTICATED', user.email);
    document.body.classList.add('is-authenticated');
    document.body.classList.remove('is-unauthenticated');

    updateUserUI(user);
    showPage(PAGES.APP); // Show the main application
    startSessionTracking(); // Start tracking inactivity
  } else {
    // --- UNAUTHENTICATED STATE ---
    console.log('Auth state changed: User is UNAUTHENTICATED');
    document.body.classList.add('is-unauthenticated');
    document.body.classList.remove('is-authenticated');

    showPage(PAGES.LANDING); // Show the public landing page
    stopSessionTracking(); // Stop tracking inactivity
  }
}

/**
 * Initializes the application.
 */
function main() {
  // 1. Start in the loading state to prevent UI flicker.
  showPage(PAGES.LOADER);

  // 2. Bind all UI event listeners for login, signup, etc.
  bindAuthEventListeners();

  // 3. Listen for auth state changes. This is the core of the app's
  //    routing and state management. It will automatically show the
  //    correct page (Landing or App) once Firebase initializes.
  onAuthChange(handleAuthStateChange);
}

// --- App Entry Point ---
document.addEventListener('DOMContentLoaded', main);
