# إعداد المتغيرات البيئية - Environment Variables Setup

## نظرة عامة
تم تحديث المشروع لاستخدام المتغيرات البيئية لإدارة الإعدادات المختلفة. هذا يوفر مرونة أكبر وأمان أفضل للمشروع.

## الملفات المحدثة

### 1. config.js
ملف التكوين الرئيسي الذي يحتوي على جميع المتغيرات البيئية:
- إعدادات المتجر (الاسم، العملة، عتبة الشحن المجاني)
- إعدادات Google Analytics 4
- إعدادات CDN و API
- إعدادات قاعدة البيانات
- إعدادات المراقبة والأمان

### 2. ga4-loader.js
ملف ديناميكي لتحميل Google Analytics 4 بناءً على التكوين:
- تحميل GA4 فقط عند وجود ID صحيح
- تجنب التحميل في وضع التصحيح
- تهيئة تلقائية عند تحميل الصفحة

### 3. script.js
تم تحديث الملف لاستخدام المتغيرات من config.js بدلاً من القيم الثابتة.

### 4. index.html
تم تحديث ملف HTML لاستخدام النظام الديناميكي لتحميل GA4.

## كيفية إعداد المتغيرات البيئية

### للبيئة المحلية (Local Development)

1. **إنشاء ملف .env في المجلد الجذر:**
```bash
# Frontend Environment Variables
GA4_MEASUREMENT_ID=G-YOUR-ACTUAL-GA4-ID
STORE_NAME=رحلة _ Rahla
CURRENCY=YER
FREE_SHIPPING_THRESHOLD=15000
WHATSAPP_NUMBER=9677XXXXXXXX
CDN_URL=https://rahlacdn.b-cdn.net
API_BASE_URL=https://web-test-d179.onrender.com
DEBUG_MODE=true

# Backend API Configuration
BACKEND_PORT=8080
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/rahla?retryWrites=true&w=majority
JWT_SECRET=your-strong-jwt-secret
CORS_ORIGIN=https://bthwani1.github.io,https://bthwani1.github.io/web-test

# CDN Configuration
BUNNY_CDN_API_KEY=your-bunny-api-key
BUNNY_CDN_STORAGE_ZONE=rahlamedia
BUNNY_CDN_PULL_ZONE=rahlacdn

# Monitoring
SENTRY_DSN=your-sentry-dsn-here
POSTHOG_API_KEY=your-posthog-key

# Admin Configuration
ADMIN_NAME=Owner
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=ChangeMe123

# Security
NODE_ENV=development
```

### للبيئة الإنتاجية (Production)

1. **في Render.com أو منصة النشر:**
   - اذهب إلى إعدادات البيئة (Environment Variables)
   - أضف المتغيرات المطلوبة مع القيم الصحيحة

2. **المتغيرات المطلوبة للإنتاج:**
```
GA4_MEASUREMENT_ID=G-YOUR-ACTUAL-GA4-ID
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-actual-connection-string
JWT_SECRET=your-production-jwt-secret
BUNNY_CDN_API_KEY=your-actual-bunny-key
```

## المتغيرات المهمة

### Google Analytics 4
- `GA4_MEASUREMENT_ID`: معرف قياس GA4 (يبدأ بـ G-)
- يتم تحميل GA4 تلقائياً عند وجود ID صحيح
- لا يتم تحميل GA4 في وضع التصحيح

### إعدادات المتجر
- `STORE_NAME`: اسم المتجر
- `CURRENCY`: العملة المستخدمة
- `FREE_SHIPPING_THRESHOLD`: عتبة الشحن المجاني
- `WHATSAPP_NUMBER`: رقم واتساب للتواصل

### إعدادات API و CDN
- `API_BASE_URL`: رابط API الخلفي
- `CDN_URL`: رابط CDN للصور
- `BUNNY_CDN_API_KEY`: مفتاح API لـ Bunny CDN

## التحقق من الإعداد

### 1. فحص المتغيرات في المتصفح
افتح Developer Tools واكتب:
```javascript
import('./config.js').then(config => {
  console.log('Current config:', config.config);
});
```

### 2. فحص GA4
- تأكد من وجود GA4 ID صحيح
- تحقق من تحميل Google Analytics في Network tab
- تأكد من عدم تحميل GA4 في وضع التصحيح

## نصائح الأمان

1. **لا تشارك ملف .env** - أضفه إلى .gitignore
2. **استخدم قيم مختلفة** للإنتاج والتطوير
3. **استخدم JWT secrets قوية** في الإنتاج
4. **تحقق من CORS origins** قبل النشر

## استكشاف الأخطاء

### مشكلة: GA4 لا يعمل
- تأكد من صحة GA4_MEASUREMENT_ID
- تحقق من أن DEBUG_MODE=false
- فحص Console للأخطاء

### مشكلة: API لا يعمل
- تأكد من صحة API_BASE_URL
- تحقق من CORS_ORIGIN
- فحص Network tab للطلبات

### مشكلة: الصور لا تظهر
- تأكد من صحة CDN_URL
- تحقق من BUNNY_CDN_API_KEY
- فحص صحة مسارات الصور

## الملفات المرجعية

- `config.js` - ملف التكوين الرئيسي
- `ga4-loader.js` - محمل GA4 الديناميكي
- `.env.example` - مثال على متغيرات البيئة
- `ENVIRONMENT_SETUP.md` - هذا الملف