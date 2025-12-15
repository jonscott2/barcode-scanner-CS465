import { ITEM_INFO_API_URL, ITEM_INFO_API_KEY, ITEM_INFO_PROXY_URL } from '../constants.js';
import { log } from '../utils/log.js';

const trimSlash = s => s.replace(/\/+$/, '');

// In-memory cache with TTL (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const productCache = new Map();

/**
 * Get cached product or null if not found/expired
 */
function getCachedProduct(barcode) {
  const cached = productCache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    log.info(`Cache hit for barcode: ${barcode}`);
    return cached.data;
  }
  if (cached) {
    productCache.delete(barcode); // Remove expired entry
  }
  return null;
}

/**
 * Store product in cache
 */
function cacheProduct(barcode, data) {
  productCache.set(barcode, { data, timestamp: Date.now() });
  // Limit cache size to prevent memory issues
  if (productCache.size > 500) {
    const oldestKey = productCache.keys().next().value;
    productCache.delete(oldestKey);
  }
}

/**
 * Multiple API sources for better coverage and reliability
 */
const API_SOURCES = {
  // SearchUPCData - fast API with sub-100ms response times (free tier available)
  searchUPCData: {
    name: 'SearchUPCData',
    requiresProxy: false,
    getUrl: barcode => `https://www.searchupcdata.com/api/v1/product/${barcode}`,
    parseResponse: data => {
      if (data && (data.productname || data.product_name || data.name)) {
        return {
          title: data.productname || data.product_name || data.name || '',
          brand: data.brand || data.manufacturer || '',
          description: data.description || data.category || '',
          image: data.image || data.imageurl || '',
          metadata: {
            source: 'SearchUPCData',
            category: data.category,
            manufacturer: data.manufacturer
          }
        };
      }
      return null;
    }
  },
  // Open Food Facts - free, no key required, good for food products
  openFoodFacts: {
    name: 'Open Food Facts',
    getUrl: barcode => `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    parseResponse: data => {
      if (data?.status === 1 && data?.product) {
        const p = data.product;
        return {
          title: p.product_name || p.product_name_en || '',
          brand: p.brands || '',
          description: p.generic_name || p.categories || '',
          image: p.image_url || p.image_front_url || '',
          metadata: {
            source: 'Open Food Facts',
            categories: p.categories,
            ingredients: p.ingredients_text,
            nutrition_grade: p.nutrition_grades,
            quantity: p.quantity
          }
        };
      }
      return null;
    }
  },
  // UPC Database (primary configured API)
  upcDatabase: {
    name: 'UPC Database',
    requiresProxy: true,
    getUrl: (barcode, base) => `${base}/product/${barcode}`,
    parseResponse: data => {
      if (data && (data.title || data.name || data.description)) {
        return {
          title: data.title || data.name || '',
          brand: data.brand || '',
          description: data.description || '',
          image: data.image || data.images?.[0] || '',
          metadata: {
            source: 'UPC Database',
            ...data
          }
        };
      }
      return null;
    }
  },
  // Open Beauty Facts - for cosmetics/beauty products
  openBeautyFacts: {
    name: 'Open Beauty Facts',
    getUrl: barcode => `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
    parseResponse: data => {
      if (data?.status === 1 && data?.product) {
        const p = data.product;
        return {
          title: p.product_name || p.product_name_en || '',
          brand: p.brands || '',
          description: p.generic_name || p.categories || '',
          image: p.image_url || p.image_front_url || '',
          metadata: {
            source: 'Open Beauty Facts',
            categories: p.categories
          }
        };
      }
      return null;
    }
  },
  // Barcode Lookup API - free tier available, good for food products
  // Note: Demo key causes CORS issues - only use if you have a real API key
  // For now, disabled to avoid CORS errors
  barcodeLookup: {
    name: 'Barcode Lookup',
    requiresProxy: false,
    enabled: false, // Disabled due to CORS issues with demo key
    getUrl: barcode =>
      `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=demo`,
    parseResponse: data => {
      if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
        const p = data.products[0];
        return {
          title: p.product_name || p.title || '',
          brand: p.brand || p.manufacturer || '',
          description: p.description || p.category || '',
          image: p.images?.[0] || p.image || '',
          metadata: {
            source: 'Barcode Lookup',
            category: p.category,
            manufacturer: p.manufacturer,
            model: p.model,
            mpn: p.mpn
          }
        };
      }
      return null;
    }
  },
  // GTIN Search (Datakick) - free, open product database
  gtinSearch: {
    name: 'GTIN Search',
    requiresProxy: false,
    getUrl: barcode => `https://gtinsearch.org/api/v1/products/${barcode}`,
    parseResponse: data => {
      if (data && (data.name || data.title)) {
        return {
          title: data.name || data.title || '',
          brand: data.brand || data.manufacturer || '',
          description: data.description || data.category || '',
          image: data.image || data.images?.[0] || '',
          metadata: {
            source: 'GTIN Search',
            category: data.category,
            gtin: data.gtin
          }
        };
      }
      return null;
    }
  }
};

