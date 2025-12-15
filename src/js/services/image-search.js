import { log } from '../utils/log.js';

/**
 * Image Search Service
 * Provides multiple methods to find product images when APIs don't return them
 */

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY =
  (typeof process !== 'undefined' && process?.env?.UNSPLASH_ACCESS_KEY) || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Google Custom Search API configuration
// Supports both build-time env vars and runtime window config
let GOOGLE_SEARCH_API_KEY =
  (typeof process !== 'undefined' && process?.env?.GOOGLE_SEARCH_API_KEY) || '';
let GOOGLE_SEARCH_ENGINE_ID =
  (typeof process !== 'undefined' && process?.env?.GOOGLE_SEARCH_ENGINE_ID) || '';

// Check for runtime configuration (from window.__GOOGLE_SEARCH_CONFIG__)
if (typeof window !== 'undefined' && window.__GOOGLE_SEARCH_CONFIG__) {
  GOOGLE_SEARCH_API_KEY = window.__GOOGLE_SEARCH_CONFIG__.apiKey || GOOGLE_SEARCH_API_KEY;
  GOOGLE_SEARCH_ENGINE_ID = window.__GOOGLE_SEARCH_CONFIG__.engineId || GOOGLE_SEARCH_ENGINE_ID;
}

const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

// Pixabay API (free, no key required for basic usage, but better with key)
const PIXABAY_API_KEY = (typeof process !== 'undefined' && process?.env?.PIXABAY_API_KEY) || '';
const PIXABAY_API_URL = 'https://pixabay.com/api';

// Cache for image search results
const imageCache = new Map();
const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached image or null if not found/expired
 */
function getCachedImage(query) {
  const cached = imageCache.get(query);
  if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    imageCache.delete(query);
  }
  return null;
}

/**
 * Store image in cache
 */
function cacheImage(query, imageUrl) {
  imageCache.set(query, { data: imageUrl, timestamp: Date.now() });
  // Limit cache size
  if (imageCache.size > 200) {
    const oldestKey = imageCache.keys().next().value;
    imageCache.delete(oldestKey);
  }
}

/**
 * Search for product image using Unsplash API
 * @param {string} productName - Product name to search for
 * @param {string} brand - Optional brand name
 * @returns {Promise<string|null>} Image URL or null
 */
async function searchUnsplash(productName, brand = '') {
  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

  try {
    const query = brand ? `${brand} ${productName} product` : `${productName} product`;
    const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls?.regular || data.results[0].urls?.small;
      if (imageUrl) {
        cacheImage(query, imageUrl);
        return imageUrl;
      }
    }

    return null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      log.warn('Unsplash search failed:', err.message);
    }
    return null;
  }
}

/**
 * Search for product image using Google Custom Search API
 * Optimized for speed - prioritized for product images
 * @param {string} productName - Product name to search for
 * @param {string} brand - Optional brand name
 * @returns {Promise<string|null>} Image URL or null
 */
async function searchGoogleImages(productName, brand = '') {
  if (
    !GOOGLE_SEARCH_API_KEY ||
    !GOOGLE_SEARCH_ENGINE_ID ||
    GOOGLE_SEARCH_ENGINE_ID === 'YOUR_SEARCH_ENGINE_ID_HERE'
  ) {
    return null;
  }

  try {
    // Optimized query for product images - more specific for faster results
    const query = brand
      ? `${brand} ${productName} product packaging`
      : `${productName} product packaging`;
    const url = `${GOOGLE_SEARCH_API_URL}?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=1&safe=active&imgSize=large&imgType=photo`;

    const controller = new AbortController();
    // Reduced timeout for faster response (Google is typically fast)
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const imageUrl = data.items[0].link;
      if (imageUrl) {
        cacheImage(query, imageUrl);
        return imageUrl;
      }
    }

    return null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      log.warn('Google Images search failed:', err.message);
    }
    return null;
  }
}

/**
 * Search for product image using Pixabay API
 * @param {string} productName - Product name to search for
 * @param {string} brand - Optional brand name
 * @returns {Promise<string|null>} Image URL or null
 */
