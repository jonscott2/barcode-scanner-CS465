/**
 * Theme Management Service
 * Handles dark/light mode switching and persistence
 */

const THEME_STORAGE_KEY = 'barcode-scanner/theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Get current theme from storage or system preference
 * @returns {string} 'light' or 'dark'
 */
export function getTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }

  // Fallback to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light';
}

/**
 * Set theme and persist to storage
 * @param {string} theme - 'light', 'dark', or 'auto'
 */
export function setTheme(theme) {
  if (theme === 'auto') {
    // Remove stored preference to use system preference
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove theme preference:', e);
    }
    // Apply system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isDark ? 'dark' : 'light');
    } else {
      applyTheme('light');
    }
    return;
  }

  if (theme !== 'light' && theme !== 'dark') {
    console.warn('Invalid theme:', theme);
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }

  applyTheme(theme);
}

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }
}

/**
 * Toggle between light and dark theme
 * @returns {string} The new theme
 */
export function toggleTheme() {
  const current = getTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 * Should be called early in app initialization
 */
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);

  // Listen for system theme changes (if no manual preference set)
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = e => {
      // Only auto-switch if user hasn't manually set a preference
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        // localStorage not available, just apply system preference
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }
}

