# 📊 API Usage Summary - Which APIs Are Actually Used?

This document shows which APIs from your `.env` file are actually used in the application.

---

## ✅ **ACTIVELY USED APIs**

### 1. **UPC_API_KEY** ✅ REQUIRED
- **Used in:** 
  - `src/js/constants.js` → `ITEM_INFO_API_KEY`
  - `src/js/helpers/fetchItemInfo.js` (for product lookups)
  - `server/proxy.js` (local proxy server)
  - `netlify/functions/upc.js` (Netlify function)
- **Purpose:** Fetches product information when barcodes are scanned
- **Status:** ✅ **REQUIRED** - App won't work properly without this

### 2. **SPOONACULAR_API_KEY** ✅ USED
- **Used in:**
  - `src/js/services/recipe-api.js` (for recipe generation)
  - `server/RecipeDB.js` (recipe proxy server)
- **Purpose:** Generates recipes based on scanned ingredients
- **Status:** ✅ **USED** - Recipes feature requires this

### 3. **SENTRY_DSN** ✅ USED
- **Used in:**
  - `src/js/sentry.config.js`
  - `src/index.jsx` (Sentry initialization)
- **Purpose:** Error monitoring and tracking
- **Status:** ✅ **USED** - Error tracking feature

### 4. **UNSPLASH_ACCESS_KEY** ✅ USED
- **Used in:**
  - `src/js/services/image-search.js` (searches for product images)
  - `src/js/constants.js`
- **Purpose:** Finds product images when UPC API doesn't provide one
- **Status:** ✅ **USED** - Image search feature (optional but recommended)
- **Note:** `UNSPLASH_SECRET_KEY` is **NOT used** - only the Access Key is needed

### 5. **GOOGLE_SEARCH_API_KEY** ✅ USED
- **Used in:**
  - `src/js/services/image-search.js` (Google Images search)
  - `src/js/constants.js`
- **Purpose:** Alternative image search source
- **Status:** ✅ **USED** - Image search feature (optional but recommended)

### 6. **GOOGLE_SEARCH_ENGINE_ID** ✅ USED
- **Used in:**
  - `src/js/services/image-search.js` (required with Google API key)
  - `src/js/constants.js`
- **Purpose:** Required for Google Custom Search API
- **Status:** ✅ **USED** - Must be set if using Google Search API

### 7. **PIXABAY_API_KEY** ✅ USED (Optional)
- **Used in:**
  - `src/js/services/image-search.js` (Pixabay image search)
  - `src/js/constants.js`
- **Purpose:** Another image search source (best free tier)
- **Status:** ✅ **USED** - Image search feature (optional, works without key but better with it)

---

## ❌ **NOT USED APIs**

### 1. **UNSPLASH_SECRET_KEY** ❌ NOT USED
- **Status:** ❌ **NOT USED** - Only `UNSPLASH_ACCESS_KEY` is needed
- **Recommendation:** You can remove this from `.env` (it won't hurt to keep it, but it's not used)

---

## 📋 **Configuration Variables**

### **ITEM_INFO_PROXY_URL** ✅ USED
- **Used in:**
  - `src/js/constants.js`
  - `src/js/helpers/fetchItemInfo.js`
- **Purpose:** Tells app to use server-side proxy instead of direct API calls
- **Status:** ✅ **USED** - Required for Netlify deployment

### **PORT, RECIPE_PORT, INGREDIENTS_FILE** ✅ USED
- **Used in:**
  - `server/proxy.js` (PORT)
  - `server/RecipeDB.js` (RECIPE_PORT)
- **Purpose:** Server configuration for local development
- **Status:** ✅ **USED** - Only needed for local server development

---

## 🎯 **Summary Table**

| API Key | Used? | Required? | Purpose |
|---------|-------|------------|---------|
| `UPC_API_KEY` | ✅ Yes | ✅ **REQUIRED** | Product information lookup |
| `SPOONACULAR_API_KEY` | ✅ Yes | ⚠️ For recipes | Recipe generation |
| `SENTRY_DSN` | ✅ Yes | ⚠️ Optional | Error monitoring |
| `UNSPLASH_ACCESS_KEY` | ✅ Yes | ⚠️ Optional | Image search |
| `UNSPLASH_SECRET_KEY` | ❌ No | ❌ Not needed | (Not used) |
| `GOOGLE_SEARCH_API_KEY` | ✅ Yes | ⚠️ Optional | Image search |
| `GOOGLE_SEARCH_ENGINE_ID` | ✅ Yes | ⚠️ Optional | Image search (with Google) |
| `PIXABAY_API_KEY` | ✅ Yes | ⚠️ Optional | Image search |
| `ITEM_INFO_PROXY_URL` | ✅ Yes | ✅ For Netlify | API proxy configuration |

---

## 💡 **Recommendations**

### **Minimum Required for Basic Functionality:**
1. ✅ `UPC_API_KEY` - **MUST HAVE**
2. ✅ `ITEM_INFO_PROXY_URL` - **MUST HAVE** (for Netlify)

### **Recommended for Full Features:**
3. ✅ `SPOONACULAR_API_KEY` - For recipe feature
4. ✅ `UNSPLASH_ACCESS_KEY` - For product images
5. ✅ `GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_ENGINE_ID` - Alternative images
6. ✅ `PIXABAY_API_KEY` - Best free tier for images
7. ✅ `SENTRY_DSN` - Error tracking

### **Can Remove:**
- ❌ `UNSPLASH_SECRET_KEY` - Not used by the app

---

## 🔍 **How Image Search Works**

The app tries multiple sources in order:
1. **Cache** - Checks if image was already found
2. **Unsplash** - If `UNSPLASH_ACCESS_KEY` is set
3. **Google Images** - If `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
4. **Pixabay** - If `PIXABAY_API_KEY` is set (works without key but better with it)
5. **Placeholder** - Falls back to a generic placeholder image

**More keys = Better image search results!**

---

## 📝 **For Netlify Deployment**

**Required:**
- `UPC_API_KEY`
- `ITEM_INFO_PROXY_URL`

**Recommended:**
- `SPOONACULAR_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`
- `PIXABAY_API_KEY`
- `SENTRY_DSN`

**Don't need:**
- `UNSPLASH_SECRET_KEY` (not used)

---

**Last Updated:** Current Session

