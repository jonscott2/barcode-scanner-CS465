# Technology Stack & Software Used

## 📚 Programming Languages

### **JavaScript (ES6+)**
- **What it is**: The primary programming language for this project
- **What it does**: 
  - Powers the entire frontend application
  - Handles barcode scanning logic
  - Manages API calls and data processing
  - Controls user interactions and UI updates
- **Files**: All `.js` and `.jsx` files

### **JSX (JavaScript XML)**
- **What it is**: A syntax extension for JavaScript, used with React
- **What it does**: 
  - Allows writing HTML-like code in JavaScript
  - Makes React components easier to read and write
  - Combines HTML structure with JavaScript logic
- **Files**: All `.jsx` files (React components)

### **JSON (JavaScript Object Notation)**
- **What it is**: A data format for storing and exchanging data
- **What it does**: 
  - Stores configuration files (`package.json`, `firebase.json`)
  - Stores data (ingredients, scans history)
  - API response format
- **Files**: `package.json`, `firebase.json`, `ingredients.json`, etc.

### **CSS (Cascading Style Sheets)**
- **What it is**: Styling language for web pages
- **What it does**: 
  - Defines the visual appearance of the app
  - Controls colors, layouts, fonts, animations
  - Makes the app responsive and beautiful
- **Files**: `src/css/main.css`, `src/pages/*.css`

### **HTML (HyperText Markup Language)**
- **What it is**: Markup language for web pages
- **What it does**: 
  - Defines the structure of web pages
  - Base template for the application
- **Files**: `src/index.html`

### **Bash/Shell Script**
- **What it is**: Command-line scripting language
- **What it does**: 
  - Automates server startup
  - Sets up environment variables
  - Deployment scripts
- **Files**: `start-all-apis.sh`, `deploy.sh`, etc.

### **Batch Script (Windows)**
- **What it is**: Windows command-line scripting
- **What it does**: 
  - Same as Bash scripts but for Windows
  - Automates Windows-specific tasks
- **Files**: `start-all-apis.bat`, `setup-api.bat`

---

## 🛠️ Core Frameworks & Libraries

### **React 18.2.0**
- **What it is**: JavaScript library for building user interfaces
- **What it does**: 
  - Creates interactive, component-based UI
  - Manages application state
  - Handles user interactions
  - Makes the app fast and responsive
- **Used in**: All `.jsx` files (Login, Signup, HomePage, Scanner, etc.)

### **React Router DOM 6.30.2**
- **What it is**: Routing library for React applications
- **What it does**: 
  - Handles navigation between pages
  - Manages URL routing
  - Protects routes (login required pages)
  - Enables browser back/forward buttons
- **Used in**: `src/App.jsx`, all page components

### **Firebase 12.6.0**
- **What it is**: Google's backend-as-a-service platform
- **What it does**: 
  - **Authentication**: User login, signup, session management
  - **Firestore Database**: Stores user scans, history, preferences
  - **Hosting**: Deploys the app to the web
  - **Real-time sync**: Syncs data across devices
- **Used in**: `src/js/services/firebase-auth.js`, `src/contexts/AuthProvider.jsx`

### **Firebase Admin 13.6.0**
- **What it is**: Server-side Firebase SDK
- **What it does**: 
  - Server-side operations
  - Secure admin access to Firebase
- **Used in**: Server-side code

---

## 🎨 UI Components & Web Components

### **Custom Web Components**
- **What they are**: Reusable HTML elements with custom functionality
- **What they do**: 
  - `video-capture`: Handles camera access and video streaming
  - `bs-auth`: Authentication UI component
  - `bs-history`: Displays scan history
  - `bs-settings`: App settings interface
  - `bs-result`: Shows scan results
  - `a-tab-group`: Tab navigation component
  - `modal-element`: Popup dialogs
  - `alert-element`: Error/success messages
- **Files**: `src/js/components/*.js`

