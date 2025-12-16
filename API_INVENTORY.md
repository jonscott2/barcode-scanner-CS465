# 📡 Complete API Inventory

## Overview
Your app integrates **10+ APIs** across product lookup, recipes, images, and authentication. Here's the complete breakdown:

---

## 🛒 **Product Information APIs** (Barcode Lookup)

### 1. **Open Food Facts** ✅ (Primary - Unified Pipeline)
- **Status:** ✅ Active & Working
- **Endpoint:** `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **API Key:** ❌ Not Required (Free)
- **Rate Limit:** Unlimited (free, open database)
- **Best For:** Food products, ingredients, nutrition data
- **Features:**
  - Product name, brand, ingredients
  - Full nutrition facts
  - Allergen information
  - Product images
  - Categories
- **Location:** `src/js/helpers/fetchItemInfo.js` (Primary source in unified pipeline)
- **Proxy:** ✅ Via unified pipeline at `server/proxy.js`

### 2. **UPCitemDB** ✅ (Fallback - Unified Pipeline)
- **Status:** ✅ Active & Working
- **Endpoint:** `https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}`
- **API Key:** ❌ Not Required (Free tier)
- **Rate Limit:** 100 requests/day (free tier)
- **Best For:** General products, product images
- **Features:**
  - Product title
  - Brand information
  - Product images
  - Category
- **Location:** `server/proxy.js` (Unified pipeline fallback)
- **Proxy:** ✅ Via unified pipeline

### 3. **UPC Database** ✅ (Final Fallback - Unified Pipeline)
- **Status:** ✅ Active & Working (if API key configured)
- **Endpoint:** `https://api.upcdatabase.org/product/{barcode}`
- **API Key:** ⚠️ Optional (Better rate limits with key)
- **Rate Limit:** Limited without key, higher with key
- **Best For:** General product information
- **Features:**
  - Product title
  - Brand
  - Description
  - Images
- **Location:** `server/proxy.js` (Unified pipeline final fallback)
- **Proxy:** ✅ `http://localhost:8787` (local) or configured proxy

### 4. **SearchUPCData** ⚠️ (Parallel Fetch)
- **Status:** ⚠️ Sometimes Unavailable (DNS issues)
- **Endpoint:** `https://www.searchupcdata.com/api/v1/product/{barcode}`
- **API Key:** ❌ Not Required
- **Rate Limit:** Free tier available
- **Best For:** Fast lookups (sub-100ms when working)
- **Features:**
  - Product name
  - Brand/manufacturer
  - Category
  - Images
- **Location:** `src/js/helpers/fetchItemInfo.js`
- **Note:** Disabled in unified pipeline due to reliability issues

### 5. **Open Beauty Facts** ✅ (Parallel Fetch)
- **Status:** ✅ Active & Working
- **Endpoint:** `https://world.openbeautyfacts.org/api/v0/product/{barcode}.json`
- **API Key:** ❌ Not Required (Free)
- **Rate Limit:** Unlimited (free, open database)
- **Best For:** Cosmetics, beauty products
- **Features:**
  - Product name
  - Brand
  - Categories
  - Images
- **Location:** `src/js/helpers/fetchItemInfo.js`

### 6. **GTIN Search** ⚠️ (Parallel Fetch)
- **Status:** ⚠️ Sometimes Returns 404
- **Endpoint:** `https://gtinsearch.org/api/v1/products/{barcode}`
- **API Key:** ❌ Not Required
- **Rate Limit:** Unknown
- **Best For:** GTIN/UPC lookups
- **Features:**
  - Product name
  - Brand
  - Category
  - GTIN information
- **Location:** `src/js/helpers/fetchItemInfo.js`

### 7. **Barcode Lookup** ❌ (Disabled)
- **Status:** ❌ Disabled (CORS issues with demo key)
- **Endpoint:** `https://api.barcodelookup.com/v3/products?barcode={barcode}`
- **API Key:** ⚠️ Required (Demo key causes CORS errors)
- **Rate Limit:** Limited with demo key
- **Note:** Would need real API key to work
- **Location:** `src/js/helpers/fetchItemInfo.js` (enabled: false)

---

## 🍳 **Recipe APIs**

### 8. **Spoonacular API** ✅
- **Status:** ✅ Active & Working
- **Endpoint:** `https://api.spoonacular.com/recipes`
- **API Key:** ⚠️ Required (Set via `SPOONACULAR_API_KEY` env var)
- **Rate Limit:** Free tier: 150 requests/day
- **Best For:** Recipe generation, nutrition info, cooking instructions
- **Features:**
  - Recipe search by ingredients
  - Full recipe details (instructions, ingredients, nutrition)
  - Recipe images
  - Cooking time, servings
  - Missing ingredients list