async function searchPixabay(productName, brand = '') {
  try {
    // Clean and shorten query to avoid 400 errors
    let query = brand ? `${brand} ${productName}` : productName;
    // Remove special characters and limit length
    query = query
      .replace(/[^\w\s-]/g, ' ') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .substring(0, 50); // Limit to 50 chars

    if (!query || query.length < 2) {
      return null;
    }

    const apiKey = PIXABAY_API_KEY ? `&key=${PIXABAY_API_KEY}` : '';
    const url = `${PIXABAY_API_URL}/?q=${encodeURIComponent(query)}&image_type=photo&per_page=1&safesearch=true${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[0].webformatURL || data.hits[0].largeImageURL;
      if (imageUrl) {
        cacheImage(query, imageUrl);
        return imageUrl;
      }
    }

    return null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      log.warn('Pixabay search failed:', err.message);
    }
    return null;
  }
}

/**
 * Generate a placeholder image URL using a placeholder service
 * @param {string} productName - Product name
 * @param {string} brand - Optional brand name
 * @returns {string} Placeholder image URL
 */
function generatePlaceholderImage(productName, brand = '') {
  const text = encodeURIComponent(brand ? `${brand} ${productName}` : productName);
  // Using placeholder.com with product text
  return `https://via.placeholder.com/600x400/7ED957/1a2e11?text=${text}`;
}

/**
 * Main function to find product image using multiple sources
 * Tries sources in order: Cache -> Unsplash -> Google Images -> Pixabay -> Placeholder
 * @param {string} productName - Product name
 * @param {string} brand - Optional brand name
 * @param {string} existingImage - Existing image URL from product API (if any)
 * @returns {Promise<string>} Image URL (never returns null, always returns at least placeholder)
 */
export async function findProductImage(productName, brand = '', existingImage = '') {
  // If we already have an image URL, use it immediately (browser will validate via onerror)
  if (existingImage && typeof existingImage === 'string' && existingImage.trim()) {
    try {
      const url = new URL(existingImage);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        log.info('Using provided image URL:', existingImage);
        return existingImage;
      }
    } catch {
      // Not a valid URL, continue to search
      log.warn('Invalid image URL provided, searching instead:', existingImage);
    }
  }

  // Check cache
  const cacheKey = `${brand} ${productName}`.trim();
  const cached = getCachedImage(cacheKey);
  if (cached) {
    return cached;
  }

  // Prioritize Google Images for faster product image results
  // Try Google first (fastest for product images), then others in parallel
  if (GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
    try {
      const googleImage = await searchGoogleImages(productName, brand);
      if (googleImage) {
        cacheImage(cacheKey, googleImage);
        return googleImage;
      }
    } catch {
      // Google failed, continue to other sources
    }
  }

  // Try other image sources in parallel for speed
  const searchPromises = [searchUnsplash(productName, brand), searchPixabay(productName, brand)];

  // If Google wasn't available, try it now
  if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    searchPromises.push(searchGoogleImages(productName, brand));
  }

  try {
    // Use Promise.any to get the first successful result
    const imageUrl = await Promise.any(searchPromises);
    if (imageUrl) {
      cacheImage(cacheKey, imageUrl);
      return imageUrl;
    }
  } catch {
    // All searches failed, fall through to placeholder
  }

  // Fallback to placeholder
  const placeholder = generatePlaceholderImage(productName, brand);
  return placeholder;
}

/**
 * Validate if an image URL is accessible
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if image is accessible
 */
async function validateImageUrl(url) {
  if (!url || !url.startsWith('http')) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    return response.ok && contentType && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Clear the image cache
 */
export function clearImageCache() {
  imageCache.clear();
  log.info('Image cache cleared');
}

/**
 * Get multiple product images (for gallery view)
 * @param {string} productName - Product name
 * @param {string} brand - Optional brand name
 * @param {number} count - Number of images to fetch (default: 3)
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function findMultipleProductImages(productName, brand = '', count = 3) {
  const images = [];
  const query = brand ? `${brand} ${productName} product` : `${productName} product`;

  // Try to get multiple images from Unsplash
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          for (const result of data.results.slice(0, count)) {
            const imageUrl = result.urls?.regular || result.urls?.small;
            if (imageUrl) {
              images.push(imageUrl);
            }
          }
        }
      }
    } catch (err) {
      log.warn('Failed to fetch multiple images from Unsplash:', err.message);
    }
  }

  // If we don't have enough images, fill with placeholders
  while (images.length < count) {
    images.push(generatePlaceholderImage(productName, brand));
  }

  return images.slice(0, count);
}

