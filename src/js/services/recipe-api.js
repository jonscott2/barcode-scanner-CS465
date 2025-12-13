import { log } from '../utils/log.js';
import { getUserScans } from './firebase-scans.js';

const RECIPE_API_BASE = 'https://api.spoonacular.com/recipes';
const RECIPE_API_KEY = typeof process !== 'undefined' && process?.env?.SPOONACULAR_API_KEY
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
      // Prioritize title, then brand, then description
      if (scan.title) {
        // Clean up product title (remove brand if it's in the title)
        const cleanTitle = scan.title
          .replace(/\s*-\s*.*$/, '') // Remove everything after dash
          .trim();
        if (cleanTitle) {
          ingredients.add(cleanTitle);
        }
      }
      if (scan.brand) {
        ingredients.add(scan.brand);
      }
    });

    return Array.from(ingredients);
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

  const ingredientsParam = ingredients.join(',');

  // Try proxy first (for local development), then direct API
  const useProxy = RECIPE_PROXY_URL && RECIPE_PROXY_URL.length > 0;
  const base = useProxy ? RECIPE_PROXY_URL.split('/recipes')[0] : RECIPE_API_BASE;
  
  const url = useProxy
    ? `${RECIPE_PROXY_URL}?ingredients=${encodeURIComponent(ingredientsParam)}&number=${number}`
    : `${base}/findByIngredients?ingredients=${encodeURIComponent(ingredientsParam)}&number=${number}&ranking=1&ignorePantry=true${RECIPE_API_KEY ? `&apiKey=${RECIPE_API_KEY}` : ''}`;

  const headers = { Accept: 'application/json' };

  try {
    const res = await fetch(url, { method: 'GET', headers });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      log.warn(`Recipe API error (${res.status}):`, errorText);
      
      if (res.status === 402) {
        throw new Error('Recipe API quota exceeded. Please try again later.');
      } else if (res.status === 401) {
        throw new Error('Recipe API authentication failed. Feature unavailable.');
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
    
    // Spoonacular returns array of recipes
    if (Array.isArray(data)) {
      return data.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount || 0,
        missedIngredientCount: recipe.missedIngredientCount || 0,
        usedIngredients: recipe.usedIngredients || [],
        missedIngredients: recipe.missedIngredients || [],
        likes: recipe.likes || 0,
        recipeUrl: `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`
      }));
    }
    
    return null;
  } catch (err) {
    log.error('Error fetching recipes:', err);
    throw err;
  }
}

/**
 * Get detailed recipe information by ID
 * @param {number} recipeId - Spoonacular recipe ID
 * @returns {Promise<Object|null>}
 */
export async function getRecipeDetails(recipeId) {
  if (!recipeId) return null;

  const useProxy = RECIPE_PROXY_URL && RECIPE_PROXY_URL.length > 0;
  const base = useProxy ? RECIPE_PROXY_URL.split('/recipes')[0] : RECIPE_API_BASE;
  
  const url = `${base}/${recipeId}/information${RECIPE_API_KEY ? `?apiKey=${RECIPE_API_KEY}` : ''}`;
  const headers = { Accept: 'application/json' };

  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) return null;
    
    return await res.json();
  } catch (err) {
    log.error('Error fetching recipe details:', err);
    return null;
  }
}



