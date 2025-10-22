#!/usr/bin/env node

// Environment Variables Checker
// This script checks if all required environment variables are properly configured

import { config } from './config.js';

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'GA4_MEASUREMENT_ID',
  'STORE_NAME',
  'CURRENCY',
  'API_BASE_URL',
  'CDN_URL',
  'WHATSAPP_NUMBER'
];

const optionalVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'BUNNY_CDN_API_KEY',
  'SENTRY_DSN',
  'POSTHOG_API_KEY'
];

let hasErrors = false;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = config[varName];
  if (value && value !== 'G-XXXXXX' && !value.includes('your-') && value !== 'ChangeMe123') {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`  ❌ ${varName}: ${value || 'NOT SET'} (needs to be configured)`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = config[varName];
  if (value && !value.includes('your-') && value !== 'change_me_strong_secret') {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`  ⚠️  ${varName}: ${value || 'NOT SET'} (using default)`);
  }
});

console.log('\n🔧 Configuration Summary:');
console.log(`  Store Name: ${config.STORE_NAME}`);
console.log(`  Currency: ${config.CURRENCY}`);
console.log(`  Debug Mode: ${config.DEBUG_MODE}`);
console.log(`  Environment: ${config.NODE_ENV}`);
console.log(`  Free Shipping Threshold: ${config.FREE_SHIPPING_THRESHOLD} ${config.CURRENCY}`);

console.log('\n📊 Google Analytics 4:');
if (config.GA4_MEASUREMENT_ID && config.GA4_MEASUREMENT_ID !== 'G-XXXXXX') {
  console.log(`  ✅ GA4 ID: ${config.GA4_MEASUREMENT_ID}`);
  console.log(`  Status: ${config.DEBUG_MODE ? 'Disabled (Debug Mode)' : 'Enabled'}`);
} else {
  console.log('  ❌ GA4 ID: Not configured properly');
  hasErrors = true;
}

if (hasErrors) {
  console.log('\n❌ Some required variables need to be configured.');
  console.log('Please check the ENVIRONMENT_SETUP.md file for instructions.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are properly configured!');
  console.log('🚀 Your application is ready to run.');
}
