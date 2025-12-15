import { log } from '../utils/log.js';
import { getUserScans } from './firebase-scans.js';

const RECIPE_API_BASE = 'https://api.spoonacular.com/recipes';
const RECIPE_API_KEY =
  typeof process !== 'undefined' && process?.env?.SPOONACULAR_API_KEY
    ? process.env.SPOONACULAR_API_KEY
    : '';

// Recipe proxy endpoint (if available)
let RECIPE_PROXY_URL = '';
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    RECIPE_PROXY_URL = 'http://localhost:8788/recipes/from-file';
  }
}

// Cache for recipe searches (by ingredients)
const recipeSearchCache = new Map();
const RECIPE_SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get cache key from ingredients list
 */
function getCacheKey(ingredients) {
  return ingredients.sort().join(',').toLowerCase();
}

/**
 * Get user's scanned ingredients for recipe generation
 * @returns {Promise<Array<string>>}
 */
export async function getUserIngredients() {
  try {
    const { error, scans } = await getUserScans(100);

    if (error) {
      log.warn('Error getting user scans:', error);
      return [];
    }

    // Extract unique product titles/names from scans
    const ingredients = new Set();

    scans.forEach(scan => {
      // Prioritize title, then description, then brand
      if (scan.title) {
        // Clean up product title (remove brand if it's in the title)
        let cleanTitle = scan.title
          .replace(/\s*-\s*.*$/, '') // Remove everything after dash
          .replace(/\s*\(.*?\)\s*/g, '') // Remove text in parentheses
          .trim();

        // Extract main ingredient name (remove common prefixes/suffixes)
        cleanTitle = cleanTitle
          .replace(/^(organic|natural|fresh|frozen|dried|raw)\s+/i, '')
          .replace(/\s+(organic|natural|fresh|frozen|dried|raw)$/i, '')
          .trim();

        if (cleanTitle && cleanTitle.length > 2) {
          ingredients.add(cleanTitle);
        }
      }

      // Also extract from description if it contains ingredient-like text
      if (scan.description) {
        const desc = scan.description.toLowerCase();
        // Common ingredient keywords
        const ingredientKeywords = [
          'chicken',
          'beef',
          'pork',
          'fish',
          'rice',
          'pasta',
          'bread',
          'cheese',
          'milk',
          'eggs',
          'tomato',
          'onion',
          'garlic',
          'pepper',
          'salt',
          'sugar',
          'flour',
          'butter',
          'oil',
          'vegetable',
          'fruit',
          'bean',
          'pea',
          'corn',
          'potato'
        ];

        ingredientKeywords.forEach(keyword => {
          if (desc.includes(keyword)) {
            ingredients.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
          }
        });
      }

      // Add brand only if it's a food brand (not generic)
      if (scan.brand && scan.brand.length > 2 && scan.brand.length < 30) {
        // Don't add very short or very long brand names as ingredients
        ingredients.add(scan.brand);
      }
    });

    // Sort ingredients alphabetically for better organization
    return Array.from(ingredients).sort();
  } catch (err) {
    log.error('Error getting user ingredients:', err);
    return [];
  }
}

/**
 * Fetch recipes from Spoonacular API based on ingredients
 * @param {Array<string>} ingredients - List of ingredient names
 * @param {number} number - Number of recipes to return (default: 10)
 * @returns {Promise<Array<Object>|null>}
 */