- **Location:** `src/js/services/recipe-api.js`
- **Proxy:** ✅ `http://localhost:8788` (local) via `server/RecipeDB.js`
- **Caching:** ✅ 30-minute cache for searches, 1-hour for details

---

## 🖼️ **Image Search APIs**

### 9. **Google Custom Search API** ✅
- **Status:** ✅ Active & Working (if configured)
- **Endpoint:** `https://www.googleapis.com/customsearch/v1`
- **API Key:** ⚠️ Required (Set via `GOOGLE_SEARCH_API_KEY` or `window.__GOOGLE_SEARCH_CONFIG__`)
- **Search Engine ID:** ⚠️ Required (Set via `GOOGLE_SEARCH_ENGINE_ID`)
- **Rate Limit:** Free tier: 100 requests/day
- **Best For:** Fast, accurate product images
- **Features:**
  - Product packaging images
  - High-quality results
  - Fast response times
- **Location:** `src/js/services/image-search.js`
- **Priority:** Highest (tried first for speed)

### 10. **Unsplash API** ✅
- **Status:** ✅ Active & Working (if configured)
- **Endpoint:** `https://api.unsplash.com/search/photos`
- **API Key:** ⚠️ Optional (Better with key)
- **Rate Limit:** Free tier: 50 requests/hour
- **Best For:** High-quality food/product photography
- **Features:**
  - Beautiful product images
  - Multiple image sizes
  - Curated content
- **Location:** `src/js/services/image-search.js`

### 11. **Pixabay API** ✅
- **Status:** ✅ Active & Working (if configured)
- **Endpoint:** `https://pixabay.com/api/`
- **API Key:** ⚠️ Optional (Better with key)
- **Rate Limit:** Free tier: 5,000 requests/hour
- **Best For:** General product images
- **Features:**
  - Large image library
  - Free to use
  - Good coverage
- **Location:** `src/js/services/image-search.js`
- **Note:** Query formatting improved to prevent 400 errors

---

## 🔐 **Authentication & Database APIs**

### 12. **Firebase Authentication** ✅
- **Status:** ✅ Active & Working (if configured)
- **Endpoint:** Firebase Cloud
- **API Key:** ⚠️ Required (Set via `window.__FIREBASE_CONFIG__`)
- **Rate Limit:** Generous free tier
- **Best For:** User authentication, session management
- **Features:**
  - Email/password login
  - Anonymous sign-in
  - User session management
  - Auto-redirect after login
- **Location:** `src/js/services/firebase-auth.js`
- **Fallback:** ✅ Works without Firebase (local-only mode)

### 13. **Firebase Firestore** ✅
- **Status:** ✅ Active & Working (if configured)
- **Endpoint:** Firebase Cloud
- **API Key:** ⚠️ Required (Set via `window.__FIREBASE_CONFIG__`)
- **Rate Limit:** Generous free tier
- **Best For:** Cloud storage, data sync, offline support
- **Features:**
  - Scan history storage
  - Real-time sync across devices
  - Offline support with auto-sync
  - User-specific data isolation
- **Location:** `src/js/services/firebase-scans.js`
- **Fallback:** ✅ Works without Firebase (localStorage)

---

## 🎯 **Browser APIs** (Native, No Keys Required)

### 14. **Barcode Detection API** ✅
- **Status:** ✅ Always Available
- **Type:** Browser Native API
- **API Key:** ❌ Not Required
- **Best For:** Detecting barcodes from camera/image
- **Supported Formats:**
  - QR codes, UPC-A, UPC-E, EAN-13, EAN-8
  - Code 128, Code 39, Code 93
  - Data Matrix, PDF417, Aztec, ITF, Codabar
- **Location:** `src/js/helpers/BarcodeReader.js`
- **Fallback:** ✅ Polyfill via `barcode-detector` npm package

---

## 🔄 **Unified Barcode Lookup Pipeline**

### **New Architecture** (Recently Implemented)
- **Endpoint:** `GET /product/:barcode` (via proxy)
- **Location:** `server/proxy.js`
- **Strategy:**
  1. ✅ **Firebase Cache First** (30-day TTL) - Instant if cached
  2. ✅ **Open Food Facts** (Primary source)
  3. ✅ **UPCitemDB** (Fallback if OFF incomplete)
  4. ✅ **UPC Database** (Final fallback)
