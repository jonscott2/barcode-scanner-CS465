#!/bin/bash
# Quick deployment script for Firebase Hosting

echo "🚀 Starting deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase..."
    firebase login
fi

# Build the app
echo "📦 Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your app is live at:"
    echo "   https://barcode-scanner-cs465.web.app"
    echo "   https://barcode-scanner-cs465.firebaseapp.com"
    echo ""
    echo "📱 Open this URL on your phone to test!"
    echo ""
    echo "⚠️  Note: The API proxy server needs to be running separately."
    echo "   For production, consider deploying it as a Firebase Cloud Function."
else
    echo "❌ Deployment failed!"
    exit 1
fi
