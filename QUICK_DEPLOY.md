# 🚀 Quick Deploy to Test on Phone

## One-Command Deployment

```bash
./deploy.sh
```

Or manually:

```bash
npm run build
npm run deploy:firebase
```

## Your App Will Be Live At:

- **https://barcode-scanner-cs465.web.app**
- **https://barcode-scanner-cs465.firebaseapp.com**

## Test on Your Phone:

1. Open the URL above on your phone's browser
2. The app works as a PWA - you can "Add to Home Screen"
3. Grant camera permission when prompted
4. Start scanning!

## ⚠️ Important Note About API Proxy

The UPC Database API proxy (`npm run start:proxy`) needs to run separately. For production:

### Option 1: Deploy Proxy as Firebase Cloud Function
```bash
cd functions
npm install
firebase deploy --only functions
```

### Option 2: Use a Cloud Service
Deploy the proxy to:
- Heroku (free tier available)
- Railway (free tier available)
- Render (free tier available)
- DigitalOcean App Platform

Then update `ITEM_INFO_PROXY_URL` in your build.

### Option 3: Direct API Calls
The app will work without proxy, but may have CORS issues. The app tries multiple APIs, so some will work.

## What Works Without Proxy:

✅ Open Food Facts API (works directly)  
✅ Open Beauty Facts API (works directly)  
✅ GTIN Search API (works directly)  
✅ Barcode Lookup API (works directly)  
❌ UPC Database API (needs proxy for CORS)

So your app will still work for scanning, just with different APIs!
