# Create New Firebase Project - Step by Step

## Step 1: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `barcode-scanner-new` (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional, or enable if you want)
6. Click **Create project**
7. Wait for project to be created
8. Click **Continue**

## Step 2: Enable Required Services

### Enable Authentication:
1. Click **Authentication** in left menu
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Anonymous** provider
5. Click **Save**

### Enable Firestore:
1. Click **Firestore Database** in left menu
2. Click **Create database**
3. Choose **Start in test mode** (we'll deploy rules later)
4. Select a location (choose closest to you)
5. Click **Enable**

### Enable Hosting:
1. Click **Hosting** in left menu
2. Click **Get started**
3. Follow the setup (we'll deploy from CLI)

## Step 3: Register Web App

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. Click **Web icon** (</>)
5. Register app name: `barcode-scanner-web`
6. **Copy the config values** - you'll need these!

## Step 4: Update Configuration

After you get the new config, I'll help you update the files. The config will look like:

```javascript
{
  apiKey: "AIza...",
  authDomain: "your-new-project.firebaseapp.com",
  projectId: "your-new-project",
  storageBucket: "your-new-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

## Step 5: Switch Firebase Project in CLI

```bash
firebase use --add
# Select your new project from the list
```

## Step 6: Deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

---

**Once you create the project and get the config, let me know and I'll update all the files for you!**
