import React, { useState } from 'react';
import './Recipes.css';

export default function Recipes() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setRecipes(null);

    try {
      // Placeholder for recipe generation
      // This will be implemented when the recipe API is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecipes([]);
      setError('Recipe generation feature coming soon!');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipes-page">
      <div className="recipes-container">
        <div className="recipes-header">
          <h1>Recipe Generator</h1>
          <p>Get recipe suggestions based on your scanned ingredients</p>
        </div>

        <div className="recipes-actions">
          <button
            className="btn-generate"
            type="button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Recipes'}
          </button>
        </div>

        {error && (
          <div className="recipes-error">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="recipes-loading">
            <div className="loading-spinner"></div>
            <p>Finding the perfect recipes for you...</p>
          </div>
        )}

        {recipes && recipes.length === 0 && !loading && !error && (
          <div className="recipes-empty">
            <div className="empty-icon">🍳</div>
            <h2>No recipes yet</h2>
            <p>Click "Generate Recipes" to get recipe suggestions based on your scanned ingredients!</p>
          </div>
        )}

        {recipes && recipes.length > 0 && (
          <div className="recipes-list">
            {recipes.map((recipe, i) => (
              <div key={i} className="recipe-item">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
