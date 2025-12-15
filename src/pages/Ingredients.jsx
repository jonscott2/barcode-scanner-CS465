import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { Link } from 'react-router-dom';
import { getUserScans } from '../js/services/firebase-scans.js';
import './Ingredients.css';

export default function Ingredients() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedIngredientNames, setSelectedIngredientNames] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Use getUserScans directly instead of server endpoint
        const { error: fetchError, scans } = await getUserScans(200);

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to load ingredients');
        }

        // Transform scans to match expected format
        const transformedItems = scans.map(scan => ({
          id: scan.id,
          title: scan.title || scan.value || 'Unknown Item',
          brand: scan.brand || '',
          description: scan.description || '',
          value: scan.value,
          addedAt: scan.scannedAt
            ? scan.scannedAt instanceof Date
              ? scan.scannedAt.toISOString()
              : new Date(scan.scannedAt).toISOString()
            : new Date().toISOString()
        }));

        if (mounted) setItems(transformedItems);
      } catch (e) {
        console.error('Error loading ingredients:', e);
        if (mounted) {
          setError(e.message || 'Failed to load ingredients. Please try again.');
          setItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [user]);

  return (
    <div className="ingredients-page">
      <div className="ingredients-container">
        <div className="ingredients-header">
          <h1>Scanned Ingredients</h1>
          <p>View and manage all your scanned grocery items</p>
        </div>

        {!user && (
          <div className="ingredients-empty">
            <p>Please sign in to view your scanned items.</p>
          </div>
        )}

        {loading && (
          <div className="ingredients-loading">
            <div className="loading-spinner"></div>
            <p>Loading your ingredients...</p>
          </div>
        )}

        {error && (
          <div className="ingredients-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>
              <p>
                <strong>Oops! Something went wrong</strong>
              </p>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="ingredients-error-retry">
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && items && items.length === 0 && (
          <div className="ingredients-empty">
            <div className="empty-icon">📦</div>
            <h2>No scanned items yet</h2>
            <p>Start scanning barcodes to see your ingredients here!</p>
          </div>
        )}

        {/* Search Bar */}
        {!loading && items && items.length > 0 && (
          <div className="ingredients-search-container">
            <div className="ingredients-search-wrapper">
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
                className="ingredients-search-input"
                placeholder="Search by name, brand, or description..."
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
        )}

        {/* Selected Items Action Bar */}
        {selectedItems.size > 0 && (
          <div className="ingredients-selected-bar">
            <span className="selected-count">
              {selectedItems.size} ingredient{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <Link
              to="/app/recipes"
              state={{ selectedIngredients: selectedIngredientNames }}
              className="btn-generate-recipes"
            >
              Generate Recipes with Selected
            </Link>
            <button
              className="btn-clear-selection"
              onClick={() => {
                setSelectedItems(new Set());
                setSelectedIngredientNames([]);
              }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {!loading && items && items.length > 0 && (
          <div className="ingredients-list">
            {items
              .filter(it => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                const title = (it.title || '').toLowerCase();
                const brand = (it.brand || '').toLowerCase();
                const description = (it.description || '').toLowerCase();
                return (
                  title.includes(query) || brand.includes(query) || description.includes(query)
                );
              })
              .map((it, i) => {
                const itemId = it.id || i;
                const isSelected = selectedItems.has(itemId);
                const ingredientName = it.title || it.value || 'Unknown Item';
                return (
                  <div
                    key={itemId}
                    className={`ingredient-item ${isSelected ? 'ingredient-item-selected' : ''}`}
                    onClick={() => {
                      const newSelected = new Set(selectedItems);
                      const newNames = [...selectedIngredientNames];

                      if (isSelected) {
                        newSelected.delete(itemId);
                        const nameIndex = newNames.indexOf(ingredientName);
                        if (nameIndex > -1) newNames.splice(nameIndex, 1);
                      } else {
                        newSelected.add(itemId);
                        if (!newNames.includes(ingredientName)) {
                          newNames.push(ingredientName);
                        }
                      }

                      setSelectedItems(newSelected);
                      setSelectedIngredientNames(newNames);
                    }}
                  >
                    <div className="ingredient-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newSelected = new Set(selectedItems);
                          const newNames = [...selectedIngredientNames];

                          if (isSelected) {
                            newSelected.delete(itemId);
                            const nameIndex = newNames.indexOf(ingredientName);
                            if (nameIndex > -1) newNames.splice(nameIndex, 1);
                          } else {
                            newSelected.add(itemId);
                            if (!newNames.includes(ingredientName)) {
                              newNames.push(ingredientName);
                            }
                          }

                          setSelectedItems(newSelected);
                          setSelectedIngredientNames(newNames);
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="ingredient-content">
                      <h3 className="ingredient-title">{it.title || 'Unknown Item'}</h3>
                      {it.addedAt && (
                        <p className="ingredient-date">{new Date(it.addedAt).toLocaleString()}</p>
                      )}
                      {it.brand && <p className="ingredient-brand">{it.brand}</p>}
                      {it.description && <p className="ingredient-description">{it.description}</p>}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