- **Benefits:**
  - Cache hits: < 50ms
  - Cache misses: 1-3 seconds
  - Normalized response format
  - Automatic caching
  - Multiple fallbacks for reliability

---

## 📊 **API Status Summary**

| API | Status | Key Required | Free Tier | Primary Use |
|-----|--------|--------------|-----------|-------------|
| Open Food Facts | ✅ Active | ❌ No | ✅ Unlimited | Food products |
| UPCitemDB | ✅ Active | ❌ No | ✅ 100/day | Product fallback |
| UPC Database | ✅ Active | ⚠️ Optional | ⚠️ Limited | Final fallback |
| SearchUPCData | ⚠️ Unreliable | ❌ No | ✅ Yes | Fast lookups |
| Open Beauty Facts | ✅ Active | ❌ No | ✅ Unlimited | Beauty products |
| GTIN Search | ⚠️ Sometimes 404 | ❌ No | ✅ Yes | GTIN lookups |
| Barcode Lookup | ❌ Disabled | ⚠️ Yes | ⚠️ Limited | General products |
| Spoonacular | ✅ Active | ⚠️ Yes | ✅ 150/day | Recipes |
| Google Search | ✅ Active | ⚠️ Yes | ✅ 100/day | Product images |
| Unsplash | ✅ Active | ⚠️ Optional | ✅ 50/hour | Product images |
| Pixabay | ✅ Active | ⚠️ Optional | ✅ 5000/hour | Product images |
| Firebase Auth | ✅ Active | ⚠️ Yes | ✅ Generous | Authentication |
| Firebase Firestore | ✅ Active | ⚠️ Yes | ✅ Generous | Data storage |
| Barcode Detection | ✅ Active | ❌ No | ✅ Always | Barcode scanning |

---

## 🔑 **API Keys Configuration**

### **Required Keys:**
1. **Spoonacular API Key** - For recipes
   - Get from: https://spoonacular.com/food-api
   - Set: `SPOONACULAR_API_KEY` env var

2. **Firebase Config** - For auth & storage (optional)
   - Get from: Firebase Console
   - Set: `window.__FIREBASE_CONFIG__` in `index.html`

### **Optional Keys (Better Performance):**
1. **Google Custom Search API Key + Engine ID** - For fast images
   - Get from: https://developers.google.com/custom-search
   - Set: `window.__GOOGLE_SEARCH_CONFIG__` in `index.html`

2. **Unsplash Access Key** - For high-quality images
   - Get from: https://unsplash.com/developers
   - Set: `UNSPLASH_ACCESS_KEY` env var

3. **Pixabay API Key** - For more image results
   - Get from: https://pixabay.com/api/docs/
   - Set: `PIXABAY_API_KEY` env var

4. **UPC Database API Key** - For better rate limits
   - Get from: https://upcdatabase.org
   - Set: `UPC_API_KEY` env var

---

## 🚀 **API Usage Flow**

### **Product Lookup Flow:**
```
1. Scan Barcode
   ↓
2. Check Firebase Cache (if configured)
   ↓ (if not cached)
3. Try Unified Pipeline:
   - Open Food Facts (primary)
   - UPCitemDB (fallback)
   - UPC Database (final fallback)
   ↓
4. Save to Firebase Cache
   ↓
5. Display Product Info
   ↓
6. Search for Product Image:
   - Google Custom Search (if configured)
   - Unsplash (if configured)
   - Pixabay (if configured)
   - Placeholder (fallback)
```

### **Recipe Generation Flow:**
```
1. Select Ingredients
   ↓
2. Check Recipe Cache (30 min TTL)
   ↓ (if not cached)
3. Try Recipe Proxy (localhost:8788)
   ↓ (if proxy fails)
4. Try Spoonacular API Direct
   ↓
5. Cache Results
   ↓
6. Display Recipes
```

---

## 📝 **Notes**

- **Unified Pipeline:** New cache-first architecture improves speed and reliability
- **Fallback Strategy:** Multiple APIs ensure high success rate
- **Caching:** Reduces API calls and improves performance
- **Proxy Support:** Avoids CORS issues and keeps API keys secure
- **Graceful Degradation:** App works even if some APIs fail

---

## 🎯 **Recommendations**

1. **Configure Google Search API** - Fastest image results
2. **Set up Firebase** - Better data persistence and sync
3. **Get Spoonacular Key** - Essential for recipe features
4. **Optional:** Unsplash/Pixabay keys for more image options


