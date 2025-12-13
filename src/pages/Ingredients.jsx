import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import './Ingredients.css';

export default function Ingredients() {
  const { user, getIdToken } = useAuth();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          setItems([]);
          setLoading(false);
          return;
        }
        const res = await fetch('/user/ingredients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (mounted) setItems(json.items || []);
      } catch (e) {
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [user, getIdToken]);

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
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && items && items.length === 0 && (
          <div className="ingredients-empty">
            <div className="empty-icon">📦</div>
            <h2>No scanned items yet</h2>
            <p>Start scanning barcodes to see your ingredients here!</p>
          </div>
        )}

        {!loading && items && items.length > 0 && (
          <div className="ingredients-list">
            {items.map((it, i) => (
              <div key={it.id || i} className="ingredient-item">
                <div className="ingredient-content">
                  <h3 className="ingredient-title">{it.title || 'Unknown Item'}</h3>
                  {it.addedAt && (
                    <p className="ingredient-date">
                      Scanned: {new Date(it.addedAt).toLocaleString()}
                    </p>
                  )}
                  {it.brand && <p className="ingredient-brand">Brand: {it.brand}</p>}
                  {it.description && <p className="ingredient-description">{it.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
