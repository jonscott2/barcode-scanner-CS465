import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthProvider.jsx';
import { getUserScans } from './js/services/firebase-scans.js';
import './css/main.css';

// Import custom web components (no longer needed for modals, but keeping for potential future use)

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Statistics and recent scans state
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    thisWeekScans: 0,
    productsFound: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statsExpanded, setStatsExpanded] = useState(true); // Default to expanded
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredScans, setFilteredScans] = useState([]);
  const actionsMenuRef = useRef(null);

  // Function to load statistics and recent scans
  const loadStats = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoadingStats(true);
    }
    setError(null);
    
    try {
      const { error: fetchError, scans } = await getUserScans(50);
      if (fetchError) {
        setError('Failed to load statistics');
        return;
      }
      
      if (scans) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const totalScans = scans.length;
        const todayScans = scans.filter(s => {
          const scanDate = s.scannedAt instanceof Date ? s.scannedAt : new Date(s.scannedAt);
          return scanDate >= todayStart;
        }).length;
        const thisWeekScans = scans.filter(s => {
          const scanDate = s.scannedAt instanceof Date ? s.scannedAt : new Date(s.scannedAt);
          return scanDate >= weekStart;
        }).length;
        const productsFound = scans.filter(s => s.title || s.brand).length;

        setStats({
          totalScans,
          todayScans,
          thisWeekScans,
          productsFound
        });

        // Get recent scans (last 5)
        const recent = scans.slice(0, 5);
        setRecentScans(recent);
        setFilteredScans(recent);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Error loading statistics');
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, []);

  // Load statistics on mount and when user changes
  useEffect(() => {
    loadStats();
  }, [user, loadStats]);

  // Listen for scan completion events to auto-refresh stats
  useEffect(() => {
    const handleScanComplete = () => {
      // Refresh stats after a short delay to allow scan to be saved
      setTimeout(() => {
        loadStats(true);
      }, 500);
    };

    // Listen for custom events from the scanning system
    window.addEventListener('bs-scan-complete', handleScanComplete);
    window.addEventListener('bs-history-updated', handleScanComplete);

    return () => {
      window.removeEventListener('bs-scan-complete', handleScanComplete);
      window.removeEventListener('bs-history-updated', handleScanComplete);
    };
  }, [loadStats]);

  // Handle actions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Handle action button clicks
  const handleAuthClick = () => {
    setShowActionsMenu(false);
    navigate('/account');
  };

  const handleHistoryClick = () => {
    setShowActionsMenu(false);
    navigate('/history');
  };

  const handleSettingsClick = () => {
    setShowActionsMenu(false);
    navigate('/settings');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // 'S' key to scan
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        navigate('/scanner');
      }

      // 'Esc' key to close actions menu
      if (event.key === 'Escape') {
        setShowActionsMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredScans(recentScans);
      return;
    }

    const filtered = recentScans.filter(scan => {
      const query = searchQuery.toLowerCase();
      const title = (scan.title || '').toLowerCase();
      const brand = (scan.brand || '').toLowerCase();
      const barcode = (scan.barcodeValue || '').toLowerCase();
      return title.includes(query) || brand.includes(query) || barcode.includes(query);
    });
    setFilteredScans(filtered);
  }, [searchQuery, recentScans]);

  // Calculate additional stats
  const averageScansPerDay = stats.totalScans > 0 && stats.thisWeekScans > 0 
    ? (stats.thisWeekScans / 7).toFixed(1) 
    : '0';

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const scanDate = date instanceof Date ? date : new Date(date);
    const diffMs = now - scanDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return scanDate.toLocaleDateString();
  };

  return (
    <div className="dashboard-page">
      {/* Actions Menu Button - Top Right */}
      <div className="dashboard-actions-container" ref={actionsMenuRef}>
        <button 
          className="actions-menu-btn"
          onClick={() => setShowActionsMenu(!showActionsMenu)}
          aria-label="Actions menu"
        >
          <svg width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
        </button>
        
        {showActionsMenu && (
          <div className="actions-menu-dropdown">
            <button id="homeAuthBtn" className="action-menu-item" onClick={handleAuthClick}>
              <svg width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
              </svg>
              <span>Account</span>
            </button>
            <button id="homeHistoryBtn" className="action-menu-item" onClick={handleHistoryClick}>
              <svg width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
              </svg>
              <span>History</span>
            </button>
            <button id="homeSettingsBtn" className="action-menu-item" onClick={handleSettingsClick}>
              <svg width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Scan Button */}
      <Link to="/scanner" className="floating-scan-btn" aria-label="Quick scan">
        <svg width="2em" height="2em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
        </svg>
        <span className="floating-scan-hint">Press S</span>
      </Link>

      {/* Keyboard Shortcut Hint */}
      <div className="keyboard-hint">
        <kbd>S</kbd> to scan • <kbd>Esc</kbd> to cancel
      </div>

      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Dashboard</h1>
          <p>Track your scanning activity and view your history</p>
        </div>
        <Link to="/scanner" className="btn-primary">
          <svg width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
          </svg>
          Start Scanning
        </Link>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-section">
        <div className="stats-dashboard-header">
          <h2>Your Statistics</h2>
          <div className="stats-header-actions">
            <button 
              className="refresh-stats-btn" 
              onClick={() => loadStats(true)}
              disabled={refreshing || loadingStats}
              aria-label="Refresh statistics"
            >
              <svg 
                width="1.25em" 
                height="1.25em" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                className={refreshing ? 'spinning' : ''}
              >
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="toggle-stats-btn"
              onClick={() => setStatsExpanded(!statsExpanded)}
              aria-label={statsExpanded ? 'Collapse statistics' : 'Expand statistics'}
            >
              <svg 
                width="1.25em" 
                height="1.25em" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                className={statsExpanded ? 'rotated' : ''}
              >
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        </div>

        {loadingStats && !refreshing && (
          <div className="stats-loading">
            <p>Loading statistics...</p>
          </div>
        )}

        {error && (
          <div className="stats-error">
            <p>{error}</p>
            <button onClick={() => loadStats()}>Try Again</button>
          </div>
        )}

        {!loadingStats && !error && (
          <div className={`stats-dashboard ${statsExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="2em" height="2em" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalScans}</div>
                <div className="stat-label">Total Scans</div>
                <div className="stat-context">All time</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="2em" height="2em" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.todayScans}</div>
                <div className="stat-label">Today</div>
                <div className="stat-context">Scans today</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="2em" height="2em" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                  <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                  <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.thisWeekScans}</div>
                <div className="stat-label">This Week</div>
                <div className="stat-context">Scans this week</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="2em" height="2em" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.productsFound}</div>
                <div className="stat-label">Products Found</div>
                <div className="stat-context">With product info</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Integrated with Statistics */}
        <div className="quick-actions">
          <Link to="/scanner" className="quick-action-btn">
            <svg width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
            </svg>
            Scan Now
          </Link>
          <Link to="/ingredients" className="quick-action-btn">
            <svg width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935" />
            </svg>
            Ingredients
          </Link>
          <Link to="/recipes" className="quick-action-btn">
            <svg width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm-1.646 1.646a.5.5 0 0 1 .708 0l.914.915a.5.5 0 0 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM8 12a4 4 0 0 0-4 4 .5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5 4 4 0 0 0-4-4z" />
            </svg>
            Recipes
          </Link>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="insights-section">
        <h2>Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <div className="insight-value">{averageScansPerDay}</div>
              <div className="insight-label">Avg scans/day this week</div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <div className="insight-value">
                {stats.totalScans > 0 ? Math.round((stats.productsFound / stats.totalScans) * 100) : 0}%
              </div>
              <div className="insight-label">Success rate</div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🔥</div>
            <div className="insight-content">
              <div className="insight-value">{stats.todayScans > 0 ? 'Active' : 'Start scanning!'}</div>
              <div className="insight-label">Today's status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="recent-scans">
        <div className="recent-scans-header">
          <h2>Recent Scans</h2>
          <div className="recent-scans-actions">
            <div className="search-box">
              <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '0.5rem' }}>
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <Link to="/scanner" className="view-all-btn">
              View All
              <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
              </svg>
            </Link>
          </div>
        </div>

        {loadingStats ? (
          <div className="recent-scans-loading">
            <p>Loading recent scans...</p>
          </div>
        ) : recentScans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="4em" height="4em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No scans yet</h3>
            <p className="empty-state-message">Start scanning barcodes to see your history here</p>
            <Link to="/scanner" className="btn-empty-state">
              <svg width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
              </svg>
              Scan Now
            </Link>
          </div>
        ) : filteredScans.length === 0 && searchQuery ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="4em" height="4em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No results found</h3>
            <p className="empty-state-message">Try a different search term</p>
          </div>
        ) : (
          <div className="recent-scans-list">
            {filteredScans.map((scan, index) => (
              <div key={scan.id || index} className="recent-scan-item">
                <div className="recent-scan-icon">
                  <svg width="1.5em" height="1.5em" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
                  </svg>
                </div>
                <div className="recent-scan-content">
                  <div className="recent-scan-title">{scan.title || scan.barcodeValue || 'Unknown Product'}</div>
                  <div className="recent-scan-meta">
                    {scan.brand && <span className="recent-scan-brand">{scan.brand}</span>}
                    <span className="recent-scan-time">{formatTimeAgo(scan.scannedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
