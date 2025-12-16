# Unified Barcode Lookup Pipeline - Testing Guide

## Overview

The unified barcode lookup pipeline provides:
- ✅ **Cache-first** lookup using Firebase (30-day TTL)
- ✅ **Open Food Facts** as primary source (free, excellent for food)
- ✅ **UPCitemDB** as fallback (free tier: 100 requests/day)
- ✅ **UPC Database** as final fallback (if configured)
- ✅ **Normalized response** format for consistent frontend handling
- ✅ **Automatic caching** to Firebase for faster subsequent lookups

## Endpoint

**GET** `/product/:barcode`

Example: `http://localhost:8787/product/0024000163084`

## Response Format

### Success Response
```json
{
  "ok": true,
  "source": "Open Food Facts + UPCitemDB",
  "product": {
    "name": "Product Name",
    "brand": "Brand Name",
    "image": "https://...",
    "ingredients": "ingredient list",
    "allergens": "allergen info",
    "nutrition": { ... },
    "categories": "category list",
    "source": "Open Food Facts + UPCitemDB",
    "lastUpdated": "2025-12-15T01:00:00.000Z"
  },
  "duration": 1234
}
```

### Not Found Response
```json
{
  "ok": false,
  "reason": "not_found",
  "message": "Product not found in any database",
  "duration": 567
}
```

## Testing Steps

### 1. Test with a Known Barcode (First Request - No Cache)

```bash
curl "http://localhost:8787/product/0024000163084"
```

**Expected Behavior:**
- Checks Firebase cache (miss)
- Fetches from Open Food Facts
- If incomplete, tries UPCitemDB
- Merges results
- Saves to Firebase cache
- Returns product data

**Look for in console:**
```
Unified lookup: Fetching from Open Food Facts...
Unified lookup: OFF incomplete, trying UPCitemDB...
Unified lookup: Success via Open Food Facts + UPCitemDB (1234ms)
Cached product for barcode 0024000163084
```

### 2. Test Cached Response (Second Request)

```bash
curl "http://localhost:8787/product/0024000163084"
```

**Expected Behavior:**
- Checks Firebase cache (hit!)
- Returns immediately without API calls
- Much faster response (< 50ms typically)

**Look for in console:**
```
Cache hit for barcode 0024000163084 (age: 0 days)
Unified lookup: Cache hit (23ms)
```

### 3. Test with Different Barcodes

**Food Product (should find in Open Food Facts):**
```bash
curl "http://localhost:8787/product/049000050103"  # Coca-Cola
```

**Non-Food Product (may need UPCitemDB):**
```bash
curl "http://localhost:8787/product/0024000163084"
```

**Unknown Barcode:**
```bash
curl "http://localhost:8787/product/9999999999999"
```

**Expected:** `{"ok": false, "reason": "not_found"}`

### 4. Verify Cache in Firebase Console

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check `products` collection
4. Look for document ID = barcode (e.g., `0024000163084`)
5. Verify fields: `name`, `brand`, `image`, `ingredients`, `source`, `lastUpdated`

### 5. Test Cache Expiration

Cache expires after 30 days. To test expiration:
1. Manually update `lastUpdated` in Firestore to 31 days ago
2. Make request - should fetch fresh data

## Performance Comparison

### Before (Direct API Calls)
- Multiple parallel API calls
- No caching
- ~2-5 seconds per lookup
- High API usage

### After (Unified Pipeline)
- Cache hit: **< 50ms** ⚡
- Cache miss: **1-3 seconds** (still faster due to smart fallback)
- Reduced API calls (cached for 30 days)
- More reliable (multiple fallbacks)

## Source Priority

1. **Firebase Cache** (if fresh < 30 days)
2. **Open Food Facts** (primary - best for food)
3. **UPCitemDB** (fallback if OFF incomplete)
4. **UPC Database** (final fallback if configured)

## Field Merging Strategy

When multiple sources are used:
- **Name**: Prefer OFF, fallback to UPCitemDB/UPC
- **Image**: Prefer any source that has it
- **Ingredients**: Prefer OFF (most complete)
- **Nutrition**: Prefer OFF (most detailed)
- **Categories**: Prefer OFF, fallback to others

## Troubleshooting

### "Cache hit" but slow
- Check Firebase connection
- Verify Firestore rules allow read access

### "Not found" for known products
- Check console for which APIs failed
- Verify barcode format (8-14 digits)
- Check API rate limits (UPCitemDB: 100/day)

### Cache not working
- Verify Firebase credentials are configured
- Check Firestore rules
- Look for errors in console

## Example Test Barcodes

| Barcode | Product | Expected Source |
|---------|---------|----------------|
| 049000050103 | Coca-Cola | Open Food Facts |
| 0024000163084 | Del Monte | Open Food Facts + UPCitemDB |
| 0021000010875 | Kraft Mac & Cheese | Open Food Facts |

## Monitoring

Check server console for:
- Cache hit/miss rates
- API source used
- Response times
- Error messages

## Benefits

✅ **Faster**: Cache hits are instant
✅ **More Reliable**: Multiple fallback sources
✅ **Better Data**: Merges best fields from each source
✅ **Cost Effective**: Reduces API calls via caching
✅ **Consistent**: Unified response format


