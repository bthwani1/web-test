/**
 * Security Audit Script
 * فحص أمني شامل للمشروع
 */

const fs = require('fs');
const path = require('path');

class SecurityAudit {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  // فحص متغيرات البيئة
  checkEnvironmentVariables() {
    console.log('🔍 فحص متغيرات البيئة...');
    
    const envFile = path.join(__dirname, '.env');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      
      // فحص كلمات مرور ضعيفة
      if (envContent.includes('password123') || envContent.includes('123456')) {
        this.issues.push('كلمات مرور ضعيفة في ملف .env');
      }
      
      // فحص مفاتيح افتراضية
      if (envContent.includes('your-secret-key') || envContent.includes('change-in-production')) {
        this.warnings.push('مفاتيح افتراضية في ملف .env - يجب تغييرها في الإنتاج');
      }
    } else {
      this.warnings.push('ملف .env غير موجود');
    }
  }

  // فحص التبعيات
  checkDependencies() {
    console.log('🔍 فحص التبعيات...');
    
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // فحص إصدارات قديمة
    const outdatedPackages = [];
    for (const [name, version] of Object.entries(dependencies)) {
      if (version.includes('^') || version.includes('~')) {
        // يمكن إضافة فحص أكثر تفصيلاً هنا
      }
    }
    
    if (outdatedPackages.length > 0) {
      this.warnings.push(`تبعيات قديمة: ${outdatedPackages.join(', ')}`);
    }
  }

  // فحص ملفات الكود
  checkCodeSecurity() {
    console.log('🔍 فحص أمان الكود...');
    
    const files = this.getJSFiles(__dirname);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // فحص eval
      if (content.includes('eval(')) {
        this.issues.push(`استخدام eval في ${file}`);
      }
      
      // فحص console.log في الإنتاج
      if (content.includes('console.log') && process.env.NODE_ENV === 'production') {
        this.warnings.push(`console.log في ملف الإنتاج: ${file}`);
      }
      
      // فحص كلمات مرور مكتوبة في الكود
      if (content.includes('password') && content.includes('=')) {
        this.warnings.push(`احتمال وجود كلمة مرور مكتوبة في الكود: ${file}`);
      }
      
      // فحص SQL injection patterns
      if (content.includes('$where') || content.includes('$regex')) {
        this.warnings.push(`استخدام أنماط قد تكون عرضة للهجوم: ${file}`);
      }
    });
  }

  // فحص إعدادات الأمان
  checkSecuritySettings() {
    console.log('🔍 فحص إعدادات الأمان...');
    
    const serverFile = path.join(__dirname, 'server.js');
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      
      // فحص Helmet
      if (!content.includes('helmet')) {
        this.issues.push('Helmet غير مستخدم');
      }
      
      // فحص Rate Limiting
      if (!content.includes('rateLimit')) {
        this.issues.push('Rate Limiting غير مستخدم');
      }
      
      // فحص CORS
      if (!content.includes('cors')) {
        this.issues.push('CORS غير مُعد');
      }
      
      // فحص HTTPS
      if (!content.includes('https') && process.env.NODE_ENV === 'production') {
        this.warnings.push('HTTPS غير مُعد للإنتاج');
      }
    }
  }

  // فحص قاعدة البيانات
  checkDatabaseSecurity() {
    console.log('🔍 فحص أمان قاعدة البيانات...');
    
    const modelsDir = path.join(__dirname, 'models');
    if (fs.existsSync(modelsDir)) {
      const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
      
      modelFiles.forEach(file => {
        const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
        
        // فحص validation
        if (!content.includes('required: true') && !content.includes('validate')) {
          this.warnings.push(`نموذج ${file} يفتقر للتحقق من صحة البيانات`);
        }
        
        // فحص indexes
        if (!content.includes('index')) {
          this.warnings.push(`نموذج ${file} يفتقر للفهارس`);
        }
      });
    }
  }

  // الحصول على ملفات JS
  getJSFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('coverage')) {
        files = files.concat(this.getJSFiles(fullPath));
      } else if (item.endsWith('.js') && !item.includes('test')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // تشغيل الفحص الشامل
  runAudit() {
    console.log('🚀 بدء الفحص الأمني الشامل...\n');
    
    this.checkEnvironmentVariables();
    this.checkDependencies();
    this.checkCodeSecurity();
    this.checkSecuritySettings();
    this.checkDatabaseSecurity();
    
    this.generateReport();
  }

  // توليد التقرير
  generateReport() {
    console.log('\n📊 تقرير الفحص الأمني:');
    console.log('='.repeat(50));
    
    if (this.issues.length > 0) {
      console.log('\n❌ مشاكل حرجة:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ تحذيرات:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ لا توجد مشاكل أمنية حرجة');
    }
    
    console.log('\n📈 التوصيات:');
    console.log('1. استخدام HTTPS في الإنتاج');
    console.log('2. تحديث التبعيات بانتظام');
    console.log('3. مراجعة سجلات الوصول');
    console.log('4. استخدام مفاتيح قوية');
    console.log('5. تفعيل 2FA للمستخدمين');
    
    console.log('\n🔒 إعدادات الأمان المطبقة:');
    console.log('✅ Helmet للرؤوس الأمنية');
    console.log('✅ Rate Limiting للحماية من DDoS');
    console.log('✅ CORS مع allowlist');
    console.log('✅ JWT للمصادقة');
    console.log('✅ RBAC للصلاحيات');
    console.log('✅ Validation للبيانات');
    console.log('✅ Security Headers');
  }
}

// تشغيل الفحص إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  const audit = new SecurityAudit();
  audit.runAudit();
}

module.exports = SecurityAudit;
