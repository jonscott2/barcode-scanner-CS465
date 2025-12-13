# API Configuration Status

## APIs Used in This Application

### 1. UPC Database API (Product Information)
- **Status**: ✅ Configured
- **Endpoint**: `https://api.upcdatabase.org`
- **Purpose**: Fetches product information for scanned barcodes
- **Configuration File**: `src/js/constants.js`
- **Usage**: 
  - Automatically called when a 12-14 digit barcode is scanned
  - Tries multiple endpoints: `/product/{id}`, `/products/{id}`, POST `/products/{id}`
  - Falls back gracefully if API is unavailable

**API Key Setup**:
- Set `UPC_API_KEY` environment variable during build
- For local development, can use proxy at `http://localhost:8787`
- API key is optional - works without it but with rate limits

**Proxy Support**:
- Supports server-side proxy to avoid CORS issues
- Defaults to `http://localhost:8787` for localhost development
- Can be configured via `ITEM_INFO_PROXY_URL` environment variable

### 2. Firebase APIs (Authentication & Database)
- **Status**: ⚠️ Optional - Works without Firebase
- **Purpose**: 
  - User authentication (email, anonymous, guest)
  - Cloud storage for scan history
  - Real-time sync across devices
- **Configuration File**: `src/js/services/firebase-config.js`
- **Fallback**: App works in local-only mode if Firebase is not configured

**Setup Methods**:
1. Add `window.__FIREBASE_CONFIG__` in `index.html` (recommended for local testing)
2. Set environment variables: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.
3. Or leave unconfigured - app will use local storage only

### 3. Barcode Detection API (Browser Native)
- **Status**: ✅ Always Available
- **Purpose**: Detects barcodes from video/image
- **Polyfill**: Falls back to `barcode-detector` npm package if browser doesn't support natively
- **Configuration File**: `src/js/helpers/BarcodeReader.js`

**Supported Formats**:
- QR codes, UPC-A, UPC-E, EAN-13, EAN-8
- Code 128, Code 39, Code 93
- Data Matrix, PDF417, Aztec, ITF, Codabar

## Current Configuration

### UPC Database API
- ✅ Base URL: `https://api.upcdatabase.org`
- ⚠️ API Key: Not set in code (set via environment variable)
- ✅ Proxy: Auto-detects localhost proxy at `http://localhost:8787`
- ✅ Fallback: Direct API call if proxy unavailable

### Firebase
- ⚠️ Status: Not configured (using local storage mode)
- ✅ Fallback: Local storage works perfectly for all features
- ℹ️ Authentication: Works with local fallback
- ℹ️ History: Saved to localStorage

## Testing APIs

### Test UPC Database API:
```javascript
// In browser console after scanning a barcode:
// The app automatically calls:
fetch('https://api.upcdatabase.org/product/049000050103')
  .then(r => r.json())
  .then(console.log)
```

### Test Barcode Detection:
- Just scan any barcode with the camera
- Works immediately - no API key needed

### Test Firebase:
- If configured, check console for "Initializing Firebase..."
- If not configured, check console for "Firebase not configured - using local storage only"

## Troubleshooting

### API Not Working?
1. Check browser console for errors
2. Verify network connection
3. For UPC API: Check if API key is set (optional)
4. For Firebase: App works fine without it (local mode)

### CORS Issues?
- Use the proxy server at `http://localhost:8787`
- Or configure `ITEM_INFO_PROXY_URL` environment variable



