/**
 * Google OAuth Configuration Verification Script
 * Run this to check if your OAuth setup is correct before testing
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔍 Checking Google OAuth Configuration...\n');

const checks = [];
let allPassed = true;

// Check 1: Google Client ID
const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
  checks.push({ status: '❌', message: 'GOOGLE_CLIENT_ID is missing or not set' });
  allPassed = false;
} else if (clientId.includes('.apps.googleusercontent.com')) {
  checks.push({ status: '✅', message: 'GOOGLE_CLIENT_ID looks valid' });
} else {
  checks.push({ status: '⚠️', message: 'GOOGLE_CLIENT_ID is set but format looks unusual' });
}

// Check 2: Google Client Secret
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientSecret || clientSecret === 'YOUR_GOOGLE_CLIENT_SECRET') {
  checks.push({ status: '❌', message: 'GOOGLE_CLIENT_SECRET is missing or not set' });
  allPassed = false;
} else if (clientSecret.length > 20) {
  checks.push({ status: '✅', message: 'GOOGLE_CLIENT_SECRET is set' });
} else {
  checks.push({ status: '⚠️', message: 'GOOGLE_CLIENT_SECRET seems too short' });
}

// Check 3: Callback URL
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
const expectedCallback = 'http://localhost:3000/api/auth/google/callback';
if (!callbackUrl) {
  checks.push({ status: '❌', message: 'GOOGLE_CALLBACK_URL is missing' });
  allPassed = false;
} else if (callbackUrl === expectedCallback) {
  checks.push({ status: '✅', message: `GOOGLE_CALLBACK_URL is correct: ${callbackUrl}` });
} else {
  checks.push({ status: '⚠️', message: `GOOGLE_CALLBACK_URL is "${callbackUrl}" (expected: "${expectedCallback}")` });
  allPassed = false;
}

// Check 4: Session Secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  checks.push({ status: '⚠️', message: 'SESSION_SECRET not set (will use default)' });
} else if (sessionSecret.length < 20) {
  checks.push({ status: '⚠️', message: 'SESSION_SECRET is too short (should be 32+ characters)' });
} else {
  checks.push({ status: '✅', message: 'SESSION_SECRET is set' });
}

// Check 5: Port
const port = process.env.PORT || '3000';
if (port === '3000') {
  checks.push({ status: '✅', message: 'PORT is 3000 (default)' });
} else {
  checks.push({ status: '⚠️', message: `PORT is ${port} (callback URL should match!)` });
}

// Print results
checks.forEach(check => {
  console.log(`${check.status} ${check.message}`);
});

console.log('\n' + '='.repeat(70) + '\n');

if (allPassed) {
  console.log('✨ All checks passed! Your OAuth configuration looks good.\n');
  console.log('📋 Next steps:');
  console.log('   1. Make sure you\'ve configured Google Cloud Console');
  console.log('   2. Added authorized redirect URI: ' + expectedCallback);
  console.log('   3. Added your email as a test user');
  console.log('   4. Run: npm run dev');
  console.log('   5. Navigate to: http://localhost:5173');
  console.log('   6. Click "Sign in with Google"\n');
} else {
  console.log('⚠️  Some configuration issues detected.\n');
  console.log('📋 To fix:');
  console.log('   1. Open your .env file');
  console.log('   2. Get credentials from: https://console.cloud.google.com/apis/credentials');
  console.log('   3. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  console.log('   4. Run this script again to verify\n');
}

console.log('📖 For detailed setup instructions, see: GOOGLE_OAUTH_COMPLETE_SETUP.md\n');
