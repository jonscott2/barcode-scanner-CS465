# Sifts - System Architecture & How It Works

## Overview

Sifts is a Progressive Web Application (PWA) designed to help users reduce food waste by tracking inventory, monitoring expiration dates, and discovering recipes based on available ingredients.

## System Architecture

### Components

1. **Frontend (React.js)**
   - Scanner Component - Uses Browser Barcode Detection API
   - Ingredients Page - Displays inventory with expiration tracking
   - Recipes Page - Generates recipes from available ingredients
   - Authentication UI - Login/signup with Firebase Auth

2. **Backend Proxy Servers (Express.js)**
   - UPC Proxy Server (Port 8787) - Handles CORS and routes to UPC Database API
   - Recipe API Server (Port 8788) - Interfaces with Spoonacular API

3. **External APIs**
   - UPC Database API - Provides product information from barcodes
   - Open Food Facts - Free food product database
   - Spoonacular API - Recipe generation based on ingredients

4. **Storage**
   - Firebase Firestore - Cloud database for scan history and user data
   - Local Storage - Offline fallback when Firebase unavailable

5. **Authentication**
   - Firebase Authentication - Email/password and anonymous login

## Data Flow

### 1. Barcode Scanning Process

```
User → Camera/Image Upload
  ↓
Browser Barcode Detection API
  ↓
Extract Barcode Value
  ↓
Frontend sends to Backend Proxy
  ↓
Backend queries UPC Database API
  ↓
Product Information Retrieved
  ↓
Display to User
  ↓
Save to Firebase/Local Storage
```

### 2. Product Information Retrieval

The system uses multiple API sources in parallel for maximum reliability:
- UPC Database API (primary)
- Open Food Facts (food products)
- Open Beauty Facts (cosmetics)
- SearchUPCData (fallback)
- GTIN Search (fallback)

The first successful response is used, ensuring fast and reliable product lookup.

### 3. Storage Strategy

- **Primary**: Firebase Firestore (cloud storage, syncs across devices)
- **Fallback**: Local Storage (works offline, syncs when online)
- **Auto-sync**: Pending scans automatically sync when connection restored

### 4. Recipe Generation

```
User selects ingredients from inventory
  ↓
Frontend sends ingredient list to Recipe API Server
  ↓
Backend queries Spoonacular API
  ↓
Recipes returned with ingredients, instructions, images
  ↓
Display to user
  ↓
Generate shopping list for missing ingredients
```

## Key Features

### Barcode Scanning
- **Camera Scanning**: Real-time barcode detection using device camera
- **Image Upload**: Upload images containing barcodes
- **Multiple Formats**: Supports QR codes, UPC-A, UPC-E, EAN-13, EAN-8, Code 128, etc.
- **Auto-continue**: Option to keep scanning without interruption

### Inventory Management
- **Expiration Tracking**: Set and monitor expiration dates
- **Visual Indicators**: Color-coded badges (red=expired, yellow=soon, green=good)
- **Search & Filter**: Find items quickly, filter by expiration status
- **History**: View all past scans with details

### Recipe Discovery
- **Ingredient Selection**: Choose from scanned inventory
- **Smart Suggestions**: Recipes prioritized by available ingredients
- **Shopping Lists**: Generate lists for missing ingredients
- **Recipe Details**: Full instructions, ingredients, and images

## Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **CSS3** - Styling with CSS variables for theming
- **Web Components** - Custom elements for scanner functionality
- **Service Worker** - Offline support and PWA features

### Backend
- **Express.js** - API proxy servers
- **Node.js** - Runtime environment
- **CORS Handling** - Enables cross-origin requests

### APIs & Services
- **Firebase** - Authentication and database
- **UPC Database API** - Product information
- **Spoonacular API** - Recipe generation
- **Open Food Facts** - Free food database

### Storage
- **Firebase Firestore** - Cloud database
- **Local Storage** - Browser storage for offline support
- **IndexedDB** - Enhanced offline storage (via Firebase)

## Security & Privacy

- **Authentication**: Secure user authentication via Firebase
- **Data Isolation**: User data separated by user ID
- **CORS Protection**: Backend proxy prevents unauthorized API access
- **Local Fallback**: Works without cloud services for privacy

## Offline Support

- **Service Worker**: Caches app resources for offline use
- **Local Storage**: Scans saved locally when offline
- **Auto-sync**: Automatically syncs when connection restored
- **Graceful Degradation**: App functions with limited features offline

## Performance Optimizations

- **Parallel API Calls**: Multiple sources queried simultaneously
- **Caching**: Product and image data cached to reduce API calls
- **Lazy Loading**: Images and components loaded on demand
- **Code Splitting**: Routes loaded separately for faster initial load

## Future Enhancements

- Push notifications for expiring items
- Meal planning calendar
- Nutrition tracking
- Shopping list sharing
- Barcode history analytics
- Export data functionality

---

For more details, see the visual architecture diagram in the About page.

