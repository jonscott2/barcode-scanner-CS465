#!/usr/bin/env node
/**
 * Script to update Firebase configuration after creating a new project
 * Usage: node update-new-firebase-config.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function updateFirebaseConfig() {
  console.log('🔥 Firebase Configuration Updater');
  console.log('==================================\n');

  console.log('Please provide your new Firebase project configuration:');
  console.log('(You can find this in Firebase Console → Project Settings → Your apps → Web app)\n');

  const apiKey = await question('API Key: ');
  const authDomain = await question('Auth Domain: ');
  const projectId = await question('Project ID: ');
  const storageBucket = await question('Storage Bucket: ');
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');
  const measurementId = await question('Measurement ID (optional, press Enter to skip): ');

  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId && { measurementId })
  };

  // Update index.html
  const indexHtmlPath = path.join(__dirname, 'src', 'index.html');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  const configScript = `<script>
    window.__FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 2)};
  </script>`;

  // Replace existing config or add new one
  if (indexHtml.includes('window.__FIREBASE_CONFIG__')) {
    indexHtml = indexHtml.replace(
      /<script>[\s\S]*?window\.__FIREBASE_CONFIG__[\s\S]*?<\/script>/,
      configScript
    );
  } else {
    // Insert before closing head tag
    indexHtml = indexHtml.replace('</head>', `  ${configScript}\n</head>`);
  }

  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Updated src/index.html');

  // Update firebase-config.js
  const firebaseConfigPath = path.join(__dirname, 'src', 'js', 'services', 'firebase-config.js');
  let firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');

  // Update default values
  firebaseConfig = firebaseConfig.replace(
    /apiKey: process\.env\.FIREBASE_API_KEY \|\| '[^']*'/,
    `apiKey: process.env.FIREBASE_API_KEY || '${apiKey}'`
  );
  firebaseConfig = firebaseConfig.replace(
    /authDomain: process\.env\.FIREBASE_AUTH_DOMAIN \|\| '[^']*'/,
    `authDomain: process.env.FIREBASE_AUTH_DOMAIN || '${authDomain}'`
  );
  firebaseConfig = firebaseConfig.replace(
    /projectId: process\.env\.FIREBASE_PROJECT_ID \|\| '[^']*'/,
    `projectId: process.env.FIREBASE_PROJECT_ID || '${projectId}'`
  );
  firebaseConfig = firebaseConfig.replace(
    /storageBucket: process\.env\.FIREBASE_STORAGE_BUCKET \|\| '[^']*'/,
    `storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '${storageBucket}'`
  );
  firebaseConfig = firebaseConfig.replace(
    /messagingSenderId: process\.env\.FIREBASE_MESSAGING_SENDER_ID \|\| '[^']*'/,
    `messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '${messagingSenderId}'`
  );
  firebaseConfig = firebaseConfig.replace(
    /appId: process\.env\.FIREBASE_APP_ID \|\| '[^']*'/,
    `appId: process.env.FIREBASE_APP_ID || '${appId}'`
  );

  if (measurementId) {
    firebaseConfig = firebaseConfig.replace(
      /measurementId: process\.env\.FIREBASE_MEASUREMENT_ID \|\| '[^']*'/,
      `measurementId: process.env.FIREBASE_MEASUREMENT_ID || '${measurementId}'`
    );
  }

  fs.writeFileSync(firebaseConfigPath, firebaseConfig);
  console.log('✅ Updated src/js/services/firebase-config.js');

  // Update .firebaserc
  const firebasercPath = path.join(__dirname, '.firebaserc');
  const firebaserc = {
    projects: {
      default: projectId
    }
  };
  fs.writeFileSync(firebasercPath, JSON.stringify(firebaserc, null, 2) + '\n');
  console.log('✅ Updated .firebaserc');

  console.log('\n🎉 Configuration updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Switch Firebase project: firebase use --add');
  console.log('2. Select your new project from the list');
  console.log('3. Build: npm run build');
  console.log('4. Deploy: firebase deploy --only hosting,firestore:rules');
  console.log('\nYour new domain will be: https://' + projectId + '.web.app');

  rl.close();
}

updateFirebaseConfig().catch(console.error);
