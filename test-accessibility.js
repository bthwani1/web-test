#!/usr/bin/env node

/**
 * اختبار إمكانية الوصول باستخدام Pa11y
 * Accessibility Testing with Pa11y
 */

const pa11y = require('pa11y');
const config = require('./pa11y.config.js');

async function runAccessibilityTests() {
  console.log('🔍 بدء اختبارات إمكانية الوصول...\n');
  
  let totalIssues = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testConfig of config.urls) {
    try {
      console.log(`📋 اختبار: ${testConfig.url}`);
      
      const results = await pa11y(testConfig.url, {
        ...config.defaults,
        actions: testConfig.actions
      });
      
      if (results.issues.length === 0) {
        console.log('✅ نجح الاختبار - لا توجد مشاكل في إمكانية الوصول');
        passedTests++;
      } else {
        console.log(`❌ فشل الاختبار - ${results.issues.length} مشكلة:`);
        results.issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.message}`);
          console.log(`     العنصر: ${issue.selector}`);
          console.log(`     المعيار: ${issue.code}`);
          console.log('');
        });
        failedTests++;
        totalIssues += results.issues.length;
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
      failedTests++;
    }
    
    console.log('─'.repeat(50));
  }
  
  // تقرير النتائج
  console.log('\n📊 تقرير النتائج النهائي:');
  console.log(`✅ اختبارات نجحت: ${passedTests}`);
  console.log(`❌ اختبارات فشلت: ${failedTests}`);
  console.log(`🔢 إجمالي المشاكل: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 جميع اختبارات إمكانية الوصول نجحت!');
    process.exit(0);
  } else {
    console.log('\n⚠️  يوجد مشاكل في إمكانية الوصول تحتاج إلى إصلاح');
    process.exit(1);
  }
}

// تشغيل الاختبارات
runAccessibilityTests().catch(error => {
  console.error('❌ خطأ في تشغيل الاختبارات:', error);
  process.exit(1);
});
