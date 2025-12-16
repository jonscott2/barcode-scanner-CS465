# Google Custom Search API - Quick Setup Guide

Follow these steps to enable fast product image searches using Google Images.

## Step 1: Get Google API Key (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" (or select an existing one)
   - Give it a name like "Barcode Scanner"
   - Click "Create"

3. **Enable Custom Search API**
   - In the left menu, go to **"APIs & Services"** > **"Library"**
   - Search for: `Custom Search API`
   - Click on "Custom Search API"
   - Click the blue **"Enable"** button

4. **Create API Key**
   - Go to **"APIs & Services"** > **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"API key"**
   - Your API key will be created! **Copy it** (you'll need it in Step 3)
   - (Optional) Click "Restrict key" to limit it to Custom Search API only

## Step 2: Create Custom Search Engine (3 minutes)

1. **Go to Google Custom Search**
   - Visit: https://cse.google.com/cse/
   - Sign in with the same Google account

2. **Create New Search Engine**
   - Click the **"+ Add"** button
   - In **"Sites to search"**, enter: `*` (asterisk - this searches the entire web)
   - In **"Name of the search engine"**, enter: `Product Images` (or any name)
   - Click **"Create"**

3. **Enable Image Search** (IMPORTANT!)
   - Click on your newly created search engine
   - Go to **"Setup"** tab (on the left)
   - Scroll down to **"Basics"** section
   - Find **"Image search"** and toggle it **ON** ✅
   - Click **"Update"** at the bottom

4. **Get Your Search Engine ID**
   - Still in the "Setup" tab
   - Look for **"Search engine ID"** (also called CX)
   - **Copy this ID** (you'll need it in Step 3)
   - It looks like: `017576662512468239146:omuauf_lfve`

## Step 3: Configure in Your App

You have two options:

### Option A: Environment Variables (Recommended for Production)

Create or edit a `.env` file in your project root:

```bash
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

Then restart your development server.

### Option B: Runtime Configuration (For Quick Testing)

Add this to `src/index.html` before the closing `</head>` tag:

```html
<script>
  window.__GOOGLE_SEARCH_CONFIG__ = {
    apiKey: 'YOUR_API_KEY_HERE',
    engineId: 'YOUR_ENGINE_ID_HERE'
  };
</script>
```

**Example:**
```html
<script>
  window.__GOOGLE_SEARCH_CONFIG__ = {
    apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    engineId: '017576662512468239146:omuauf_lfve'
  };
</script>
```

## Step 4: Test It!

1. **Restart your app** (if using environment variables)
2. **Scan a barcode** or view a product
3. **Check the console** - you should see images loading faster!

## Troubleshooting

### "API key not valid"
- ✅ Make sure you copied the entire API key
- ✅ Check that Custom Search API is enabled in Google Cloud Console
- ✅ Verify the API key isn't restricted incorrectly

### "Search engine not found"
- ✅ Make sure you copied the entire Search Engine ID
- ✅ Verify "Image search" is enabled in your CSE settings
- ✅ Check that you're using the correct ID (not the API key)

### Images still slow
- ✅ Check browser console for errors
- ✅ Verify the API key and Engine ID are correct
- ✅ Make sure Image search is enabled in CSE settings
- ✅ Check your Google Cloud Console for API usage/quota

### "Quota exceeded"
- Free tier: **100 requests per day**
- The app caches images for 24 hours to minimize API calls
- If you hit the limit, wait 24 hours or upgrade to paid tier

## What You Get

Once configured:
- ✅ **Faster image loading** (Google is prioritized)
- ✅ **More accurate images** (product packaging photos)
- ✅ **Better quality** (large, high-resolution images)
- ✅ **Automatic fallback** (if Google fails, uses other sources)

## Free Tier Limits

- **100 requests per day** (free)
- **$5 per 1,000 requests** (paid tier)

**Note:** The app caches images for 24 hours, so repeated scans of the same product won't use additional API calls!

## Need Help?

If you get stuck:
1. Check the browser console for error messages
2. Verify both API key and Engine ID are correct
3. Make sure Image search is enabled in CSE
4. Check Google Cloud Console for API usage/quota

---

**That's it!** Once you add the API key and Engine ID, product images will load much faster! 🚀


