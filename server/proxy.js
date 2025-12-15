/*
 Local Express proxy to forward UPC API requests and add CORS headers.
 Usage:
   set UPC_API_KEY=your_key  (Windows PowerShell: $env:UPC_API_KEY="your_key")
   npm install
   npm run start:proxy

 The client should call the proxy at http://localhost:8787 (default). The
 repo's `src/js/constants.js` will default ITEM_INFO_PROXY_URL to this host
 when running on localhost.
*/

const express = require('express');
const fetch = global.fetch || require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8787;
const UPC_API_BASE = 'https://api.upcdatabase.org';
const API_KEY = process.env.UPC_API_KEY || '';
const INGREDIENTS_FILE = process.env.INGREDIENTS_FILE || path.join(__dirname, 'ingredients.json');

// Optional: Firestore per-user storage (Option A)
let admin = null;
let firestore = null;
function initFirebaseAdmin() {
  if (admin) return; // already initialized
  try {
    // Try to require firebase-admin lazily so users without the dependency don't break
    // immediately. If it's not installed we'll log instructions.
    /* eslint-disable global-require */
    admin = require('firebase-admin');
    /* eslint-enable global-require */

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Service account JSON provided directly in env var
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({ credential: admin.credential.cert(svc) });
      console.log('firebase-admin initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Let firebase-admin use ADC via GOOGLE_APPLICATION_CREDENTIALS
      admin.initializeApp();
      console.log('firebase-admin initialized using GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      // No credentials provided — do not initialize
      console.log('firebase-admin not initialized: no service account provided');
      admin = null;
      return;
    }

    firestore = admin.firestore();
  } catch (err) {
    console.warn(
      'Could not initialize firebase-admin. To enable per-user storage install firebase-admin and provide credentials. Error:',
      String(err)
    );
    admin = null;
    firestore = null;
  }
}

// Attempt initialization at startup if credentials are present
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  initFirebaseAdmin();
}

// Helper to mask API keys in logs (show first 4 and last 4 chars).
function maskKey(k) {
  if (!k) {
    return '<none>';
  }
  if (k.length <= 8) {
    return '****';
  }
  return `${k.slice(0, 4)}...${k.slice(-4)}`;
}

// Log which key will be used (masked) so developers can confirm behavior.
console.log(`UPC proxy: using API key: ${maskKey(API_KEY)}`);

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

async function proxyRequest(targetUrl, method, req, res) {
  try {
    const headers = { Accept: 'application/json' };
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const fetchOptions = {
      method: method || 'GET',
      headers
    };

    // Log outbound request details (mask the Authorization header)
    try {
      const loggedHeaders = { ...headers };
      if (loggedHeaders['Authorization']) {
        const token = String(loggedHeaders['Authorization']).replace(/^Bearer\s+/i, '');
        loggedHeaders['Authorization'] = `Bearer ${maskKey(token)}`;
      }
      console.log('Proxy -> upstream:', targetUrl, JSON.stringify(loggedHeaders));
    } catch {
      // never fail the request because logging threw
    }

    const fetchRes = await fetch(targetUrl, fetchOptions);
    const text = await fetchRes.text();

    // Log upstream response body for debugging and save item title when present.
    try {
      const contentType = fetchRes.headers.get('content-type') || '';
      if (contentType.toLowerCase().includes('application/json')) {
        const parsed = JSON.parse(text);
        console.log('Proxy <- upstream response (JSON):\n' + JSON.stringify(parsed, null, 2));
        // If the response contains a title field, save it to ingredients.json or per-user store
        if (parsed && typeof parsed.title === 'string' && parsed.title.trim()) {
          // Pass the incoming Authorization header so saveTitle can attempt
          // to verify a Firebase ID token and write per-user data to Firestore.
          const authHeader = req.headers && req.headers.authorization;
          saveTitleToIngredients(parsed.title.trim(), authHeader).catch(err =>
            console.warn('Failed to save title to ingredients store', err)
          );
        }
      } else {
        // Not JSON according to content-type, still try to parse safely
        try {
          const parsed = JSON.parse(text);
          console.log('Proxy <- upstream response (parsed):\n' + JSON.stringify(parsed, null, 2));
          if (parsed && typeof parsed.title === 'string' && parsed.title.trim()) {
            const authHeader = req.headers && req.headers.authorization;
            saveTitleToIngredients(parsed.title.trim(), authHeader).catch(err =>
              console.warn('Failed to save title to ingredients store', err)
            );
          }
        } catch {
          console.log('Proxy <- upstream response (text):', text);
        }
      }
    } catch {
      console.log('Proxy <- upstream response (raw):', text);
    }

    res.status(fetchRes.status);
    // pass content-type if present
    const contentType = fetchRes.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    return res.send(text);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: 'proxy_error', details: String(err) });
  }
}

