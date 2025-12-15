# API Test Results

## Server Status

### ✅ UPC Proxy Server (Port 8787)
- **Status**: Running
- **Command**: `npm run start:proxy` or `node server/proxy.js`
- **API Key**: Set via `UPC_API_KEY` environment variable
- **Test**: `curl http://localhost:8787/product/049000050103`

### ✅ Recipe API Server (Port 8788)
- **Status**: Running
- **Command**: `node server/RecipeDB.js`
- **API Key**: Set via `UPC_API_KEY2` or `SPOONACULAR_API_KEY` environment variable
- **Test**: `curl "http://localhost:8788/recipes/from-file?ingredients=chicken,rice&number=5"`

## External APIs

### ✅ Open Food Facts
- **Status**: Working
- **URL**: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **No API Key Required**: Free and open
- **Rate Limits**: None (reasonable use)

### ✅ Pixabay
- **Status**: Working (may have rate limits)
- **URL**: `https://pixabay.com/api/`
- **API Key**: Optional (better with key)
- **Rate Limits**: 5,000 requests/hour (free tier)

### ⚠️ GTIN Search
- **Status**: May be rate limited
- **URL**: `https://gtinsearch.org/api/v1/products/{barcode}`
- **No API Key Required**: Free
- **Rate Limits**: Unknown

### ⚠️ Image Search APIs (Optional)
- **Unsplash**: Requires API key (50 requests/hour free)
- **Google Custom Search**: Requires API key (100 requests/day free)

## How to Start All Servers

### Quick Start (Terminal 1 - UPC Proxy)
```bash
export UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

### Quick Start (Terminal 2 - Recipe API)
```bash
node server/RecipeDB.js
```

### Or Use the Test Script
```bash
node test-apis.js
```

## Verification

To verify all APIs are working:

1. **UPC Proxy**: 
   ```bash
   curl http://localhost:8787/product/049000050103
   ```
   Should return product information for Coca-Cola

2. **Recipe API**:
   ```bash
   curl "http://localhost:8788/recipes/from-file?ingredients=chicken,rice&number=3"
   ```
   Should return recipe suggestions

3. **Open Food Facts**:
   ```bash
   curl "https://world.openfoodfacts.org/api/v0/product/049000050103.json"
   ```
   Should return product data

## Troubleshooting

### Servers Not Starting
- Check if ports 8787 and 8788 are already in use
- Verify Node.js is installed: `node --version`
- Check for errors in console output

### API Errors
- Verify API keys are set correctly
- Check network connectivity
- Review server logs in `/tmp/proxy.log` and `/tmp/recipe.log`

### Rate Limiting
- Some APIs have rate limits
- The system includes caching to minimize API calls
- Consider adding API keys for better limits

