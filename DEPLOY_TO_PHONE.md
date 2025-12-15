# Deploy to Test on Your Phone 📱

## Quick Deployment Steps

### Option 1: Firebase Hosting (Recommended - Free & Fast)

#### Step 1: Build the App
```bash
npm run build
```

#### Step 2: Deploy to Firebase
```bash
# Make sure you're logged in to Firebase
firebase login

# Deploy
npm run deploy:firebase
```

Your app will be live at:
- **https://barcode-scanner-cs465.web.app**
- **https://barcode-scanner-cs465.firebaseapp.com**

#### Step 3: Test on Your Phone
1. Open the URL on your phone's browser
2. The app will work as a PWA (Progressive Web App)
3. You can "Add to Home Screen" for app-like experience

### Option 2: Netlify (Alternative - Also Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

### Option 3: Vercel (Alternative - Also Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

## Important: API Proxy Setup

⚠️ **The UPC Database API proxy needs to run separately!**

For production, you have two options:

### Option A: Deploy Proxy as Firebase Cloud Function
```bash
cd functions
npm install
firebase deploy --only functions
```

Then update `src/js/constants.js` to use the Firebase Function URL instead of localhost.

### Option B: Use Environment Variable for Proxy URL
Set `ITEM_INFO_PROXY_URL` environment variable during build:
```bash
ITEM_INFO_PROXY_URL=https://your-proxy-url.com npm run build
```

### Option C: Use Direct API Calls (No Proxy)
The app will fall back to direct API calls if proxy is unavailable, but you'll need to handle CORS.

## Testing Checklist on Phone

- [ ] App loads correctly
- [ ] Login/Signup works
- [ ] Camera scanning works (grant camera permission)
- [ ] Barcode scanning detects codes
- [ ] Product info displays after scanning
- [ ] History saves correctly
- [ ] Can view scan history
- [ ] Can generate recipes
- [ ] Logout works
- [ ] "Add to Home Screen" works (PWA)

## PWA Features

Your app is already a Progressive Web App! Users can:
- Install it on their phone home screen
- Use it offline (with service worker)
- Get app-like experience

## Troubleshooting

### Camera Not Working on Phone
- Make sure you're using HTTPS (required for camera access)
- Check browser permissions for camera
- Try Chrome or Safari (best PWA support)

### API Not Working
- Check if proxy server is running
- Verify API key is set correctly
- Check browser console for errors

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm run build
```