/**
 * Fetch from a single API source with timeout and retry logic
 */
async function fetchFromSource(source, barcode, proxyBase, headers, timeout = 5000, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url =
      source.requiresProxy && proxyBase
        ? source.getUrl(barcode, proxyBase)
        : source.getUrl(barcode);

    const fetchHeaders = source.requiresProxy ? headers : {};

    const res = await fetch(url, {
      method: 'GET',
      headers: fetchHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Retry on 5xx errors or rate limits (429)
      if ((res.status >= 500 || res.status === 429) && retries > 0) {
        log.warn(`${source.name} returned ${res.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        return fetchFromSource(source, barcode, proxyBase, headers, timeout, retries - 1);
      }
      return null;
    }

    const data = await res.json();
    const parsed = source.parseResponse(data);

    if (parsed) {
      log.info(`Product found via ${source.name}`);
      return parsed;
    }

    return null;
  } catch (err) {
    clearTimeout(timeoutId);

    // Retry on network errors (but not for CORS/403/DNS errors which won't be fixed by retry)
    const isRetryableError =
      retries > 0 &&
      (err.name === 'TypeError' || err.name === 'NetworkError') &&
      !err.message.includes('CORS') &&
      !err.message.includes('403') &&
      !err.message.includes('ERR_NAME_NOT_RESOLVED') &&
      !err.message.includes('Failed to fetch');

    if (isRetryableError) {
      if (process.env.NODE_ENV !== 'production') {
        log.warn(`${source.name} network error, retrying...`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchFromSource(source, barcode, proxyBase, headers, timeout, retries - 1);
    }

    if (err.name === 'AbortError') {
      if (process.env.NODE_ENV !== 'production') {
        log.warn(`${source.name} request timed out`);
      }
    } else {
      // Only log non-CORS/403/DNS errors in development to reduce console noise
      const shouldLog =
        process.env.NODE_ENV !== 'production' &&
        !err.message.includes('CORS') &&
        !err.message.includes('403') &&
        !err.message.includes('ERR_NAME_NOT_RESOLVED');

      if (shouldLog) {
        log.warn(`${source.name} request failed:`, err.message);
      }
    }
    return null;
  }
}

/**
 * Fetch product info using multiple APIs in parallel for speed
 * Falls back to sequential if parallel fails
 *
 * @param {string} barcode
 * @returns {Promise<Object|null>}
 */
export async function fetchItemInfo(barcode) {
  if (!barcode || !/^[0-9]{8,14}$/.test(barcode)) {
    return null;
  }

  // Check cache first
  const cached = getCachedProduct(barcode);
  if (cached) {
    return cached;
  }

  // Determine proxy configuration
  const isBrowser = typeof window !== 'undefined' && window?.location;
  let finalProxyUrl = ITEM_INFO_PROXY_URL || '';

  if (!finalProxyUrl && isBrowser) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      finalProxyUrl = 'http://localhost:8787';
    }
  }

  const useProxy = finalProxyUrl && finalProxyUrl.length > 0;
  const proxyBase = useProxy
    ? trimSlash(finalProxyUrl)
    : ITEM_INFO_API_URL
      ? trimSlash(ITEM_INFO_API_URL)
      : null;

  const headers = {};
  if (!useProxy && ITEM_INFO_API_KEY) {
    headers['Authorization'] = `Bearer ${ITEM_INFO_API_KEY}`;
  }

  // Parallel fetch from multiple sources for maximum speed
  // Prioritize faster APIs first
  const fetchPromises = [
    // Fast APIs (sub-200ms typically)
    fetchFromSource(API_SOURCES.searchUPCData, barcode, null, {}, 3000),
    fetchFromSource(API_SOURCES.openFoodFacts, barcode, null, {}, 4000),
    fetchFromSource(API_SOURCES.gtinSearch, barcode, null, {}, 4000)
  ];

  // Add UPC Database if configured
  if (proxyBase || ITEM_INFO_API_URL) {
    fetchPromises.push(fetchFromSource(API_SOURCES.upcDatabase, barcode, proxyBase, headers, 5000));
  }

  // Add Open Beauty Facts for broader coverage
  fetchPromises.push(fetchFromSource(API_SOURCES.openBeautyFacts, barcode, null, {}, 4000));

  // Add Barcode Lookup API only if enabled (disabled by default due to CORS issues)
  if (API_SOURCES.barcodeLookup.enabled !== false) {
    fetchPromises.push(fetchFromSource(API_SOURCES.barcodeLookup, barcode, null, {}, 5000));
  }

  try {
    // Use Promise.any to get the first successful result
    // This is faster than waiting for all to complete
    // Promise.any will resolve with the first successful result
    const result = await Promise.any(fetchPromises);

    if (result) {
      // Enhance result with additional metadata
      result.metadata = {
        ...result.metadata,
        fetchedAt: new Date().toISOString(),
        barcode: barcode
      };

      cacheProduct(barcode, result);
      return result;
    }
  } catch (_err) {
    // All promises rejected - try sequential fallback
    if (process.env.NODE_ENV !== 'production') {
      log.warn('All parallel API requests failed, trying fallback');
    }
  }

  // Fallback: try unified product lookup endpoint (if proxy is available)
  if (proxyBase) {
    const base = proxyBase;
    // Try unified lookup endpoint first (new cache-first pipeline)
    const unifiedUrl = `${base}/product/${encodeURIComponent(barcode)}`;
    let result = await attemptRequest(unifiedUrl, { method: 'GET', headers });

    if (result) {
      // Check if it's the new unified format
      if (result.ok && result.product) {
        const parsed = normalizeApiResponse(result);
        if (parsed) {
          cacheProduct(barcode, parsed);
          return parsed;
        }
      } else {
        // Legacy format
        const parsed = normalizeApiResponse(result);
        if (parsed) {
          cacheProduct(barcode, parsed);
          return parsed;
        }
      }
    }

    // Try GET /products/{id} (legacy endpoint)
    const urlProducts = `${base}/products/${encodeURIComponent(barcode)}`;
    result = await attemptRequest(urlProducts, { method: 'GET', headers });
    if (result) {
      const parsed = normalizeApiResponse(result);
      if (parsed) {
        cacheProduct(barcode, parsed);
        return parsed;
      }
    }

    // Try POST /products/{id} (legacy endpoint)
    result = await attemptRequest(urlProducts, { method: 'POST', headers });
    if (result) {
      const parsed = normalizeApiResponse(result);
      if (parsed) {
        cacheProduct(barcode, parsed);
        return parsed;
      }
    }
  }

  // Cache negative result to avoid repeated lookups for unknown products
  cacheProduct(barcode, null);
  return null;
}

/**
 * Normalize various API response formats to a standard structure
 * Also handles unified product lookup response format
 */
function normalizeApiResponse(data) {
  if (!data) {
    return null;
  }

  // Handle unified product lookup response format
  if (data.ok && data.product) {
    const p = data.product;
    // Check multiple possible image fields
    const imageFields = [
      p.image,
      p.image_url,
      p.imageUrl,
      p.images?.[0],
      p.images?.[1],
      p.product_image,
      p.productImage
    ];

    let imageUrl = '';
    for (const field of imageFields) {
      if (field && typeof field === 'string' && field.trim()) {
        imageUrl = field;
        break;
      }
    }

    return {
      title: p.name || '',
      brand: p.brand || '',
      description: p.ingredients || p.categories || '',
      image: imageUrl,
      metadata: {
        source: p.source || 'Unified Lookup',
        ingredients: p.ingredients || '',
        allergens: p.allergens || '',
        nutrition: p.nutrition || null,
        categories: p.categories || '',
        lastUpdated: p.lastUpdated || ''
      }
    };
  }

  // Handle legacy API response formats
  // Check multiple possible image fields
  const imageFields = [
    data.image,
    data.image_url,
    data.imageUrl,
    data.images?.[0],
    data.images?.[1],
    data.product_image,
    data.productImage,
    data.thumbnail,
    data.thumbnail_url
  ];

  let imageUrl = '';
  for (const field of imageFields) {
    if (field && typeof field === 'string' && field.trim()) {
      imageUrl = field;
      break;
    }
  }

  return {
    title: data.title || data.name || data.product_name || '',
    brand: data.brand || data.brands || '',
    description: data.description || data.generic_name || '',
    image: imageUrl,
    metadata: {
      source: 'UPC Database',
      ...data
    }
  };
}

/**
 * Helper to attempt a request and return parsed JSON or null
 */
async function attemptRequest(url, opts = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    try {
      return await res.json();
    } catch (e) {
      log.warn('Non-JSON response from item API', e);
      return null;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      log.warn('Request timed out:', url);
    } else {
      log.warn('Request failed:', err.message);
    }
    return null;
  }
}

/**
 * Search endpoint: GET /search?q={query}
 * Returns parsed JSON or null.
 *
 * @param {string} query
 * @returns {Promise<Object|null>}
 */
export async function searchItem(query) {
  if (!query) {
    return null;
  }

  // Prefer proxy when available (same logic as fetchItemInfo)
  const isBrowser = typeof window !== 'undefined' && window?.location;
  let finalProxyUrl = ITEM_INFO_PROXY_URL || '';

  if (!finalProxyUrl && isBrowser) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      finalProxyUrl = 'http://localhost:8787';
    }
  }

  const useProxy = finalProxyUrl && finalProxyUrl.length > 0;
  const base = trimSlash(useProxy ? finalProxyUrl : ITEM_INFO_API_URL);

  const headers = {};
  if (!useProxy && ITEM_INFO_API_KEY) {
    headers['Authorization'] = `Bearer ${ITEM_INFO_API_KEY}`;
  }

  const url = `${base}/search?q=${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      log.warn('Search request failed', res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      log.warn('Search request timed out');
    } else {
      log.error('Search request error', err);
    }
    return null;
  }
}

/**
 * Clear the product cache (useful for testing or when user logs out)
 */
export function clearProductCache() {
  productCache.clear();
  log.info('Product cache cleared');
}
