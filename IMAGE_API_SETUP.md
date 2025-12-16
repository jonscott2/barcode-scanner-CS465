# Image Generation & API Enhancement Guide

## Overview

The barcode scanner now includes enhanced API functionality and automatic image generation/search for products. When a product is scanned, the system will automatically search for matching product images from multiple sources if the product API doesn't provide one.

## New Features

### 1. **Enhanced Image Search Service**
- Automatically finds product images when APIs don't provide them
- Uses multiple image sources: Unsplash, Google Custom Search, Pixabay
- Intelligent fallback chain: API image → Unsplash → Google Images → Pixabay → Placeholder
- Image validation to ensure URLs are accessible
- 24-hour caching for faster subsequent lookups

### 2. **Improved API Functionality**
- **Retry Logic**: Automatic retry on network errors and 5xx server errors
- **Better Error Handling**: More graceful handling of API failures
- **Optimized Timeouts**: Different timeouts for different API sources based on their typical response times
- **Enhanced Metadata**: Products now include fetch timestamp and barcode in metadata

### 3. **Multiple Product Information Sources**
The system now queries multiple APIs in parallel:
- SearchUPCData (fast, sub-200ms)
- Open Food Facts (free, no key required)
- GTIN Search (free, open database)
- UPC Database (primary configured API)
- Open Beauty Facts (for cosmetics)
- Barcode Lookup (free tier available)

## API Configuration

### Image Search APIs (Optional but Recommended)

#### 1. Unsplash API (Recommended)
**Free Tier**: 50 requests/hour
**Setup**:
1. Go to https://unsplash.com/developers
2. Create a new application
3. Copy your Access Key
4. Set environment variable: `UNSPLASH_ACCESS_KEY=your_key_here`

#### 2. Google Custom Search API
**Free Tier**: 100 requests/day
**Setup**:
1. Go to https://developers.google.com/custom-search/v1/overview
2. Create a new project and enable Custom Search API
3. Create a Custom Search Engine at https://cse.google.com/cse/
4. Enable "Image search" in your CSE settings
5. Get your API Key and Search Engine ID
6. Set environment variables:
   - `GOOGLE_SEARCH_API_KEY=your_key_here`
   - `GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here`

#### 3. Pixabay API (Optional)
**Free Tier**: 5,000 requests/hour
**Setup**:
1. Go to https://pixabay.com/api/docs/
2. Get your API key
3. Set environment variable: `PIXABAY_API_KEY=your_key_here`

**Note**: Pixabay works without a key but with limited functionality. A key is recommended for better results.

### Setting Environment Variables

#### For Local Development:
Create a `.env` file in the project root:
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_key
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_engine_id
PIXABAY_API_KEY=your_pixabay_key
```

#### For Production (Firebase/Netlify):
Set these as environment variables in your hosting platform's dashboard.

#### For Build Time:
If using Parcel or similar, you can set them during build:
```bash
UNSPLASH_ACCESS_KEY=xxx npm run build
```

## How It Works

1. **Product Scan**: User scans a barcode
2. **Product Info Fetch**: System queries multiple product APIs in parallel
3. **Image Check**: If product API provides an image, it's validated
4. **Image Search**: If no valid image, system searches:
   - Unsplash (if configured)
   - Google Custom Search (if configured)
   - Pixabay (works without key)
5. **Fallback**: If all searches fail, a styled placeholder is generated
6. **Display**: Image is shown with smooth fade-in animation

## Image Search Priority

The system tries image sources in this order:
1. **Existing API Image** (from product API response)
2. **Cache** (if image was found previously)
3. **Unsplash** (high quality, curated images)
4. **Google Custom Search** (comprehensive product images)
5. **Pixabay** (free stock photos)
6. **Placeholder** (always available, styled with product name)

## Benefits

- **Better User Experience**: Products always have images, even if APIs don't provide them
- **Faster Loading**: Parallel API calls and intelligent caching
- **More Reliable**: Retry logic and multiple fallbacks
- **Cost Effective**: Uses free tiers of image APIs
- **No Breaking Changes**: Works without any API keys (uses placeholders)

## Usage Examples

### Basic Usage (No Configuration Required)
The system works out of the box with placeholder images. No setup needed!

### With Unsplash Only
```bash
export UNSPLASH_ACCESS_KEY=your_key
npm start
```

### With All APIs Configured
```bash
export UNSPLASH_ACCESS_KEY=your_key
export GOOGLE_SEARCH_API_KEY=your_key
export GOOGLE_SEARCH_ENGINE_ID=your_id
export PIXABAY_API_KEY=your_key
npm start
```

## API Rate Limits

Be aware of rate limits:
- **Unsplash**: 50 requests/hour (free tier)
- **Google Custom Search**: 100 requests/day (free tier)
- **Pixabay**: 5,000 requests/hour (free tier)

The system includes caching to minimize API calls. Images are cached for 24 hours.

## Troubleshooting

### Images Not Showing
1. Check browser console for errors
2. Verify API keys are set correctly
3. Check network tab for failed requests
4. Ensure CORS is not blocking requests (shouldn't be an issue with these APIs)

### Slow Image Loading
1. Images are loaded asynchronously and don't block the UI
2. Check your internet connection
3. Consider configuring more image APIs for better coverage

### API Errors
- The system gracefully handles API failures
- If one API fails, it tries the next one
- Placeholder images ensure something always displays

## Future Enhancements

Potential future improvements:
- AI-generated product images using DALL-E or similar
- User-uploaded product images
- Image gallery view with multiple product angles
- Image quality scoring and selection

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify API keys are correctly configured
3. Ensure environment variables are set before building/running


