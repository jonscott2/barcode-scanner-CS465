import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUserIngredients, fetchRecipes, getRecipeDetails } from '../js/services/recipe-api.js';
import './Recipes.css';

export default function Recipes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsLoaded, setIngredientsLoaded] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredientSelector, setShowIngredientSelector] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState(new Set());
  const [expandedRecipes, setExpandedRecipes] = useState(new Set());
  const [recipeDetails, setRecipeDetails] = useState(new Map());
  const [loadingDetails, setLoadingDetails] = useState(new Set());
  const [shoppingList, setShoppingList] = useState([]);

  const handleGenerateWithIngredients = async ingredientsList => {
    setLoading(true);
    setError(null);
    setRecipes(null);

    try {
      if (!ingredientsList || ingredientsList.length === 0) {
        setError('No ingredients selected. Please select ingredients or scan some products first.');
        setLoading(false);
        return;
      }

      // Fetch recipes from API using the provided ingredients
      const fetchedRecipes = await fetchRecipes(ingredientsList, 10);

      if (!fetchedRecipes || fetchedRecipes.length === 0) {
        setRecipes([]);
        setShoppingList([]);
        setError(
          'No recipes found for your selected ingredients. Try selecting different ingredients or scanning more products!'
        );
      } else {
        setRecipes(fetchedRecipes);

        // Build shopping list from all missing ingredients
        const allMissing = new Set();
        fetchedRecipes.forEach(recipe => {
          if (recipe.missedIngredients) {
            recipe.missedIngredients.forEach(ing => {
              allMissing.add(ing.name || ing);
            });
          }
        });
        setShoppingList(Array.from(allMissing).sort());
      }
    } catch (e) {
      // Only log full error in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Recipe generation error:', e);
      }

      // Provide user-friendly error messages
      let errorMessage = 'Failed to generate recipes. Please try again later.';

      if (e.message) {
        if (
          e.message.includes('API key not configured') ||
          e.message.includes('API configuration') ||
          e.message.includes('Recipe API key not configured') ||
          e.message.includes('UPC_API_KEY2') ||
          e.message.includes('SPOONACULAR_API_KEY')
        ) {
          errorMessage =
            'Recipe API key not configured. To use the recipe feature, you need to set a Spoonacular API key.';
        } else if (e.message.includes('authentication failed')) {
          errorMessage =
            'Recipe API authentication failed. Please configure the Spoonacular API key by setting UPC_API_KEY2 or SPOONACULAR_API_KEY environment variable.';
        } else if (e.message.includes('quota exceeded')) {
          errorMessage = 'Recipe API quota exceeded. Please try again later.';
        } else if (e.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (
          e.message.includes('Failed to fetch') ||
          e.message.includes('ERR_CONNECTION_REFUSED')
        ) {
          errorMessage =
            'Cannot connect to recipe service. Please start the recipe proxy server (npm run start:proxy) or check your network connection.';
        } else {
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    // Use selected ingredients or all ingredients
    const ingredientsToUse = selectedIngredients.length > 0 ? selectedIngredients : ingredients;
    await handleGenerateWithIngredients(ingredientsToUse);
  };

  const toggleIngredient = ingredient => {
    const newSelected = selectedIngredients.includes(ingredient)
      ? selectedIngredients.filter(i => i !== ingredient)
      : [...selectedIngredients, ingredient];
    setSelectedIngredients(newSelected);
  };

  // Filter ingredients based on search query
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRecipeExpansion = async recipeId => {
    const isExpanded = expandedRecipes.has(recipeId);
    const newExpanded = new Set(expandedRecipes);

    if (isExpanded) {
      newExpanded.delete(recipeId);
    } else {
      newExpanded.add(recipeId);

      // Fetch recipe details if not already loaded
      if (!recipeDetails.has(recipeId) && !loadingDetails.has(recipeId)) {
        setLoadingDetails(prev => new Set([...prev, recipeId]));
        try {
          const details = await getRecipeDetails(recipeId);
          if (details) {
            setRecipeDetails(prev => new Map([...prev, [recipeId, details]]));
          }
        } catch (err) {
          console.error('Error loading recipe details:', err);
        } finally {
          setLoadingDetails(prev => {
            const next = new Set(prev);
            next.delete(recipeId);
            return next;
          });
        }
      }
    }

    setExpandedRecipes(newExpanded);
  };

  // Load user's scanned ingredients on component mount
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const userIngredients = await getUserIngredients();
        setIngredients(userIngredients);

        // Check if ingredients were passed from Ingredients page
        if (location.state?.selectedIngredients) {
          setSelectedIngredients(location.state.selectedIngredients);
        } else {
          // Start with empty selection - user must explicitly choose
          setSelectedIngredients([]);
        }

        setIngredientsLoaded(true);
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setIngredientsLoaded(true);
      }
    };
    loadIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <div className="recipes-page">
      <div className="recipes-container">
        <div className="recipes-header">
          <h1>Recipe Generator</h1>
          <p className="recipes-subtitle">
            Get personalized recipe suggestions based on products you've scanned
          </p>
        </div>

        {/* Show user's available ingredients with selection */}
        {ingredientsLoaded && ingredients.length > 0 && (
          <div className="recipes-ingredients-preview">
            <div className="ingredients-preview-header">
              <div className="ingredients-header-content">
                <h3>Select Your Ingredients</h3>
                <p className="ingredients-subtitle">
                  Choose from {ingredients.length} scanned products to generate personalized recipes
                </p>
              </div>
              <button
                className="btn-toggle-selector"
                onClick={() => setShowIngredientSelector(!showIngredientSelector)}
                aria-label={showIngredientSelector ? 'Hide selector' : 'Show selector'}
              >
                {showIngredientSelector ? '▼ Hide' : '▶ Show'} Selection
              </button>
            </div>

            {showIngredientSelector && (
              <div className="ingredients-selector">
                <div className="selector-search-wrapper">
                  <input
                    type="text"
                    className="ingredient-search-input"
                    placeholder="🔍 Search ingredients..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <div className="selection-counter">
                    <span className="counter-number">{selectedIngredients.length}</span>
                    <span className="counter-label">selected</span>
                  </div>
                </div>
                <p className="selector-hint">
                  Click ingredients to select them. Selected ingredients will be used to find
                  matching recipes.
                </p>
                <div className="ingredients-list">
                  {filteredIngredients.length > 0 ? (
                    filteredIngredients.map((ingredient, idx) => {
                      const isSelected = selectedIngredients.includes(ingredient);
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`ingredient-tag ${isSelected ? 'ingredient-tag-selected' : ''}`}
                          onClick={() => toggleIngredient(ingredient)}
                          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${ingredient}`}
                        >
                          {isSelected && <span className="checkmark">✓</span>}
                          <span className="ingredient-name">{ingredient}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="no-results">
                      <p>No ingredients found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                <div className="selector-actions">
                  <button
                    className="btn-select-all"
                    onClick={() => setSelectedIngredients([...filteredIngredients])}
                    disabled={filteredIngredients.length === 0}
                  >
                    ✓ Select All ({filteredIngredients.length})
                  </button>
                  <button
                    className="btn-clear-selection"
                    onClick={() => setSelectedIngredients([])}
                    disabled={selectedIngredients.length === 0}
                  >
                    ✕ Clear Selection
                  </button>
                  {searchQuery && (
                    <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Always show selected ingredients summary */}
            {selectedIngredients.length > 0 && (
              <div className="selected-ingredients-summary">
                <h4 className="summary-title">
                  ✓ Selected Ingredients ({selectedIngredients.length})
                </h4>
                <div className="selected-ingredients-list">
                  {selectedIngredients.map((ingredient, idx) => (
                    <span key={idx} className="selected-ingredient-badge">
                      <span className="checkmark">✓</span>
                      {ingredient}
                      <button
                        className="remove-ingredient"
                        onClick={() => toggleIngredient(ingredient)}
                        aria-label={`Remove ${ingredient}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {ingredientsLoaded && ingredients.length === 0 && (
          <div className="recipes-no-ingredients">
            <div className="empty-icon">📦</div>
            <h3>No Scanned Ingredients Yet</h3>
            <p>
              Scan some products using the Scanner page to build your ingredient list, then come
              back here to get recipe suggestions!
            </p>
          </div>
        )}

        <div className="recipes-actions">
          <button
            className="btn-generate"
            type="button"
            onClick={handleGenerate}
            disabled={
              loading ||
              !ingredientsLoaded ||
              ingredients.length === 0 ||
              selectedIngredients.length === 0
            }
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Generating Recipes...
              </>
            ) : (
              <>
                <span className="btn-icon">🍳</span>
                Generate Recipes with {selectedIngredients.length} Ingredient
                {selectedIngredients.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
          {!ingredientsLoaded && <p className="loading-text">Loading your ingredients...</p>}
          {ingredientsLoaded && selectedIngredients.length === 0 && (
            <div className="selection-prompt">
              <p className="prompt-text">
                👆 Select at least one ingredient above to generate personalized recipes!
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="recipes-error">
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
                <strong>{error}</strong>
              </p>
              {error.includes('proxy server') ||
              error.includes('Cannot connect') ||
              error.includes('API key not configured') ||
              error.includes('authentication failed') ||
              error.includes('UPC_API_KEY2') ||
              error.includes('SPOONACULAR_API_KEY') ? (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                    <strong>To fix this:</strong>
                  </p>
                  <ol style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                    <li>
                      Get a free API key from{' '}
                      <a
                        href="https://spoonacular.com/food-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--snhu-yellow)', textDecoration: 'underline' }}
                      >
                        Spoonacular
                      </a>
                    </li>
                    <li>
                      Stop the recipe server (if running) and restart with the API key:
                      <br />
                      <code
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          display: 'block',
                          marginTop: '0.5rem'
                        }}
                      >
                        export SPOONACULAR_API_KEY=your_key
                        <br />
                        ./start-all-apis.sh
                      </code>
                    </li>
                    <li>
                      Or set the environment variable before starting:
                      <br />
                      <code
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          display: 'block',
                          marginTop: '0.5rem'
                        }}
                      >
                        export UPC_API_KEY2=your_key
                      </code>
                    </li>
                  </ol>
                </div>
              ) : null}
            </div>
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
            <p>
              We couldn't find recipes matching your ingredients. Try scanning more products to get
              better suggestions!
            </p>
          </div>
        )}

        {recipes && recipes.length > 0 && (
          <>
            {shoppingList.length > 0 && (
              <div className="shopping-list-section">
                <h3 className="shopping-list-title">
                  🛒 Shopping List ({shoppingList.length} items needed)
                </h3>
                <div className="shopping-list">
                  {shoppingList.map((item, idx) => (
                    <span key={idx} className="shopping-list-item">
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  className="btn-copy-shopping-list"
                  onClick={() => {
                    navigator.clipboard.writeText(shoppingList.join('\n'));
                    alert('Shopping list copied to clipboard!');
                  }}
                >
                  📋 Copy Shopping List
                </button>
              </div>
            )}
            <div className="recipes-list">
              <h2 className="recipes-found-title">
                Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} for You
              </h2>
              {recipes.map(recipe => {
                const imageFailed = imageErrors.has(recipe.id);
                const hasImage = recipe.image && !imageFailed;

                return (
                  <div key={recipe.id} className="recipe-item">
                    <div className="recipe-image">
                      {hasImage ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          loading="lazy"
                          onError={() => {
                            setImageErrors(prev => new Set([...prev, recipe.id]));
                          }}
                          onLoad={e => {
                            // Ensure image is visible
                            e.target.style.opacity = '1';
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                        />
                      ) : (
                        <div className="recipe-image-placeholder">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <p>No Image Available</p>
                        </div>
                      )}
                    </div>
                    <div className="recipe-content">
                      <h3 className="recipe-title">{recipe.title}</h3>
                      <div className="recipe-meta">
                        <span className="recipe-badge">
                          ✅ Uses {recipe.usedIngredientCount} of your ingredients
                        </span>
                        {recipe.missedIngredientCount > 0 && (
                          <span className="recipe-badge recipe-badge-missed">
                            ⚠️ Needs {recipe.missedIngredientCount} more ingredient
                            {recipe.missedIngredientCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {recipe.readyInMinutes && (
                          <span className="recipe-badge recipe-badge-time">
                            ⏱️ {recipe.readyInMinutes} min
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="recipe-badge recipe-badge-servings">
                            🍽️ {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
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
                          <strong>✅ Your ingredients used ({recipe.usedIngredientCount}):</strong>
                          <div className="recipe-ingredients-list">
                            {recipe.usedIngredients.map((ing, idx) => (
                              <span key={idx} className="recipe-ingredient-item">
                                {ing.name || ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                        <div className="recipe-missed-ingredients">
                          <strong
                            style={{
                              color: 'var(--warning-color)',
                              display: 'block',
                              marginBottom: '0.5rem'
                            }}
                          >
                            ⚠️ Missing ingredients ({recipe.missedIngredientCount}):
                          </strong>
                          <div className="recipe-ingredients-list">
                            {recipe.missedIngredients.map((ing, idx) => (
                              <span
                                key={idx}
                                className="recipe-ingredient-item recipe-ingredient-missed"
                              >
                                {ing.name || ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="recipe-actions">
                        <button
                          className="btn-recipe-details"
                          onClick={() => toggleRecipeExpansion(recipe.id)}
                          disabled={loadingDetails.has(recipe.id)}
                        >
                          {loadingDetails.has(recipe.id)
                            ? 'Loading...'
                            : expandedRecipes.has(recipe.id)
                              ? '▼ Hide Details'
                              : '▶ Show Full Details'}
                        </button>
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

                      {/* Expanded Recipe Details */}
                      {expandedRecipes.has(recipe.id) && (
                        <div className="recipe-details-expanded">
                          {loadingDetails.has(recipe.id) ? (
                            <div className="recipe-details-loading">
                              <div className="loading-spinner-small"></div>
                              <p>Loading recipe details...</p>
                            </div>
                          ) : recipeDetails.has(recipe.id) ? (
                            (() => {
                              const details = recipeDetails.get(recipe.id);
                              return (
                                <>
                                  {details.summary && (
                                    <div className="recipe-summary">
                                      <h4>About This Recipe</h4>
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: details.summary.replace(
                                            /<a\s+href="[^"]*"[^>]*>/g,
                                            '<a href="#" target="_blank" rel="noopener noreferrer">'
                                          )
                                        }}
                                      />
                                    </div>
                                  )}
                                  {details.instructions && (
                                    <div className="recipe-instructions">
                                      <h4>Instructions</h4>
                                      <ol className="instructions-list">
                                        {details.instructions
                                          .split(/\d+\.\s*/)
                                          .filter(step => step.trim())
                                          .map((step, idx) => (
                                            <li key={idx}>{step.trim()}</li>
                                          ))}
                                      </ol>
                                    </div>
                                  )}
                                  {details.extendedIngredients &&
                                    details.extendedIngredients.length > 0 && (
                                      <div className="recipe-full-ingredients">
                                        <h4>All Ingredients Needed</h4>
                                        <ul className="full-ingredients-list">
                                          {details.extendedIngredients.map((ing, idx) => (
                                            <li key={idx}>
                                              {ing.original || ing.name}
                                              {ing.amount && ing.unit && (
                                                <span className="ingredient-amount">
                                                  {' '}
                                                  ({ing.amount} {ing.unit})
                                                </span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  {details.nutrition && (
                                    <div className="recipe-nutrition">
                                      <h4>Nutrition Info</h4>
                                      <div className="nutrition-grid">
                                        {details.nutrition.nutrients
                                          ?.slice(0, 6)
                                          .map((nutrient, idx) => (
                                            <div key={idx} className="nutrition-item">
                                              <strong>{nutrient.name}:</strong>{' '}
                                              {Math.round(nutrient.amount)}
                                              {nutrient.unit}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            <div className="recipe-details-error">
                              <p>
                                Unable to load full recipe details. Click "View Full Recipe" to see
                                complete instructions.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
