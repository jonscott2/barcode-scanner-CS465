import React from 'react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import '../css/main.css';
import './Account.css';

// Import custom web components
import '../js/components/bs-auth.js';

export default function Account() {
  const { user } = useAuth();

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1>Account</h1>
          <p>Manage your account settings and profile</p>
        </div>

        <div className="account-content">
          <div className="account-section">
            <h2>Account Information</h2>
            <div className="account-info-card">
              {user ? (
                <>
                  <div className="info-row">
                    <span className="info-label">User ID:</span>
                    <span className="info-value">{user.uid}</span>
                  </div>
                  {user.email && (
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                  )}
                  {user.displayName && (
                    <div className="info-row">
                      <span className="info-label">Display Name:</span>
                      <span className="info-value">{user.displayName}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Account Type:</span>
                    <span className="info-value">
                      {user.isAnonymous ? 'Guest Account' : 'Registered Account'}
                    </span>
                  </div>
                </>
              ) : (
                <p>No user information available</p>
              )}
            </div>
          </div>

          <div className="account-section">
            <h2>Authentication</h2>
            <div className="account-auth-card">
              <bs-auth />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

