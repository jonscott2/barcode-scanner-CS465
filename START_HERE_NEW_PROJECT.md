# 🚀 Start Here: Create New Firebase Project

## Quick Steps (5 minutes)

### Step 1: Create Firebase Project (2 min)

1. **Go to:** https://console.firebase.google.com/
2. **Click:** "Add project" or "Create a project"
3. **Enter name:** `barcode-scanner-v2` (or any name)
4. **Click:** Continue → Continue → Create project
5. **Wait** for project creation

### Step 2: Enable Services (2 min)

#### Enable Authentication:
- Click **Authentication** → **Get started**
- Enable **Email/Password** → **Save**
- Enable **Anonymous** → **Save**

#### Enable Firestore:
- Click **Firestore Database** → **Create database**
- Choose **Start in test mode** → **Next**
- Select location → **Enable**

#### Enable Hosting:
- Click **Hosting** → **Get started**
- Click **Next** → **Next** → **Continue to console**

### Step 3: Get Config (1 min)

1. Click **⚙️ Settings** → **Project settings**
2. Scroll to **"Your apps"** → Click **Web icon** (</>)
3. Register app: `barcode-scanner-web`
4. **Copy the config** (it looks like this):

```javascript
{
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### Step 4: Run Setup Script

```bash
./QUICK_SETUP_NEW_PROJECT.sh
```

Or manually:

```bash
# Update config
node update-new-firebase-config.js
# (Enter your config values when prompted)

# Switch project
firebase use --add
# (Select your new project)

# Build and deploy
npm run build
firebase deploy --only hosting,firestore:rules
```

### Step 5: Test!

Your new app will be at:
- `https://YOUR-PROJECT-ID.web.app`
- `https://YOUR-PROJECT-ID.firebaseapp.com`

## ✅ Verification Checklist

After deployment, test:
- [ ] App loads at new URL
- [ ] Can create account (Signup)
- [ ] Can login
- [ ] Can scan barcodes
- [ ] Scans save to history
- [ ] History displays correctly

## 🆘 Troubleshooting

**If deployment fails:**
```bash
firebase login
firebase projects:list
firebase use YOUR-PROJECT-ID
npm run build
firebase deploy --only hosting
```

**If app doesn't load:**
- Clear browser cache
- Try incognito mode
- Check browser console for errors

**If authentication fails:**
- Make sure Email/Password and Anonymous are enabled
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
