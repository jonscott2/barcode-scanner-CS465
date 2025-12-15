# Google Custom Search API Setup Guide

## Why Google Custom Search?

Google Custom Search API is **prioritized** for product image searches because it:
- ✅ **Fastest response time** (typically < 1 second)
- ✅ **Most accurate** product images
- ✅ **Large database** of product photos
- ✅ **Optimized queries** for product packaging images

## Setup Instructions

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"

### Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. (Optional) Restrict the API key to "Custom Search API" for security

### Step 3: Create Custom Search Engine

1. Go to [Google Custom Search](https://cse.google.com/cse/)
2. Click "Add" to create a new search engine
3. In "Sites to search", enter: `*` (to search the entire web)
4. Click "Create"
5. Go to "Setup" > "Basics"
6. Enable **"Image search"** (important!)
7. Copy your **Search Engine ID** (also called CX)

### Step 4: Configure in Your App

#### Option 1: Environment Variables (Recommended for Production)

```bash
export GOOGLE_SEARCH_API_KEY="your_api_key_here"
export GOOGLE_SEARCH_ENGINE_ID="your_engine_id_here"
```

Or add to your `.env` file:
```
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

#### Option 2: Runtime Configuration (For Testing)

Add to `src/index.html` before closing `</head>`:

```html
<script>
  window.__GOOGLE_SEARCH_CONFIG__ = {
    apiKey: 'your_api_key_here',
    engineId: 'your_engine_id_here'
  };
</script>
```

## Free Tier Limits

- **100 requests per day** (free tier)
- **$5 per 1,000 additional requests** (paid tier)

**Note**: The app includes caching to minimize API calls. Images are cached for 24 hours.

## Testing

After setup, test with:

```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_ENGINE_ID&q=spaghetti+product+packaging&searchType=image&num=1"
```

## Troubleshooting

### "API key not valid"
- Verify the API key is correct
- Check that Custom Search API is enabled
- Ensure the API key isn't restricted incorrectly

### "Search engine not found"
- Verify the Search Engine ID (CX) is correct
- Ensure "Image search" is enabled in your CSE settings

### "Quota exceeded"
- You've hit the 100 requests/day limit
- Wait 24 hours or upgrade to paid tier
- Check cache is working (reduces API calls)

## Benefits

Once configured, product images will:
- ✅ Load **much faster** (Google is prioritized)
- ✅ Be **more accurate** (product packaging images)
- ✅ Have **better quality** (large, high-resolution images)

The system will automatically fall back to other sources (Unsplash, Pixabay) if Google fails or isn't configured.

