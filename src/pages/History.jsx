import { useState, useEffect, useRef } from 'react';
import '../css/main.css';
import './History.css';

// Import custom web components
import '@georapbox/modal-element/dist/modal-element-defined.js';
import '../js/components/bs-history.js';

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const historyElementRef = useRef(null);

  useEffect(() => {
    // Listen for custom event to filter history
    const handleSearch = e => {
      if (historyElementRef.current) {
        const historyList = historyElementRef.current.shadowRoot?.querySelector('#historyList');
        if (historyList) {
          const items = historyList.querySelectorAll('li');
          items.forEach(item => {
            const text = item.textContent?.toLowerCase() || '';
            const matches = !searchQuery || text.includes(searchQuery.toLowerCase());
            item.style.display = matches ? '' : 'none';
          });
        }
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1>Scan History</h1>
          <p>View and manage your barcode scan history</p>
        </div>

        {/* Search Bar */}
        <div className="history-search-container">
          <div className="history-search-wrapper">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="search-icon"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            <input
              type="text"
              className="history-search-input"
              placeholder="Search by product name or barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="history-content">
          <bs-history ref={historyElementRef} />
        </div>
      </div>
    </div>
  );
}
