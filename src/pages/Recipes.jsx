import { useState, useEffect } from 'react';
import { getUserIngredients, fetchRecipes } from '../js/services/recipe-api.js';
import './Recipes.css';

export default function Recipes() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsLoaded, setIngredientsLoaded] = useState(false);

  // Load user's scanned ingredients on component mount
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const userIngredients = await getUserIngredients();
        setIngredients(userIngredients);
        setIngredientsLoaded(true);
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setIngredientsLoaded(true);
      }
    };
    loadIngredients();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setRecipes(null);

    try {
      // Get fresh ingredients list
      let ingredientsList = await getUserIngredients();
      
      if (!ingredientsList || ingredientsList.length === 0) {
        setError('No scanned ingredients found. Please scan some products first using the Scanner page, then try again.');
        setLoading(false);
        return;
      }

      // Update ingredients state
      setIngredients(ingredientsList);

      // Fetch recipes from API
      const fetchedRecipes = await fetchRecipes(ingredientsList, 10);
      
      if (!fetchedRecipes || fetchedRecipes.length === 0) {
        setRecipes([]);
        setError('No recipes found for your ingredients. Try scanning more products to get better recipe suggestions!');
      } else {
        setRecipes(fetchedRecipes);
      }
    } catch (e) {
      console.error('Recipe generation error:', e);
      setError(e.message || 'Failed to generate recipes. Please try again later.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipes-page">
      <div className="recipes-container">
        <div className="recipes-header">
          <h1>Recipe Generator</h1>
          <p className="recipes-subtitle">
            Get personalized recipe suggestions based on products you've scanned
          </p>
        </div>

        {/* Show user's available ingredients */}
        {ingredientsLoaded && ingredients.length > 0 && (
          <div className="recipes-ingredients-preview">
            <h3>Your Scanned Ingredients ({ingredients.length})</h3>
            <div className="ingredients-list">
              {ingredients.slice(0, 10).map((ingredient, idx) => (
                <span key={idx} className="ingredient-tag">
                  {ingredient}
                </span>
              ))}
              {ingredients.length > 10 && (
                <span className="ingredient-tag">+{ingredients.length - 10} more</span>
              )}
            </div>
          </div>
        )}

        {ingredientsLoaded && ingredients.length === 0 && (
          <div className="recipes-no-ingredients">
            <div className="empty-icon">📦</div>
            <h3>No Scanned Ingredients Yet</h3>
            <p>Scan some products using the Scanner page to build your ingredient list, then come back here to get recipe suggestions!</p>
          </div>
        )}

        <div className="recipes-actions">
          <button
            className="btn-generate"
            type="button"
            onClick={handleGenerate}
            disabled={loading || !ingredientsLoaded || ingredients.length === 0}
          >
            {loading ? 'Generating Recipes...' : 'Generate Recipes'}
          </button>
          {!ingredientsLoaded && (
            <p className="loading-text">Loading your ingredients...</p>
          )}
        </div>

        {error && (
          <div className="recipes-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="recipes-loading">
            <div className="loading-spinner"></div>
            <p>Finding the perfect recipes for you...</p>
            <p className="loading-hint">This may take a few seconds</p>
          </div>
        )}

        {recipes && recipes.length === 0 && !loading && !error && (
          <div className="recipes-empty">
            <div className="empty-icon">🍳</div>
            <h2>No recipes found</h2>
            <p>We couldn't find recipes matching your ingredients. Try scanning more products to get better suggestions!</p>
          </div>
        )}

        {recipes && recipes.length > 0 && (
          <div className="recipes-list">
            <h2 className="recipes-found-title">
              Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} for You
            </h2>
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-item">
                {recipe.image && (
                  <div className="recipe-image">
                    <img src={recipe.image} alt={recipe.title} loading="lazy" />
                  </div>
                )}
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <div className="recipe-meta">
                    <span className="recipe-badge">
                      ✅ Uses {recipe.usedIngredientCount} of your ingredients
                    </span>
                    {recipe.missedIngredientCount > 0 && (
                      <span className="recipe-badge recipe-badge-missed">
                        ⚠️ Needs {recipe.missedIngredientCount} more ingredient{recipe.missedIngredientCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {recipe.likes > 0 && (
                      <span className="recipe-badge recipe-badge-likes">
                        ❤️ {recipe.likes} likes
                      </span>
                    )}
                  </div>
                  {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                    <div className="recipe-ingredients">
                      <strong>Your ingredients used:</strong>
                      <div className="recipe-ingredients-list">
                        {recipe.usedIngredients.map((ing, idx) => (
                          <span key={idx} className="recipe-ingredient-item">
                            {ing.name || ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.recipeUrl && (
                    <a
                      href={recipe.recipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="recipe-link"
                    >
                      View Full Recipe →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
