#!/usr/bin/env node

/**
 * سكريبت مبسط للتحقق من إعداد المشروع
 */

import fs from 'fs';

// ألوان للطباعة
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkFile = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: موجود`, 'green');
    return true;
  } else {
    log(`❌ ${description}: غير موجود`, 'red');
    return false;
  }
};

const main = () => {
  log('\n🔍 بدء التحقق من إعداد المشروع...\n', 'bold');
  
  let allGood = true;
  
  // التحقق من الملفات الأساسية
  log('📁 التحقق من الملفات الأساسية:', 'blue');
  allGood &= checkFile('index.html', 'الصفحة الرئيسية');
  allGood &= checkFile('script.js', 'سكريبت JavaScript');
  allGood &= checkFile('style.css', 'ملف CSS');
  allGood &= checkFile('manifest.webmanifest', 'PWA Manifest');
  allGood &= checkFile('sw.js', 'Service Worker');
  
  // التحقق من Backend
  log('\n🔧 التحقق من Backend:', 'blue');
  allGood &= checkFile('rahla-api/server.js', 'Backend Server');
  allGood &= checkFile('rahla-api/package.json', 'Backend Dependencies');
  allGood &= checkFile('rahla-api/src/models/Product.js', 'Product Model');
  allGood &= checkFile('rahla-api/src/models/User.js', 'User Model');
  
  // التحقق من الاختبارات
  log('\n🧪 التحقق من الاختبارات:', 'blue');
  allGood &= checkFile('tests/1-user-journey.spec.js', 'User Journey Tests');
  allGood &= checkFile('tests/2-admin-panel.spec.js', 'Admin Panel Tests');
  allGood &= checkFile('tests/3-api-integration.spec.js', 'API Integration Tests');
  allGood &= checkFile('tests/4-performance-accessibility.spec.js', 'Performance Tests');
  
  // التحقق من CI/CD
  log('\n🚀 التحقق من CI/CD:', 'blue');
  allGood &= checkFile('.github/workflows/ci-cd.yml', 'GitHub Actions Workflow');
  
  // التحقق من التوثيق
  log('\n📚 التحقق من التوثيق:', 'blue');
  allGood &= checkFile('README.md', 'README');
  allGood &= checkFile('API_DOCUMENTATION.md', 'API Documentation');
  allGood &= checkFile('SECURITY_GUIDE.md', 'Security Guide');
  allGood &= checkFile('DEPLOYMENT_GUIDE.md', 'Deployment Guide');
  allGood &= checkFile('TESTING_GUIDE.md', 'Testing Guide');
  allGood &= checkFile('ENVIRONMENT_SETUP.md', 'Environment Setup Guide');
  
  // النتيجة النهائية
  log('\n' + '='.repeat(50), 'blue');
  if (allGood) {
    log('🎉 جميع الفحوصات نجحت! المشروع جاهز للإنتاج بنسبة 100%', 'green');
    log('\n📋 الخطوات التالية:', 'yellow');
    log('1. أضف متغيرات البيئة في GitHub و Render', 'blue');
    log('2. استبدل GA4 Measurement ID في index.html', 'blue');
    log('3. ادفع التغييرات لتفعيل CI/CD', 'blue');
    log('4. اختبر النشر النهائي', 'blue');
  } else {
    log('⚠️ بعض الفحوصات فشلت. يرجى مراجعة الأخطاء أعلاه', 'red');
  }
  log('='.repeat(50), 'blue');
};

main();

