# Firebase Deployment Checklist

## Pre-Deployment Checks

### 1. Build Verification
- [x] Build completes successfully (`npm run build`)
- [x] All files generated in `dist/` directory
- [x] `index.html` exists in `dist/`
- [x] No placeholder Firebase configs in build output

### 2. Firebase Configuration
- [x] Firebase project is set: `barcode-scanner-cs465`
- [ ] Firebase config is injected into HTML (see below)
- [ ] Firestore rules are deployed
- [ ] Authentication is enabled (Anonymous + Email/Password)

### 3. Firebase Services Setup
- [ ] Authentication enabled:
  - Anonymous authentication
  - Email/Password authentication
- [ ] Firestore database created
- [ ] Firestore security rules deployed
- [ ] Storage bucket configured (if needed)

## Deployment Steps

### Step 1: Inject Firebase Config
Before deploying, you need to add Firebase config to `src/index.html`. Add this script tag before the app script:

```html
<script>
  window.__FIREBASE_CONFIG__ = {
    apiKey: "YOUR_API_KEY",
    authDomain: "barcode-scanner-cs465.firebaseapp.com",
    projectId: "barcode-scanner-cs465",
    storageBucket: "barcode-scanner-cs465.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
</script>
```

### Step 2: Rebuild
```bash
npm run build
```

### Step 3: Deploy to Firebase
```bash
# Deploy only hosting
npm run deploy:firebase

# Or deploy everything (hosting + firestore rules)
npm run deploy:firebase:all
```

## Post-Deployment Testing

### Authentication Tests
- [ ] Landing page loads correctly
- [ ] Can navigate to login page
- [ ] Can create account (email/password)
- [ ] Can login with email/password
- [ ] Can login as guest (anonymous)
- [ ] Logout redirects to landing page
- [ ] Cannot access protected routes when logged out

### Inactivity Timer Tests
- [ ] Timer starts when user logs in
- [ ] Warning appears at 18 minutes
- [ ] Auto-logout occurs at 20 minutes
- [ ] Timer resets on user activity
- [ ] Notification appears on auto-logout

### Core Functionality Tests
- [ ] Scanner page loads
- [ ] Camera access works
- [ ] Barcode scanning works
- [ ] Product information displays
- [ ] Scan history saves
- [ ] History page displays scans
- [ ] Ingredients page works
- [ ] Recipes page works
- [ ] Settings page works
- [ ] Account page works

### Navigation Tests
- [ ] All navigation links work
- [ ] Protected routes require login
- [ ] Public routes accessible without login
- [ ] Logged-in users redirected from login/signup
- [ ] Hash routing works correctly

### UI/UX Tests
- [ ] SNHU colors display correctly
- [ ] All images load
- [ ] Text is readable
- [ ] Responsive design works on mobile
- [ ] Navigation bar works
- [ ] Forms submit correctly

## Troubleshooting

### Build Issues
- Clear cache: `npm run clean && npm run build`
- Check for syntax errors in console
- Verify all dependencies installed: `npm install`

### Firebase Issues
- Verify Firebase config is correct
- Check Firebase Console for errors
- Verify Firestore rules are deployed
- Check authentication providers are enabled

### Runtime Issues
- Check browser console for errors
- Verify Firebase services are enabled
- Check network tab for failed requests
- Verify CORS settings if using external APIs

## Quick Commands

```bash
# Build
npm run build

# Deploy hosting only
npm run deploy:firebase

# Deploy everything
npm run deploy:firebase:all

# Check Firebase project
firebase projects:list

# View deployment
firebase hosting:channel:list
```

