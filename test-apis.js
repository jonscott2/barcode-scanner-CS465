#!/usr/bin/env node
/**
 * Test script to verify all APIs are working correctly
 */

// Use node-fetch if available, otherwise use global fetch (Node 18+)
let fetch;
try {
  fetch = require('node-fetch');
} catch {
  fetch = global.fetch;
  if (!fetch) {
    console.error('Error: fetch is not available. Install node-fetch or use Node 18+');
    process.exit(1);
  }
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(name, url, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: true, status: response.status, data };
    } else {
      return { success: false, status: response.status, error: `HTTP ${response.status}` };
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Timeout' };
    }
    return { success: false, error: err.message };
  }
}

async function main() {
  log('\n🧪 Testing All APIs\n', 'blue');
  log('='.repeat(60), 'blue');

  // Test UPC Proxy Server (Port 8787)
  log('\n📡 Testing UPC Proxy Server (Port 8787)', 'cyan');
  logInfo('Testing with barcode: 049000050103 (Coca-Cola)');

  const upcProxyTest = await testEndpoint(
    'UPC Proxy',
    'http://localhost:8787/product/049000050103'
  );

  if (upcProxyTest.success) {
    logSuccess(`UPC Proxy is working! Status: ${upcProxyTest.status}`);
    if (upcProxyTest.data.title) {
      logInfo(`Product found: ${upcProxyTest.data.title}`);
    }
  } else {
    logError(`UPC Proxy failed: ${upcProxyTest.error || upcProxyTest.status}`);
    logWarning('Make sure to run: npm run start:proxy');
  }

  // Test Recipe API Server (Port 8788)
  log('\n🍳 Testing Recipe API Server (Port 8788)', 'cyan');
  logInfo('Testing with ingredients: chicken, rice');

  const recipeTest = await testEndpoint(
    'Recipe API',
    'http://localhost:8788/recipes/from-file?ingredients=chicken,rice&number=5'
  );

  if (recipeTest.success) {
    logSuccess(`Recipe API is working! Status: ${recipeTest.status}`);
    if (recipeTest.data && Array.isArray(recipeTest.data)) {
      logInfo(`Found ${recipeTest.data.length} recipes`);
    }
  } else {
    logError(`Recipe API failed: ${recipeTest.error || recipeTest.status}`);
    logWarning('Make sure to run: node server/RecipeDB.js');
  }

  // Test External Product APIs (no proxy needed)
  log('\n🌐 Testing External Product APIs', 'cyan');

  // Test Open Food Facts
  logInfo('Testing Open Food Facts API...');
  const offTest = await testEndpoint(
    'Open Food Facts',
    'https://world.openfoodfacts.org/api/v0/product/049000050103.json'
  );
  if (offTest.success && offTest.data.status === 1) {
    logSuccess('Open Food Facts API is working!');
    if (offTest.data.product?.product_name) {
      logInfo(`Product: ${offTest.data.product.product_name}`);
    }
  } else {
    logError('Open Food Facts API failed');
  }

  // Test GTIN Search
  logInfo('Testing GTIN Search API...');
  const gtinTest = await testEndpoint(
    'GTIN Search',
    'https://gtinsearch.org/api/v1/products/049000050103'
  );
  if (gtinTest.success) {
    logSuccess('GTIN Search API is working!');
  } else {
    logWarning('GTIN Search API failed (may be rate limited)');
  }

  // Test Image Search APIs (if keys are configured)
  log('\n🖼️  Testing Image Search APIs', 'cyan');

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    logInfo('Testing Unsplash API...');
    const unsplashTest = await testEndpoint(
      'Unsplash',
      `https://api.unsplash.com/search/photos?query=product&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`
        }
      }
    );
    if (unsplashTest.success) {
      logSuccess('Unsplash API is working!');
    } else {
      logError(`Unsplash API failed: ${unsplashTest.error}`);
    }
  } else {
    logWarning('Unsplash API key not configured (optional)');
  }

  const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (googleKey && googleEngineId) {
    logInfo('Testing Google Custom Search API...');
    const googleTest = await testEndpoint(
      'Google Custom Search',
      `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleEngineId}&q=product&searchType=image&num=1`
    );
    if (googleTest.success) {
      logSuccess('Google Custom Search API is working!');
    } else {
      logError(`Google Custom Search API failed: ${googleTest.error}`);
    }
  } else {
    logWarning('Google Custom Search API keys not configured (optional)');
  }

  // Test Pixabay (works without key)
  logInfo('Testing Pixabay API...');
  const pixabayTest = await testEndpoint(
    'Pixabay',
    'https://pixabay.com/api/?q=product&image_type=photo&per_page=1'
  );
  if (pixabayTest.success) {
    logSuccess('Pixabay API is working!');
  } else {
    logWarning('Pixabay API failed (may be rate limited)');
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('\n📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');

  const results = {
    'UPC Proxy (Port 8787)': upcProxyTest.success,
    'Recipe API (Port 8788)': recipeTest.success,
    'Open Food Facts': offTest.success,
    'GTIN Search': gtinTest.success,
    Pixabay: pixabayTest.success
  };

  if (unsplashKey) {
    results['Unsplash'] = unsplashTest?.success || false;
  }
  if (googleKey && googleEngineId) {
    results['Google Custom Search'] = googleTest?.success || false;
  }

  let allPassed = true;
  for (const [name, passed] of Object.entries(results)) {
    if (passed) {
      logSuccess(`${name}: Working`);
    } else {
      logError(`${name}: Failed`);
      allPassed = false;
    }
  }

  log('\n' + '='.repeat(60), 'blue');
  if (allPassed) {
    log('\n🎉 All critical APIs are working!', 'green');
  } else {
    log('\n⚠️  Some APIs failed. Check the errors above.', 'yellow');
    log('\nTo start the proxy servers:', 'cyan');
    log('  1. UPC Proxy: npm run start:proxy', 'cyan');
    log('  2. Recipe API: node server/RecipeDB.js', 'cyan');
  }
  log('', 'reset');
}

main().catch(err => {
  logError(`Test script failed: ${err.message}`);
  process.exit(1);
});

