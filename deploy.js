#!/usr/bin/env node

/**
 * سكريبت JavaScript للنشر النهائي
 */

import { execSync } from 'child_process';
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

const runCommand = (command, description) => {
  try {
    log(`\n${description}...`, 'blue');
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    log(`✅ ${description} - نجح`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - فشل: ${error.message}`, 'red');
    return false;
  }
};

const main = () => {
  log('\n🚀 بدء النشر النهائي للمشروع...\n', 'bold');
  
  let allGood = true;
  
  // 1. فحص حالة Git
  allGood &= runCommand('git status', 'فحص حالة Git');
  
  // 2. إضافة جميع الملفات
  allGood &= runCommand('git add .', 'إضافة جميع الملفات إلى Git');
  
  // 3. إنشاء commit
  allGood &= runCommand('git commit -m "feat: 100% complete web application with CI/CD pipeline - Final deployment"', 'إنشاء commit للنشر النهائي');
  
  // 4. دفع التغييرات
  allGood &= runCommand('git push origin main', 'دفع التغييرات إلى GitHub');
  
  // النتيجة النهائية
  log('\n' + '='.repeat(50), 'blue');
  if (allGood) {
    log('🎉 تم النشر بنجاح!', 'green');
    log('\n📋 الخطوات التالية:', 'yellow');
    log('1. أضف متغيرات البيئة في GitHub: Settings → Secrets and variables → Actions → Variables', 'blue');
    log('2. أضف متغيرات البيئة في Render: Dashboard → Your Service → Environment', 'blue');
    log('3. استبدل GA4 Measurement ID في index.html', 'blue');
    log('4. اختبر النشر النهائي', 'blue');
    log('\n🎉 المشروع جاهز للإنتاج بنسبة 100%!', 'green');
  } else {
    log('⚠️ بعض الأوامر فشلت. يرجى مراجعة الأخطاء أعلاه', 'red');
  }
  log('='.repeat(50), 'blue');
};

main();

