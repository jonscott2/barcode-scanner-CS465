#!/bin/bash

# Deploy Sifts to Google Firebase Hosting
# This script builds and deploys the application

set -e  # Exit on error

echo "🚀 Starting deployment to Google Firebase Hosting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase. Please login...${NC}"
    firebase login
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build the application
echo -e "${GREEN}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please fix errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Deploy to Firebase
echo -e "${GREEN}📤 Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your app is now live at:${NC}"
    echo -e "   https://barcode-scanner-cs465.web.app"
    echo -e "   https://barcode-scanner-cs465.firebaseapp.com"
    echo ""
    echo -e "${GREEN}🎉 Congratulations! Sifts is now hosted on Google!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