export async function fetchRecipes(ingredients = [], number = 10) {
  if (!ingredients || ingredients.length === 0) {
    log.info('No ingredients provided for recipe search');
    return null;
  }

  // Check cache first
  const cacheKey = getCacheKey(ingredients);
  const cached = recipeSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < RECIPE_SEARCH_CACHE_TTL) {
    if (process.env.NODE_ENV !== 'production') {
      log.info(`Recipe search cache hit for ingredients: ${ingredients.join(', ')}`);
    }
    // Return cached results, limited to requested number
    return cached.data.slice(0, number);
  }

  const ingredientsParam = ingredients.join(',');
  const headers = { Accept: 'application/json' };

  // Helper function to parse and transform recipe data
  const transformRecipes = data => {
    if (Array.isArray(data)) {
      return data.map(recipe => {
        // Ensure image URL is valid and use HTTPS
        let imageUrl = recipe.image || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `https://${imageUrl}`;
        }
        // Use Spoonacular's image CDN if URL looks valid
        if (imageUrl && imageUrl.includes('spoonacular')) {
          // Already a valid Spoonacular URL
        } else if (recipe.id && !imageUrl) {
          // Try to construct image URL from recipe ID
          imageUrl = `https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`;
        }

        return {
          id: recipe.id,
          title: recipe.title,
          image: imageUrl,
          usedIngredientCount: recipe.usedIngredientCount || 0,
          missedIngredientCount: recipe.missedIngredientCount || 0,
          usedIngredients: recipe.usedIngredients || [],
          missedIngredients: recipe.missedIngredients || [],
          likes: recipe.likes || 0,
          readyInMinutes: recipe.readyInMinutes || null,
          servings: recipe.servings || null,
          sourceUrl: recipe.sourceUrl || null,
          recipeUrl:
            recipe.sourceUrl ||
            `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`
        };
      });
    }
    return null;
  };

  // Try proxy first (for local development), then fallback to direct API
  const useProxy = RECIPE_PROXY_URL && RECIPE_PROXY_URL.length > 0;

  if (useProxy) {
    try {
      const proxyUrl = `${RECIPE_PROXY_URL}?ingredients=${encodeURIComponent(ingredientsParam)}&number=${number}`;
      // Only log in development, not in production
      if (process.env.NODE_ENV !== 'production') {
        log.info('Attempting to fetch recipes via proxy:', proxyUrl);
      }

      // Create timeout controller for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        log.warn(`Recipe proxy error (${res.status}):`, errorText);

        // Try to parse JSON error response
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // Not JSON, use text as-is
        }

        if (res.status === 402) {
          throw new Error('Recipe API quota exceeded. Please try again later.');
        } else if (res.status === 401) {
          // Check if it's a missing API key error
          if (errorData && errorData.error === 'api_key_missing') {
            throw new Error(
              errorData.message ||
                'Recipe API key not configured. Please set UPC_API_KEY2 or SPOONACULAR_API_KEY environment variable.'
            );
          }
          throw new Error('Recipe API authentication failed. Feature unavailable.');
        } else {
          // Proxy returned error, fall through to direct API
          throw new Error(`Proxy returned ${res.status}`);
        }
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        const text = await res.text();
        throw new Error(`Unexpected response format: ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      const transformed = transformRecipes(data);
      if (transformed) {
        // Cache the results
        recipeSearchCache.set(cacheKey, { data: transformed, timestamp: Date.now() });

        // Limit cache size
        if (recipeSearchCache.size > 50) {
          const oldestKey = recipeSearchCache.keys().next().value;
          recipeSearchCache.delete(oldestKey);
        }

        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
          log.info('Successfully fetched recipes via proxy');
        }
        return transformed.slice(0, number);
      }
    } catch (err) {
      // Check if it's a connection error (proxy not available)
      const isConnectionError =
        err.name === 'TypeError' ||
        err.name === 'AbortError' ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('ERR_CONNECTION_REFUSED') ||
        err.message.includes('NetworkError') ||
        err.message.includes('aborted');

      if (isConnectionError) {
        // Only log warning in development to reduce console noise
        if (process.env.NODE_ENV !== 'production') {
          log.warn('Proxy connection failed, falling back to direct API:', err.message);
        }
        // Fall through to direct API call
      } else {
        // Other errors (like 402, 401) should be thrown
        throw err;
      }
    }
  }

  // Fallback to direct API call (or use directly if no proxy configured)
  try {
    if (!RECIPE_API_KEY) {
      throw new Error(
        'Recipe API key not configured. Please configure SPOONACULAR_API_KEY or start the recipe proxy server.'
      );
    }

    const directUrl = `${RECIPE_API_BASE}/findByIngredients?ingredients=${encodeURIComponent(
      ingredientsParam
    )}&number=${number}&ranking=1&ignorePantry=true&apiKey=${RECIPE_API_KEY}`;

    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      log.info('Fetching recipes directly from Spoonacular API');
    }

    // Create timeout controller for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(directUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      log.warn(`Recipe API error (${res.status}):`, errorText);

      if (res.status === 402) {
        throw new Error('Recipe API quota exceeded. Please try again later.');
      } else if (res.status === 401) {
        throw new Error('Recipe API authentication failed. Please check your API key.');
      } else {
        throw new Error(`Failed to fetch recipes: ${res.status}`);
      }
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await res.text();
      throw new Error(`Unexpected response format: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const transformed = transformRecipes(data);
    if (transformed) {
      // Cache the results
      recipeSearchCache.set(cacheKey, { data: transformed, timestamp: Date.now() });

      // Limit cache size
      if (recipeSearchCache.size > 50) {
        const oldestKey = recipeSearchCache.keys().next().value;
        recipeSearchCache.delete(oldestKey);
      }

      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        log.info('Successfully fetched recipes from direct API');
      }
      return transformed.slice(0, number);
    }

    return null;
  } catch (err) {
    // Only log full error in development
    if (process.env.NODE_ENV !== 'production') {
      log.error('Error fetching recipes from direct API:', err);
    }

    // Provide helpful error messages
    if (err.message && err.message.includes('API key not configured')) {
      throw new Error(
        'Recipe feature requires API configuration. Please start the recipe proxy server (port 8788) or configure SPOONACULAR_API_KEY.'
      );
    }

    if (err.name === 'AbortError' || (err.message && err.message.includes('timeout'))) {
      throw new Error('Recipe API request timed out. Please try again later.');
    }

    throw new Error(err.message || 'Failed to fetch recipes. Please try again later.');
  }
}

