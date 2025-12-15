#!/usr/bin/env node
/**
 * Post-build script to fix favicon path issues
 * Copies favicon.ico to root of dist directory
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const faviconSource = path.join(__dirname, 'src', 'assets', 'app-icons', 'favicon.ico');
const faviconDest = path.join(distDir, 'favicon.ico');

if (fs.existsSync(faviconSource) && fs.existsSync(distDir)) {
  try {
    fs.copyFileSync(faviconSource, faviconDest);
    console.log('✅ Favicon copied to dist root');
  } catch (err) {
    console.error('❌ Error copying favicon:', err);
  }
} else {
  console.log('⚠️  Favicon source or dist directory not found');
}
