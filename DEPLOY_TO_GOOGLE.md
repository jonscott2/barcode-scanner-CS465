# Deploy Sifts to Google (Firebase Hosting)

This guide will help you deploy your Sifts application to Google Firebase Hosting, which provides free hosting with a custom domain option.

## Prerequisites

1. **Firebase Account**: Sign up at [firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install if you haven't already
3. **Node.js**: Version 18 or higher

## Step 1: Install Firebase CLI

If you haven't installed Firebase CLI yet:

```bash
npm install -g firebase-tools
```

Or use npx (no installation needed):
```bash
npx firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with your Google account.

## Step 3: Verify Firebase Project

Your project is already configured to use `barcode-scanner-cs465`. Verify it:

```bash
firebase projects:list
```

You should see `barcode-scanner-cs465` in the list.

If you need to switch projects:
```bash
firebase use barcode-scanner-cs465
```

## Step 4: Build Your Application

Before deploying, build the production version:

```bash
npm run build
```

This will:
- Clean the dist folder
- Build the app with Parcel
- Generate service worker for PWA
- Fix favicon paths

## Step 5: Deploy to Firebase Hosting

### Option A: Deploy Only Hosting (Recommended)

```bash
npm run deploy:firebase
```

Or directly:
```bash
firebase deploy --only hosting
```

### Option B: Deploy Everything (Hosting + Firestore Rules)

```bash
npm run deploy:firebase:all
```

Or directly:
```bash
firebase deploy
```

## Step 6: Access Your Deployed App

After deployment, your app will be live at:

- **Primary URL**: `https://barcode-scanner-cs465.web.app`
- **Alternate URL**: `https://barcode-scanner-cs465.firebaseapp.com`

You can also check the deployment status in the [Firebase Console](https://console.firebase.google.com/project/barcode-scanner-cs465/hosting)

## Quick Deployment Script

For convenience, you can use this one-liner:

```bash
npm run build && npm run deploy:firebase
```

Or create a simple script:

```bash
#!/bin/bash
echo "Building Sifts..."
npm run build

echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://barcode-scanner-cs465.web.app"
```

## Troubleshooting

### Error: "Firebase project not found"
```bash
firebase use --add
# Select your project or create a new one
```

### Error: "Permission denied"
Make sure you're logged in:
```bash
firebase login
```

### Error: "Build failed"
Check that all dependencies are installed:
```bash
npm install
npm run build
```

### Check deployment status
```bash
firebase hosting:channel:list
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to [Firebase Console](https://console.firebase.google.com/project/barcode-scanner-cs465/hosting)
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Update DNS records as instructed

## Environment Variables

If you need to set environment variables for the build:

```bash
UPC_API_KEY="your-key" npm run build
```

Or create a `.env` file (if using dotenv):
```
UPC_API_KEY=your-key-here
SPOONACULAR_API_KEY=your-key-here
```

## Continuous Deployment (Optional)

You can set up automatic deployments using GitHub Actions. See `.github/workflows/deploy.yml` for an example.

## Post-Deployment Checklist

After deploying, test these features:

- [ ] Landing page loads correctly
- [ ] Login/Signup works
- [ ] Scanner page works
- [ ] Barcode scanning functions
- [ ] Ingredients page displays items
- [ ] Recipes page generates suggestions
- [ ] Firebase authentication works
- [ ] Data saves to Firestore
- [ ] Service worker works (offline mode)
- [ ] PWA can be installed

## Rollback Deployment

If something goes wrong, you can rollback:

```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

Or use the Firebase Console:
1. Go to Hosting → Releases
2. Find the previous version
3. Click "Rollback"

## Monitoring

Check your app's performance:
- [Firebase Console - Hosting](https://console.firebase.google.com/project/barcode-scanner-cs465/hosting)
- [Firebase Console - Analytics](https://console.firebase.google.com/project/barcode-scanner-cs465/analytics)

## Support

For issues:
- [Firebase Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Support](https://firebase.google.com/support)

---

**Your app is now live on Google! 🚀**

Visit: https://barcode-scanner-cs465.web.app


