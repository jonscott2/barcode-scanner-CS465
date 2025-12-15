#!/bin/bash
# Script to update Firebase project configuration

echo "🔥 Firebase Project Update Script"
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "📋 Current Firebase projects:"
firebase projects:list

echo ""
echo "🔧 To switch to a new project:"
echo "   1. Create a new project in Firebase Console"
echo "   2. Run: firebase use --add"
echo "   3. Select your new project"
echo ""
echo "📝 After switching, you'll need to:"
echo "   1. Update .firebaserc with new project ID"
echo "   2. Update src/index.html with new Firebase config"
echo "   3. Update src/js/services/firebase-config.js with new config"
echo "   4. Rebuild and redeploy: npm run build && firebase deploy"
echo ""
echo "⚠️  Warning: Switching projects will lose all data from the old project!"
echo ""

read -p "Do you want to proceed with switching projects? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase use --add
    echo ""
    echo "✅ Project switched!"
    echo "📝 Next steps:"
    echo "   1. Get new Firebase config from Firebase Console"
    echo "   2. Update src/index.html with new config"
    echo "   3. Run: npm run build && firebase deploy"
else
    echo "Cancelled."
fi