### **@georapbox Web Components**
- **What they are**: Pre-built web component library
- **What they do**: 
  - `a-tab-group`: Tab navigation
  - `alert-element`: Alert messages
  - `clipboard-copy-element`: Copy to clipboard
  - `files-dropzone-element`: File upload
  - `modal-element`: Modal dialogs
  - `resize-observer-element`: Responsive layouts
  - `web-share-element`: Native sharing

---

## 🔧 Build Tools & Development

### **Parcel 2.15.0**
- **What it is**: Web application bundler
- **What it does**: 
  - Bundles JavaScript, CSS, and assets
  - Transpiles modern JavaScript to browser-compatible code
  - Handles hot module replacement (live reload)
  - Optimizes code for production
- **Used in**: Development server (`npm start`)

### **ESLint 9.26.0**
- **What it is**: JavaScript code linter
- **What it does**: 
  - Finds and fixes code errors
  - Enforces coding standards
  - Catches bugs before runtime
- **Used in**: `npm run lint`

### **Prettier 3.5.3**
- **What it is**: Code formatter
- **What it does**: 
  - Automatically formats code
  - Makes code consistent and readable
- **Used in**: `npm run format`

### **Workbox 7.3.0**
- **What it is**: Service worker library for PWAs
- **What it does**: 
  - Enables offline functionality
  - Caches app resources
  - Makes the app work like a native app
- **Used in**: Service worker generation

---

## 🌐 APIs & External Services

### **Barcode Detection API**
- **What it is**: Browser-native API for barcode scanning
- **What it does**: 
  - Detects barcodes from camera or images
  - Supports multiple barcode formats (UPC, EAN, QR codes, etc.)
  - No external library needed
- **Used in**: `src/js/helpers/BarcodeReader.js`

### **UPC Database API**
- **What it is**: External API for product information
- **What it does**: 
  - Looks up product details from barcode (UPC)
  - Returns product name, brand, description
  - **URL**: `https://api.upcdatabase.org/`
- **Used in**: `server/proxy.js`

### **Spoonacular API**
- **What it is**: Recipe and food information API
- **What it does**: 
  - Finds recipes based on ingredients
  - Provides nutritional information
  - **URL**: `https://spoonacular.com/`
- **Used in**: `server/RecipeDB.js`

### **Open Food Facts API**
- **What it is**: Open database of food products
- **What it does**: 
  - Alternative source for product information
  - Free and open-source
- **Used in**: `server/proxy.js` (fallback)

### **UPCitemDB API**
- **What it is**: Another barcode lookup service
- **What it does**: 
  - Additional fallback for product information
- **Used in**: `server/proxy.js` (fallback)

---

## 🖥️ Server-Side Technologies

### **Node.js**
- **What it is**: JavaScript runtime for server-side code
- **What it does**: 
  - Runs JavaScript on the server
  - Powers the API proxy servers
  - Handles server-side logic
- **Used in**: `server/proxy.js`, `server/RecipeDB.js`

### **Express.js**
- **What it is**: Web framework for Node.js
- **What it does**: 
  - Creates HTTP servers
  - Handles API requests
  - Manages CORS (Cross-Origin Resource Sharing)
  - Routes API endpoints
- **Used in**: `server/proxy.js`, `server/RecipeDB.js`

### **node-fetch 3.3.2**
- **What it is**: HTTP client for Node.js
- **What it does**: 
  - Makes API calls from the server
  - Fetches data from external APIs
- **Used in**: Server-side API calls

---

## 📦 Data Storage

### **IndexedDB (via idb-keyval 6.2.2)**
- **What it is**: Browser database for storing large amounts of data
- **What it does**: 
  - Stores scan history locally
  - Works offline
  - Faster than localStorage for large data
- **Used in**: Local data storage

### **localStorage**
- **What it is**: Browser key-value storage
- **What it does**: 
  - Stores user preferences
  - Stores session data
  - Stores app settings
- **Used in**: Throughout the app

