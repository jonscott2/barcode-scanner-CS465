/**
 * Sentry Configuration
 * 
 * To get your DSN:
 * 1. Go to your Sentry project dashboard
 * 2. Click Settings (gear icon) → Client Keys (DSN)
 * 3. Copy your DSN and replace the placeholder below
 */

export const SENTRY_DSN = process.env.SENTRY_DSN || 
  'https://03ec3495eaeeefb169f7068ddd270e85@o4510541249118208.ingest.us.sentry.io/4510541260324864';

export const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';

export const SENTRY_CONFIG = {
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  
  // Enable error monitoring
  integrations: [],
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  
  // Setting this option to true will send default PII data to Sentry
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  
  // Enable session replay (optional - can be enabled later)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Filter out browser extension errors
  beforeSend(event) {
    // Filter out common browser extension errors
    if (
      event.exception &&
      event.exception.values &&
      event.exception.values[0] &&
      event.exception.values[0].value &&
      (event.exception.values[0].value.includes('message channel closed') ||
        event.exception.values[0].value.includes('Extension context invalidated') ||
        event.exception.values[0].value.includes('asynchronous response'))
    ) {
      return null; // Don't send this error to Sentry
    }
    
    return event;
  },
  
  // Ignore specific errors (optional)
  ignoreErrors: [
    // Browser extensions
    'Extension context invalidated',
    'message channel closed',
    'asynchronous response',
    // Network errors that are common
    'NetworkError',
    'Failed to fetch',
    // Add more as needed
  ],
};

