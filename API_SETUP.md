# API Setup Guide

## Quick Start

### 1. Start the UPC Database Proxy Server

**Mac/Linux:**
```bash
export UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

**Windows (PowerShell):**
```powershell
$env:UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

**Windows (CMD):**
```cmd
set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
npm run start:proxy
```

The proxy will start on `http://localhost:8787`

### 2. Start the React App

In a separate terminal:
```bash
npm start
```

The app will be available at `http://localhost:3002`

## APIs Configured

### 1. UPC Database API ✅
- **API Key**: `4190D3F1E6057DD921DA7E426A79AAF3`
- **Status**: Configured and working
- **Endpoint**: Via proxy at `http://localhost:8787`
- **Authentication**: Bearer token in Authorization header

### 2. Open Food Facts ✅
- **Status**: Free, no API key required
- **Coverage**: Excellent for food products worldwide
- **Endpoint**: Direct API call (no proxy needed)

### 3. Open Beauty Facts ✅
- **Status**: Free, no API key required
- **Coverage**: Cosmetics and beauty products
- **Endpoint**: Direct API call (no proxy needed)

### 4. Barcode Lookup API ✅ (NEW)
- **Status**: Using demo key (free tier)
- **Coverage**: General products
- **Note**: For production, get your own API key from barcodelookup.com

### 5. GTIN Search (Datakick) ✅ (NEW)
- **Status**: Free, open database
- **Coverage**: Open product database
- **Endpoint**: Direct API call

## How It Works

When a barcode is scanned:

1. **Barcode Detection**: Browser's native Barcode Detection API detects the barcode
2. **API Query**: The app queries **5 APIs in parallel**:
   - Open Food Facts (fastest, free)
   - UPC Database (via proxy with your API key)
   - Open Beauty Facts (for cosmetics)
   - Barcode Lookup (demo key)
   - GTIN Search (open database)
3. **First Result Wins**: Uses `Promise.any()` to get the first successful response
4. **Fallback**: If all parallel requests fail, tries sequential fallback
5. **Caching**: Results are cached for 5 minutes to reduce API calls
6. **Display**: Product info is displayed and saved to scan history

## Testing

1. **Start the proxy**: `export UPC_API_KEY="..." && npm run start:proxy`
2. **Start the app**: `npm start`
3. **Navigate to**: `http://localhost:3002/app/scanner`
4. **Scan a barcode**: Use your camera or upload an image
5. **Check console**: You should see API calls and responses

## Troubleshooting

### Proxy not working?
- Make sure `UPC_API_KEY` is set in the environment
- Check that port 8787 is not in use
- Verify the proxy is running: `curl http://localhost:8787/product/0123456789012`

### No product info showing?
- Check browser console for API errors
- Verify the proxy is running
- Try scanning a known barcode (e.g., common food products)
- Check that the barcode is 8-14 digits (required format)

### CORS errors?
- The proxy handles CORS for UPC Database
- Other APIs may have CORS restrictions (errors are caught gracefully)
- The app will use whichever API responds first

## API Priority

The APIs are queried in this order (first successful response wins):
1. Open Food Facts (fastest, best for food)
2. UPC Database (your API key, reliable)
3. Open Beauty Facts (for cosmetics)
4. Barcode Lookup (demo key, may have rate limits)
5. GTIN Search (open database, may be slower)