### **Firestore (Firebase)**
- **What it is**: Cloud NoSQL database
- **What it does**: 
  - Stores user scans in the cloud
  - Syncs across devices
  - Real-time updates
- **Used in**: `src/js/services/firebase-scans.js`

---

## 🐛 Error Tracking & Monitoring

### **Sentry (@sentry/react 10.30.0)**
- **What it is**: Error tracking and performance monitoring
- **What it does**: 
  - Captures JavaScript errors
  - Tracks app performance
  - Provides error reports with stack traces
  - Helps debug production issues
- **Used in**: `src/js/sentry.config.js`, `src/index.jsx`

---

## 🚀 Deployment & Hosting

### **Firebase Hosting**
- **What it is**: Google's web hosting service
- **What it does**: 
  - Hosts the web application
  - Provides SSL certificates
  - Global CDN for fast loading
- **Used in**: `firebase.json`, deployment scripts

### **Vercel**
- **What it is**: Cloud platform for frontend apps
- **What it does**: 
  - Alternative hosting option
  - Automatic deployments
- **Used in**: `vercel.json`

### **Netlify**
- **What it is**: Another hosting platform
- **What it does**: 
  - Alternative hosting option
  - Serverless functions support
- **Used in**: `netlify.toml`

### **GitHub Pages**
- **What it is**: Free hosting from GitHub
- **What it does**: 
  - Hosts static websites
  - Free for public repositories
- **Used in**: `gh-pages` package

---

## 🧪 Testing & Quality

### **ESLint**
- **What it is**: Code quality tool
- **What it does**: 
  - Finds code errors
  - Enforces best practices
  - Catches bugs early

### **Prettier**
- **What it is**: Code formatter
- **What it does**: 
  - Keeps code consistent
  - Auto-formats on save

---

## 📱 Progressive Web App (PWA) Features

### **Service Workers**
- **What it is**: Background scripts that run in the browser
- **What it does**: 
  - Enables offline functionality
  - Caches app resources
  - Makes app installable on phones

### **Web App Manifest**
- **What it is**: JSON file describing the app
- **What it does**: 
  - Makes app installable
  - Defines app icon, name, colors
  - Enables "Add to Home Screen"
- **File**: `src/manifest.webmanifest`

---

## 🔐 Security & Authentication

### **Firebase Authentication**
- **What it is**: Google's authentication service
- **What it does**: 
  - Handles user login/signup
  - Manages passwords securely
  - Provides session management
  - Supports email/password authentication

---

## 📊 Summary by Category

### **Frontend:**
- React, React Router, JavaScript, JSX, CSS, HTML
- Web Components, Custom Components

### **Backend:**
- Node.js, Express.js
- Firebase (Auth, Firestore, Hosting)

### **APIs:**
- Barcode Detection API (Browser)
- UPC Database API
- Spoonacular API
- Open Food Facts API
- UPCitemDB API

### **Tools:**
- Parcel (Bundler)
- ESLint (Linter)
- Prettier (Formatter)
- Workbox (PWA)
- Sentry (Error Tracking)

### **Storage:**
- IndexedDB (Local)
- localStorage (Local)
- Firestore (Cloud)

### **Deployment:**
- Firebase Hosting
- Vercel
- Netlify
- GitHub Pages

---

## 🎯 What Each Technology Does in This Project

1. **React** → Builds the user interface (login, scanner, dashboard)
2. **Firebase** → Handles user accounts and stores scan data
3. **Barcode Detection API** → Scans barcodes from camera/images
4. **UPC Database API** → Gets product info from barcode
5. **Spoonacular API** → Finds recipes based on ingredients
6. **Node.js/Express** → Creates proxy servers for APIs
7. **Sentry** → Tracks errors in production
8. **Parcel** → Bundles and builds the app
9. **Service Workers** → Makes app work offline
10. **React Router** → Handles page navigation

---

This is a **full-stack JavaScript application** using modern web technologies to create a Progressive Web App (PWA) that works on both desktop and mobile devices!

