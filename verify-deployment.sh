#!/bin/bash
# Verify deployment and test the app

echo "🔍 Verifying Firebase Deployment"
echo "================================"
echo ""

# Get current project
PROJECT_ID=$(firebase use 2>/dev/null | grep "Active Project" | awk '{print $3}')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No active Firebase project found"
    echo "Run: firebase use --add"
    exit 1
fi

echo "✅ Active project: $PROJECT_ID"
echo ""

# Check if project exists
echo "📋 Checking project status..."
firebase projects:list | grep -q "$PROJECT_ID"
if [ $? -eq 0 ]; then
    echo "✅ Project found in Firebase"
else
    echo "❌ Project not found. Make sure you're logged in: firebase login"
    exit 1
fi

# Check hosting
echo ""
echo "🌐 Checking hosting..."
firebase hosting:sites:list 2>/dev/null | grep -q "$PROJECT_ID"
if [ $? -eq 0 ]; then
    echo "✅ Hosting is configured"
    echo "   URL: https://$PROJECT_ID.web.app"
    echo "   URL: https://$PROJECT_ID.firebaseapp.com"
else
    echo "⚠️  Hosting may not be set up. Run: firebase deploy --only hosting"
fi

# Check build
echo ""
echo "📦 Checking build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build directory exists"
    echo "   Files in dist: $(ls -1 dist | wc -l | xargs) files"
else
    echo "⚠️  Build directory not found. Run: npm run build"
fi

echo ""
echo "🎯 Quick Test Commands:"
echo "   Open in browser: https://$PROJECT_ID.web.app"
echo "   Test locally: npx serve dist"
echo ""
