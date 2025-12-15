# Google Custom Search API Setup for Product Images

## Quick Setup

To enable fast Google image search for products, you need:

1. **Google Custom Search API Key**
2. **Custom Search Engine ID**

## Step-by-Step Instructions

### 1. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"

4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Create Custom Search Engine

1. Go to [Google Custom Search](https://cse.google.com/cse/)
2. Click "Add" to create a new search engine
3. In "Sites to search", enter: `*` (to search the entire web)
4. Click "Create"
5. Go to "Setup" > "Basics"
6. Enable **"Image search"** toggle
7. Copy your **Search Engine ID** (looks like: `017576662512468239146:omuauf_lfve`)

### 3. Configure in Your App

#### Option A: Environment Variables (Recommended)

Add to your `.env` file:
```bash
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

#### Option B: Build Time

```bash
export GOOGLE_SEARCH_API_KEY=your_key
export GOOGLE_SEARCH_ENGINE_ID=your_id
npm run build
```

#### Option C: Runtime (Browser) - Easiest!

Add to `src/index.html` before the closing `</head>` tag:
```html
<script>
  window.__GOOGLE_SEARCH_CONFIG__ = {
    apiKey: 'your_api_key_here',
    engineId: 'your_engine_id_here'
  };
</script>
```

This works immediately without rebuilding!

## Free Tier Limits

- **100 requests per day** (free tier)
- **$5 per 1,000 requests** (paid tier)

The app includes caching to minimize API calls. Images are cached for 24 hours.

## Benefits

✅ **Fast**: Google typically responds in < 500ms  
✅ **Accurate**: Great at finding product packaging images  
✅ **High Quality**: Large, high-resolution product images  
✅ **Reliable**: Google's infrastructure is very stable  

## Testing

After setup, test with:
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_ENGINE_ID&q=spaghetti+product+packaging&searchType=image&num=1"
```

## Need Help?

If you have the API key and Engine ID, I can help you configure it! Just provide:
- API Key (starts with `AIza...`)
- Search Engine ID (looks like `017576662512468239146:omuauf_lfve`)