// Cache for recipe details
const recipeDetailsCache = new Map();
const RECIPE_DETAILS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get detailed recipe information by ID (with caching)
 * @param {number} recipeId - Spoonacular recipe ID
 * @returns {Promise<Object|null>}
 */
export async function getRecipeDetails(recipeId) {
  if (!recipeId) {
    return null;
  }

  // Check cache first
  const cached = recipeDetailsCache.get(recipeId);
  if (cached && Date.now() - cached.timestamp < RECIPE_DETAILS_CACHE_TTL) {
    if (process.env.NODE_ENV !== 'production') {
      log.info(`Recipe details cache hit for ID: ${recipeId}`);
    }
    return cached.data;
  }

  const useProxy = RECIPE_PROXY_URL && RECIPE_PROXY_URL.length > 0;
  let url;

  if (useProxy) {
    // Try proxy endpoint for recipe details
    url = `${RECIPE_PROXY_URL.split('/recipes/from-file')[0]}/recipes/${recipeId}/information`;
  } else {
    url = `${RECIPE_API_BASE}/${recipeId}/information${RECIPE_API_KEY ? `?apiKey=${RECIPE_API_KEY}` : ''}`;
  }

  const headers = { Accept: 'application/json' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    // Cache the result
    recipeDetailsCache.set(recipeId, { data, timestamp: Date.now() });

    // Limit cache size
    if (recipeDetailsCache.size > 100) {
      const oldestKey = recipeDetailsCache.keys().next().value;
      recipeDetailsCache.delete(oldestKey);
    }

    return data;
  } catch (err) {
    if (err.name !== 'AbortError' && process.env.NODE_ENV !== 'production') {
      log.error('Error fetching recipe details:', err);
    }
    return null;
  }
}
