#!/usr/bin/env node

/**
 * اختبار الأداء باستخدام Lighthouse CI
 * Performance Testing with Lighthouse CI
 */

const { spawn } = require('child_process');
const path = require('path');

async function runPerformanceTests() {
  console.log('🚀 بدء اختبارات الأداء...\n');
  
  return new Promise((resolve, reject) => {
    const lhci = spawn('npx', ['lhci', 'autorun'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    lhci.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ جميع اختبارات الأداء نجحت!');
        resolve(true);
      } else {
        console.log('\n❌ فشل في بعض اختبارات الأداء');
        resolve(false);
      }
    });
    
    lhci.on('error', (error) => {
      console.error('❌ خطأ في تشغيل Lighthouse CI:', error);
      reject(error);
    });
  });
}

// تشغيل الاختبارات
runPerformanceTests()
  .then(success => {
    if (success) {
      console.log('🎉 جميع اختبارات الأداء مكتملة بنجاح!');
      process.exit(0);
    } else {
      console.log('⚠️  بعض اختبارات الأداء تحتاج إلى تحسين');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ خطأ في تشغيل اختبارات الأداء:', error);
    process.exit(1);
  });
