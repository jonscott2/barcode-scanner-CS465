export const EXPERIMENTAL_FLAG = 'experimental';

export const ACCEPTED_MIME_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/apng',
  'image/gif',
  'image/webp',
  'image/avif'
];

// Item info API configuration.
// Set `ITEM_INFO_API_URL` to the endpoint that accepts a `barcode` query param
// (e.g. https://api.example.com/items). If the API requires an API key, set
// `ITEM_INFO_API_KEY` to the value. Leave empty to disable automatic lookups.
// Default to the official API host for UPC Database
export const ITEM_INFO_API_URL = 'https://api.upcdatabase.org';
// Do not store API keys in source. Read from build-time env variable.
// During local development you can set UPC_API_KEY in your environment.
// In CI (GitHub Actions) set a repository Secret named `UPC_API_KEY` and
// the workflow below will expose it as `UPC_API_KEY` during build.
export const ITEM_INFO_API_KEY =
  (typeof process !== 'undefined' && process?.env?.UPC_API_KEY) || '';

// Optional: a server-side proxy endpoint (recommended). Configure this to a
// relative function path like `/.netlify/functions/upc` or a deployed proxy URL.
// For Firebase Cloud Functions, use '/api/upc' which will be rewritten to the function.
// When set, the client will call the proxy instead of calling the API directly
// which avoids CORS and keeps your API key secret server-side.
// Prefer a server-side proxy. During build the `ITEM_INFO_PROXY_URL` can be
// injected via the `ITEM_INFO_PROXY_URL` env var. At runtime in the browser
// (for local development) default to `http://localhost:8787` so the app will
// use the local Express proxy without needing a rebuild.
let _itemInfoProxyUrl = '';
if (typeof process !== 'undefined' && process?.env?.ITEM_INFO_PROXY_URL) {
  _itemInfoProxyUrl = process.env.ITEM_INFO_PROXY_URL;
} else if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    _itemInfoProxyUrl = 'http://localhost:8787';
  }
}

export const ITEM_INFO_PROXY_URL = _itemInfoProxyUrl;

// Image Search API Configuration
// Unsplash API - Free tier: 50 requests/hour, no key required for basic usage
// Get your key from: https://unsplash.com/developers
export const UNSPLASH_ACCESS_KEY =
  (typeof process !== 'undefined' && process?.env?.UNSPLASH_ACCESS_KEY) || '';

// Google Custom Search API - Free tier: 100 requests/day
// Get your key from: https://developers.google.com/custom-search/v1/overview
export const GOOGLE_SEARCH_API_KEY =
  (typeof process !== 'undefined' && process?.env?.GOOGLE_SEARCH_API_KEY) || '';
export const GOOGLE_SEARCH_ENGINE_ID =
  (typeof process !== 'undefined' && process?.env?.GOOGLE_SEARCH_ENGINE_ID) || '';

// Pixabay API - Free tier: 5,000 requests/hour
// Get your key from: https://pixabay.com/api/docs/
export const PIXABAY_API_KEY =
  (typeof process !== 'undefined' && process?.env?.PIXABAY_API_KEY) || '';