async function saveTitleToIngredients(title, authHeader) {
  // If Firestore is available and we can verify a Firebase ID token from
  // the incoming Authorization header, write a per-user document. Otherwise
  // fall back to writing into the local ingredients JSON file.
  try {
    if (
      !firestore &&
      (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ) {
      initFirebaseAdmin();
    }

    let uid = null;
    if (admin && typeof authHeader === 'string') {
      try {
        const token = String(authHeader)
          .replace(/^Bearer\s+/i, '')
          .trim();
        if (token) {
          const decoded = await admin.auth().verifyIdToken(token);
          uid = decoded && decoded.uid ? decoded.uid : null;
        }
      } catch (e) {
        // invalid token; continue to file fallback
        console.warn('Failed to verify Firebase ID token:', String(e));
        uid = null;
      }
    }

    if (uid && firestore) {
      try {
        const ref = firestore.collection('userIngredients').doc(uid).collection('items');
        await ref.add({
          title: String(title),
          addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Saved title to Firestore for uid=${uid}: ${title}`);
        return;
      } catch (e) {
        console.warn('Failed to write title to Firestore, will fallback to file:', String(e));
        // continue to file fallback
      }
    }

    // Fallback: file-based storage (existing behavior), but annotate with userId when available.
    let current = { ingredients: [] };
    try {
      const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Could be array of strings (old format) or array of objects
        current.ingredients = parsed
          .map(item => {
            if (typeof item === 'string') return { title: item };
            if (item && typeof item === 'object')
              return {
                title: item.title || null,
                userId: item.userId || null,
                addedAt: item.addedAt || null
              };
            return null;
          })
          .filter(Boolean);
      } else if (parsed && Array.isArray(parsed.ingredients)) {
        current.ingredients = parsed.ingredients
          .map(item =>
            typeof item === 'string'
              ? { title: item }
              : {
                  title: item.title || null,
                  userId: item.userId || null,
                  addedAt: item.addedAt || null
                }
          )
          .filter(Boolean);
      }
    } catch {
      current = { ingredients: [] };
    }

    // Decide what to append: if we have a verified uid but no Firestore, store an object with userId.
    if (uid) {
      const exists = current.ingredients.some(it => it && it.title === title && it.userId === uid);
      if (!exists) {
        current.ingredients.push({ title: title, userId: uid, addedAt: new Date().toISOString() });
        await fs.writeFile(INGREDIENTS_FILE, JSON.stringify(current, null, 2), 'utf8');
        console.log(`Saved title to ingredients.json (user=${uid}): ${title}`);
      }
    } else {
      // No user id: preserve legacy behavior and store a plain string if it's not already present
      const hasString = current.ingredients.some(
        it => typeof it.title === 'string' && Object.keys(it).length === 1 && it.title === title
      );
      if (!hasString) {
        // We want to preserve the old top-level structure when possible. If the file previously
        // was a simple array of strings we will keep writing a plain array-of-strings inside
        // an object with `ingredients` for backward compatibility.
        let out = { ingredients: [] };
        out.ingredients = current.ingredients
          .map(it => (it && it.title ? it.title : null))
          .filter(Boolean);
        out.ingredients.push(title);
        await fs.writeFile(INGREDIENTS_FILE, JSON.stringify(out, null, 2), 'utf8');
        console.log(`Saved title to ingredients.json (anon): ${title}`);
      }
    }
    return;
  } catch (err) {
    // swallow errors but log
    console.warn('Error saving title to ingredients file/firestore', err);
  }
}

/**
 * Unified Product Lookup Pipeline
 * Cache-first with Firebase, Open Food Facts primary, UPCitemDB fallback
 */

// Cache TTL: 30 days
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Normalize Open Food Facts response to unified Product format
 */
function normalizeOpenFoodFacts(data) {
  if (!data || data.status !== 1 || !data.product) {
    return null;
  }
  const p = data.product;
  return {
    name: p.product_name || p.product_name_en || '',
    brand: p.brands || p.brand || '',
    image: p.image_url || p.image_front_url || p.image_front_small_url || '',
    ingredients: p.ingredients_text || p.ingredients_text_en || '',
    allergens: p.allergens || p.allergens_tags?.join(', ') || '',
    nutrition: p.nutriments || null,
    categories: p.categories || p.categories_tags?.join(', ') || '',
    source: 'Open Food Facts',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Normalize UPCitemDB response to unified Product format
 */
function normalizeUPCitemDB(data) {
  if (!data || data.code !== 'OK' || !data.items || data.items.length === 0) {
    return null;
  }
  const item = data.items[0];
  return {
    name: item.title || item.description || '',
    brand: item.brand || '',
    image: item.images?.[0] || item.image || '',
    ingredients: item.description || '',
    allergens: '',
    nutrition: null,
    categories: item.category || '',
    source: 'UPCitemDB',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Normalize UPC Database response to unified Product format
 */
function normalizeUPCDatabase(data) {
  if (!data || !data.title) {
    return null;
  }
  return {
    name: data.title || data.name || '',
    brand: data.brand || '',
    image: data.image || data.images?.[0] || '',
    ingredients: data.metadata?.ingredients || '',
    allergens: '',
    nutrition: null,
    categories: data.categories || data.category || '',
    source: 'UPC Database',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Merge product data, preferring OFF for ingredients/nutrition, UPC for image/title if missing
 */
function mergeProducts(primary, fallback) {
  if (!primary && !fallback) {
    return null;
  }
  if (!primary) {
    return fallback;
  }
  if (!fallback) {
    return primary;
  }

  return {
    name: primary.name || fallback.name || '',
    brand: primary.brand || fallback.brand || '',
    image: primary.image || fallback.image || '',
    ingredients: primary.ingredients || fallback.ingredients || '',
    allergens: primary.allergens || fallback.allergens || '',
    nutrition: primary.nutrition || fallback.nutrition || null,
    categories: primary.categories || fallback.categories || '',
    source: `${primary.source}${fallback.source ? ` + ${fallback.source}` : ''}`,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Check Firebase cache for product
 */
async function getCachedProduct(barcode) {
  if (!firestore) {
    return null;
  }
  try {
    const doc = await firestore.collection('products').doc(barcode).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    const lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : new Date(0);
    const age = Date.now() - lastUpdated.getTime();

    if (age < CACHE_TTL_MS) {
      console.log(
        `Cache hit for barcode ${barcode} (age: ${Math.round(age / (24 * 60 * 60 * 1000))} days)`
      );
      return data;
    }
    console.log(
      `Cache expired for barcode ${barcode} (age: ${Math.round(age / (24 * 60 * 60 * 1000))} days)`
    );
    return null;
  } catch (err) {
    console.warn('Error reading from cache:', err);
    return null;
  }
}

/**
 * Save product to Firebase cache
 */
async function saveProductToCache(barcode, product) {
  if (!firestore || !product) {
    return;
  }
  try {
    await firestore
      .collection('products')
      .doc(barcode)
      .set({
        ...product,
        barcode: barcode,
        cachedAt: new Date().toISOString()
      });
    console.log(`Cached product for barcode ${barcode}`);
  } catch (err) {
    console.warn('Error saving to cache:', err);
  }
}

/**
 * Fetch from Open Food Facts
 */
async function fetchOpenFoodFacts(barcode) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return normalizeOpenFoodFacts(data);
  } catch (err) {
    console.warn('Open Food Facts fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch from UPCitemDB
 */
async function fetchUPCitemDB(barcode) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return normalizeUPCitemDB(data);
  } catch (err) {
    console.warn('UPCitemDB fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch from UPC Database (existing API)
 */
async function fetchUPCDatabase(barcode) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const headers = { Accept: 'application/json' };
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const url = `${UPC_API_BASE}/product/${encodeURIComponent(barcode)}`;
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return normalizeUPCDatabase(data);
  } catch (err) {
    console.warn('UPC Database fetch failed:', err.message);
    return null;
  }
}

/**
 * Unified product lookup endpoint
 * GET /api/products/:barcode or GET /product/:id (backward compatible)
 */
async function unifiedProductLookup(barcode, req, res) {
  const startTime = Date.now();

  try {
    // Step 1: Check Firebase cache first
    const cached = await getCachedProduct(barcode);
    if (cached) {
      const duration = Date.now() - startTime;
      console.log(`Unified lookup: Cache hit (${duration}ms)`);
      return res.json({
        ok: true,
        source: 'cache',
        product: cached,
        duration: duration
      });
    }

    // Step 2: Try Open Food Facts (primary source)
    console.log('Unified lookup: Fetching from Open Food Facts...');
    let product = await fetchOpenFoodFacts(barcode);
    let source = 'Open Food Facts';

    // Step 3: Check if OFF result is complete (has name + image + ingredients)
    const isComplete = product && product.name && (product.image || product.ingredients);

    if (!isComplete) {
      // Step 4: Try UPCitemDB as fallback
      console.log('Unified lookup: OFF incomplete, trying UPCitemDB...');
      const upcitemdbProduct = await fetchUPCitemDB(barcode);

      if (upcitemdbProduct) {
        // Merge: prefer OFF for ingredients/nutrition, UPCitemDB for image/title if missing
        product = mergeProducts(product, upcitemdbProduct);
        source = product.source || 'UPCitemDB';
      } else {
        // Step 5: Try UPC Database as final fallback
        console.log('Unified lookup: UPCitemDB failed, trying UPC Database...');
        const upcProduct = await fetchUPCDatabase(barcode);
        if (upcProduct) {
          product = mergeProducts(product, upcProduct);
          source = product.source || 'UPC Database';
        }
      }
    }

    const duration = Date.now() - startTime;

    if (!product || !product.name) {
      console.log(`Unified lookup: Not found (${duration}ms)`);
      return res.json({
        ok: false,
        reason: 'not_found',
        message: 'Product not found in any database',
        duration: duration
      });
    }

    // Step 6: Save to cache
    await saveProductToCache(barcode, product);

    console.log(`Unified lookup: Success via ${source} (${duration}ms)`);
    return res.json({
      ok: true,
      source: source,
      product: product,
      duration: duration
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('Unified lookup error:', err);
    return res.status(500).json({
      ok: false,
      reason: 'error',
      message: err.message || 'Internal server error',
      duration: duration
    });
  }
}

// GET /product/:id (backward compatible - now uses unified lookup)
app.get('/product/:id', async (req, res) => {
  const id = req.params.id;

  // Use unified lookup if barcode is valid (8-14 digits)
  if (/^[0-9]{8,14}$/.test(id)) {
    return unifiedProductLookup(id, req, res);
  }

  // Fallback to old proxy for non-barcode requests
  const target = `${UPC_API_BASE}/product/${encodeURIComponent(id)}`;
  return proxyRequest(target, 'GET', req, res);
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const id = req.params.id;
  const target = `${UPC_API_BASE}/products/${encodeURIComponent(id)}`;
  return proxyRequest(target, 'GET', req, res);
});

// POST /products/:id
app.post('/products/:id', (req, res) => {
  const id = req.params.id;
  const target = `${UPC_API_BASE}/products/${encodeURIComponent(id)}`;
  return proxyRequest(target, 'POST', req, res);
});

// GET /search
app.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'missing q parameter' });
  }
  const target = `${UPC_API_BASE}/search?q=${encodeURIComponent(q)}`;
  return proxyRequest(target, 'GET', req, res);
});

// GET /user/ingredients
// Returns the list of ingredients/items scanned by the authenticated user.
app.get('/user/ingredients', async (req, res) => {
  const authHeader = req.headers && req.headers.authorization;

  // Try to initialize firebase-admin if credentials are present but not yet initialized
  if (
    !admin &&
    (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ) {
    initFirebaseAdmin();
  }

  if (admin && firestore) {
    if (!authHeader) return res.status(401).json({ error: 'missing_authorization' });
    try {
      const token = String(authHeader)
        .replace(/^Bearer\s+/i, '')
        .trim();
      const decoded = await admin.auth().verifyIdToken(token);
      const uid = decoded && decoded.uid;
      if (!uid) return res.status(401).json({ error: 'invalid_token' });

      const ref = firestore.collection('userIngredients').doc(uid).collection('items');
      const snapshot = await ref.orderBy('addedAt', 'desc').get();
      const items = snapshot.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          title: data.title || null,
          addedAt: data.addedAt && data.addedAt.toDate ? data.addedAt.toDate().toISOString() : null
        };
      });
      return res.json({ items });
    } catch (e) {
      console.warn('Failed to verify token or fetch user ingredients:', String(e));
      return res.status(401).json({ error: 'invalid_token' });
    }
  }

  // Firestore not available: attempt to read local file and filter objects with userId
  try {
    const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    let list = [];
    if (Array.isArray(parsed)) {
      // If array of objects with userId, attempt to filter by token
      if (!authHeader) return res.status(400).json({ error: 'firestore_not_configured_no_auth' });
      const token = String(authHeader)
        .replace(/^Bearer\s+/i, '')
        .trim();
      let uid = null;
      try {
        if (!admin) initFirebaseAdmin();
        if (admin) {
          const decoded = await admin.auth().verifyIdToken(token);
          uid = decoded && decoded.uid;
        }
      } catch (e) {
        console.warn('Failed to verify token against local fallback:', String(e));
      }
      if (!uid) return res.status(401).json({ error: 'invalid_token' });

      list = parsed
        .filter(item => item && typeof item === 'object' && item.userId === uid)
        .map(item => ({ title: item.title || null, addedAt: item.addedAt || null }));
      return res.json({ items: list });
    } else if (parsed && Array.isArray(parsed.ingredients)) {
      return res.status(501).json({ error: 'firestore_not_configured_file_has_no_user_data' });
    }
  } catch (e) {
    // File doesn't exist or is invalid
    return res.status(501).json({ error: 'firestore_not_configured_no_data' });
  }
});

app.listen(PORT, () => {
  console.log(`UPC proxy listening on http://localhost:${PORT}`);
});
