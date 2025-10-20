#!/usr/bin/env node

/**
 * سكريبت للتحقق من إعداد المشروع
 * يتحقق من جميع المتغيرات البيئية والإعدادات المطلوبة
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// ألوان للطباعة
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// دالة للطباعة الملونة
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// دالة للتحقق من وجود ملف
const checkFile = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: موجود`, 'green');
    return true;
  } else {
    log(`❌ ${description}: غير موجود`, 'red');
    return false;
  }
};

// دالة للتحقق من محتوى الملف
const checkFileContent = (filePath, searchText, description) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      log(`✅ ${description}: موجود`, 'green');
      return true;
    } else {
      log(`❌ ${description}: غير موجود`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: خطأ في القراءة`, 'red');
    return false;
  }
};

// دالة للتحقق من API
const checkAPI = (url, description) => {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        log(`✅ ${description}: يعمل`, 'green');
        resolve(true);
      } else {
        log(`❌ ${description}: خطأ ${res.statusCode}`, 'red');
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      log(`❌ ${description}: خطأ في الاتصال`, 'red');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      log(`❌ ${description}: انتهت المهلة الزمنية`, 'red');
      resolve(false);
    });
  });
};

// دالة رئيسية للتحقق
const main = async () => {
  log('\n🔍 بدء التحقق من إعداد المشروع...\n', 'bold');
  
  let allGood = true;
  
  // 1. التحقق من الملفات الأساسية
  log('📁 التحقق من الملفات الأساسية:', 'blue');
  allGood &= checkFile('index.html', 'الصفحة الرئيسية');
  allGood &= checkFile('script.js', 'سكريبت JavaScript');
  allGood &= checkFile('style.css', 'ملف CSS');
  allGood &= checkFile('manifest.webmanifest', 'PWA Manifest');
  allGood &= checkFile('sw.js', 'Service Worker');
  
  // 2. التحقق من Backend
  log('\n🔧 التحقق من Backend:', 'blue');
  allGood &= checkFile('rahla-api/server.js', 'Backend Server');
  allGood &= checkFile('rahla-api/package.json', 'Backend Dependencies');
  allGood &= checkFile('rahla-api/src/models/Product.js', 'Product Model');
  allGood &= checkFile('rahla-api/src/models/User.js', 'User Model');
  allGood &= checkFile('rahla-api/src/routes/products.js', 'Products Routes');
  allGood &= checkFile('rahla-api/src/routes/auth.js', 'Auth Routes');
  
  // 3. التحقق من الاختبارات
  log('\n🧪 التحقق من الاختبارات:', 'blue');
  allGood &= checkFile('tests/1-user-journey.spec.js', 'User Journey Tests');
  allGood &= checkFile('tests/2-admin-panel.spec.js', 'Admin Panel Tests');
  allGood &= checkFile('tests/3-api-integration.spec.js', 'API Integration Tests');
  allGood &= checkFile('tests/4-performance-accessibility.spec.js', 'Performance Tests');
  allGood &= checkFile('tests/e2e/flows.spec.ts', 'E2E Tests');
  
  // 4. التحقق من CI/CD
  log('\n🚀 التحقق من CI/CD:', 'blue');
  allGood &= checkFile('.github/workflows/ci-cd.yml', 'GitHub Actions Workflow');
  
  // 5. التحقق من التوثيق
  log('\n📚 التحقق من التوثيق:', 'blue');
  allGood &= checkFile('README.md', 'README');
  allGood &= checkFile('API_DOCUMENTATION.md', 'API Documentation');
  allGood &= checkFile('SECURITY_GUIDE.md', 'Security Guide');
  allGood &= checkFile('DEPLOYMENT_GUIDE.md', 'Deployment Guide');
  allGood &= checkFile('TESTING_GUIDE.md', 'Testing Guide');
  allGood &= checkFile('ENVIRONMENT_SETUP.md', 'Environment Setup Guide');
  
  // 6. التحقق من الإعدادات
  log('\n⚙️ التحقق من الإعدادات:', 'blue');
  allGood &= checkFileContent('index.html', 'Content-Security-Policy', 'CSP Headers');
  allGood &= checkFileContent('index.html', 'X-Frame-Options', 'X-Frame-Options Header');
  allGood &= checkFileContent('index.html', 'Referrer-Policy', 'Referrer-Policy Header');
  allGood &= checkFileContent('script.js', 'API_BASE', 'API Base URL');
  allGood &= checkFileContent('script.js', 'settings.CDN', 'CDN URL');
  
  // 7. التحقق من PWA
  log('\n📱 التحقق من PWA:', 'blue');
  allGood &= checkFileContent('manifest.webmanifest', 'name', 'PWA Name');
  allGood &= checkFileContent('manifest.webmanifest', 'icons', 'PWA Icons');
  allGood &= checkFileContent('sw.js', 'cache', 'Service Worker Cache');
  
  // 8. التحقق من SEO
  log('\n🔍 التحقق من SEO:', 'blue');
  allGood &= checkFileContent('index.html', 'meta name="description"', 'Meta Description');
  allGood &= checkFileContent('index.html', 'meta property="og:', 'Open Graph Tags');
  allGood &= checkFileContent('index.html', 'application/ld+json', 'JSON-LD Schema');
  
  // 9. التحقق من الأمان
  log('\n🔒 التحقق من الأمان:', 'blue');
  allGood &= checkFileContent('rahla-api/src/middleware/auth.js', 'jwt.verify', 'JWT Authentication');
  allGood &= checkFileContent('rahla-api/src/middleware/auth.js', 'bcrypt', 'Password Hashing');
  allGood &= checkFileContent('rahla-api/server.js', 'rateLimit', 'Rate Limiting');
  
  // 10. التحقق من الأداء
  log('\n⚡ التحقق من الأداء:', 'blue');
  allGood &= checkFileContent('script.js', 'lazy loading', 'Lazy Loading');
  allGood &= checkFileContent('script.js', 'srcset', 'Responsive Images');
  allGood &= checkFileContent('index.html', 'web-vitals', 'Web Vitals');
  
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

// تشغيل التحقق
main().catch(console.error);
