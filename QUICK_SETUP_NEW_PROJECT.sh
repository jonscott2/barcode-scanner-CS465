#!/bin/bash
# Quick setup script for new Firebase project

echo "🔥 Setting up New Firebase Project"
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "📋 Step 1: Create new project in Firebase Console"
echo "   Go to: https://console.firebase.google.com/"
echo "   Click 'Add project' and create a new project"
echo ""
echo "   Required steps in Firebase Console:"
echo "   1. Create project (name it anything, e.g., 'barcode-scanner-v2')"
echo "   2. Enable Authentication → Email/Password + Anonymous"
echo "   3. Enable Firestore Database → Start in test mode"
echo "   4. Enable Hosting"
echo "   5. Register Web app → Copy the config values"
echo ""
read -p "Press Enter when you've created the project and have the config ready..."

echo ""
echo "📝 Step 2: Update configuration"
echo "   Running configuration updater..."
node update-new-firebase-config.js

echo ""
echo "🔧 Step 3: Switch to new Firebase project"
firebase use --add

echo ""
echo "📦 Step 4: Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "🚀 Step 5: Deploying to Firebase..."
echo "   This will deploy hosting and Firestore rules..."
firebase deploy --only hosting,firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your new app is live at:"
    echo "   https://$(firebase use | grep 'Active Project' | awk '{print $3}').web.app"
    echo ""
    echo "📱 Open this URL on your phone to test!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
