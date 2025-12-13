# Quick Deployment Guide

## Before You Deploy

### 1. Get Your Firebase Config
Go to Firebase Console → Project Settings → Your apps → Web app → Config
Copy the config values.

### 2. Add Firebase Config to HTML
Edit `src/index.html` and add this script **before** the closing `</head>` tag:

```html
<script>
  window.__FIREBASE_CONFIG__ = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "barcode-scanner-cs465.firebaseapp.com",
    projectId: "barcode-scanner-cs465",
    storageBucket: "barcode-scanner-cs465.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
</script>
```

### 3. Enable Firebase Services
In Firebase Console:
- **Authentication**: Enable Anonymous and Email/Password
- **Firestore**: Create database (start in test mode, then deploy rules)
- **Hosting**: Already configured

### 4. Deploy Firestore Rules (if not done)
```bash
firebase deploy --only firestore:rules
```

## Deploy Commands

```bash
# 1. Rebuild with Firebase config
npm run build

# 2. Deploy to Firebase Hosting
npm run deploy:firebase

# Or deploy everything at once
npm run deploy:firebase:all
```

## After Deployment

Your app will be live at:
- **Production**: `https://barcode-scanner-cs465.web.app`
- **Preview**: Check Firebase Console → Hosting

## Test Checklist

1. ✅ Landing page loads
2. ✅ Login/Signup works
3. ✅ Scanner works
4. ✅ History saves
5. ✅ Inactivity timer works (20 min)
6. ✅ Logout redirects correctly
7. ✅ Protected routes require login

## Quick Test Commands

```bash
# Test build locally
npm run build
npx serve dist

# Check Firebase status
firebase projects:list
firebase hosting:channel:list
```

