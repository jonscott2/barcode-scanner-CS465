# Google API Key Configuration Guide

## Current Step: Configure Your API Key

You're on the "Create API key" page. Here's how to configure it properly:

## Recommended Settings

### 1. Name Your API Key
- **Name**: Enter something descriptive like `Barcode Scanner Image Search` or `Product Image Search API Key`
- This helps you identify it later

### 2. Application Restrictions (IMPORTANT for Security)

**Option A: For Local Development (Easier)**
- Select **"None"** under Application restrictions
- This allows the key to work from any location (localhost, etc.)
- ⚠️ **Less secure** - only use for testing

**Option B: For Production (Recommended)**
- Keep **"Websites"** selected
- Click the **"Add"** button
- Add your website domains:
  - For localhost testing: `http://localhost:*` or `http://127.0.0.1:*`
  - For production: `https://yourdomain.com` and `https://*.yourdomain.com`
  - For Firebase hosting: `https://your-project.web.app` and `https://your-project.firebaseapp.com`

**Example for Firebase:**
```
https://barcode-scanner-cs465.web.app
https://barcode-scanner-cs465.firebaseapp.com
http://localhost:*
```

### 3. API Restrictions (IMPORTANT for Security)

**Recommended: Restrict the Key**
1. Select **"Restrict key"** (instead of "Don't restrict key")
2. Click **"Select APIs"** dropdown
3. Search for and select: **"Custom Search API"**
4. This ensures the key can ONLY be used for image search, not other Google services

**Why restrict?**
- Prevents unauthorized use of your key
- Limits potential costs if key is exposed
- Better security practice

### 4. Create the Key
- Click the blue **"Create"** button
- **IMPORTANT**: Copy your API key immediately! You won't be able to see it again.
- It will look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Next Steps After Creating the Key

### Step 1: Get Your Search Engine ID

1. Go to: https://cse.google.com/cse/
2. Click on your search engine (or create one if you haven't)
3. Go to **"Setup"** tab
4. Find **"Search engine ID"** (also called CX)
5. Copy it (looks like: `017576662512468239146:omuauf_lfve`)
6. Make sure **"Image search"** is enabled in the Basics section

### Step 2: Add to Your App

Add this to `src/index.html` right after the Firebase config:

```html
  <!-- Google Custom Search Configuration -->
  <script>
    window.__GOOGLE_SEARCH_CONFIG__ = {
      apiKey: 'PASTE_YOUR_API_KEY_HERE',
      engineId: 'PASTE_YOUR_ENGINE_ID_HERE'
    };
  </script>
```

### Step 3: Test It

1. Save the file
2. Restart your app
3. Scan a barcode
4. Images should load much faster!

## Security Notes

- ⚠️ **Never commit API keys to public repositories**
- ✅ Use environment variables for production
- ✅ Restrict the key to specific APIs and websites
- ✅ Monitor usage in Google Cloud Console

## Quick Configuration Summary

**For Testing:**
- Application restrictions: **None**
- API restrictions: **Restrict key** → Select "Custom Search API"

**For Production:**
- Application restrictions: **Websites** → Add your domains
- API restrictions: **Restrict key** → Select "Custom Search API"

## Need Help?

If you get stuck:
1. You can always edit the key later in Google Cloud Console
2. Check browser console for error messages
3. Verify both API key and Engine ID are correct


