/**
 * Test Sentry Error Tracking Button
 * 
 * Add this component to any page to test that Sentry is working correctly.
 * When clicked, it will throw an error that Sentry will capture.
 * 
 * Usage:
 * import TestSentryButton from './components/TestSentryButton';
 * 
 * Then add <TestSentryButton /> to your JSX
 */

import * as Sentry from '@sentry/react';

export default function TestSentryButton() {
  const handleError = () => {
    try {
      throw new Error('This is your first error! Sentry test error.');
    } catch (error) {
      // Sentry will automatically capture this
      Sentry.captureException(error);
      console.error('Error thrown for Sentry testing:', error);
      alert('Error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  return (
    <button
      onClick={handleError}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        margin: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#c82333';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#dc3545';
      }}
    >
      🧪 Test Sentry Error Tracking
    </button>
  );
}

