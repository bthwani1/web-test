# 🔧 دليل إعداد متغيرات البيئة - Rahla Store

## 📋 المتغيرات المطلوبة

### 1. **GitHub Repository Variables**

#### إعداد في GitHub:
```
Settings → Secrets and variables → Actions → Variables
```

#### المتغيرات المطلوبة:
```bash
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
```

### 2. **Render Environment Variables**

#### إعداد في Render Dashboard:
```
Dashboard → Your Service → Environment
```

#### المتغيرات المطلوبة:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rahla-store?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
CORS_ORIGIN=https://bthwani1.github.io

# CDN
BUNNY_STORAGE_FTP_PASSWORD=your-bunny-cdn-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. **Frontend Configuration**

#### GA4 Measurement ID:
```html
<!-- في index.html السطر 79 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
<!-- استبدل G-XXXXXX بـ GA4 Measurement ID الحقيقي -->
```

#### PostHog (اختياري):
```javascript
// في script.js
window.posthog?.capture('event_name', { data: 'value' });
```

## 🚀 خطوات الإعداد

### 1. **إعداد MongoDB Atlas**
```bash
1. إنشاء حساب في MongoDB Atlas
2. إنشاء cluster جديد
3. إنشاء database باسم "rahla-store"
4. إنشاء user مع صلاحيات read/write
5. الحصول على connection string
```

### 2. **إعداد Render**
```bash
1. إنشاء حساب في Render
2. إنشاء Web Service جديد
3. ربط GitHub repository
4. إضافة Environment Variables
5. الحصول على Service ID و API Key
```

### 3. **إعداد Bunny CDN**
```bash
1. إنشاء حساب في Bunny CDN
2. إنشاء Storage Zone
3. الحصول على FTP Password
4. رفع الصور إلى Storage Zone
```

### 4. **إعداد Sentry**
```bash
1. إنشاء حساب في Sentry
2. إنشاء project جديد
3. الحصول على DSN
4. إضافة DSN في Render Environment
```

### 5. **إعداد Google Analytics**
```bash
1. إنشاء حساب في Google Analytics
2. إنشاء property جديد
3. الحصول على Measurement ID
4. استبدال G-XXXXXX في index.html
```

## ✅ التحقق من الإعداد

### 1. **اختبار Backend**
```bash
curl https://your-render-app.onrender.com/health
# يجب أن يعيد: {"ok":true,"time":"..."}
```

### 2. **اختبار Frontend**
```bash
# افتح: https://bthwani1.github.io/web-test
# تحقق من:
# - تحميل الصفحة بدون أخطاء
# - ظهور المنتجات
# - عمل البحث والفلترة
# - عمل سلة التسوق
```

### 3. **اختبار Admin Panel**
```bash
# تسجيل الدخول كـ admin
# تحقق من:
# - إضافة منتجات جديدة
# - تعديل المنتجات
# - حذف المنتجات
# - رفع الصور
```

## 🔒 الأمان

### 1. **JWT Secret**
```bash
# استخدم مفتاح قوي (32+ حرف)
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-min
```

### 2. **MongoDB Security**
```bash
# استخدم connection string آمن
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rahla-store?retryWrites=true&w=majority
```

### 3. **CORS Configuration**
```bash
# تأكد من أن CORS_ORIGIN صحيح
CORS_ORIGIN=https://bthwani1.github.io
```

## 📊 المراقبة

### 1. **Google Analytics**
- تتبع الزوار
- تتبع الأحداث
- تتبع Web Vitals

### 2. **Sentry**
- مراقبة الأخطاء
- تتبع الأداء
- تنبيهات الأخطاء

### 3. **Render Dashboard**
- مراقبة الأداء
- تتبع الاستخدام
- تنبيهات المشاكل

## 🎯 النتيجة النهائية

بعد إكمال جميع المتغيرات البيئية:

1. **Backend**: سيعمل على Render مع MongoDB
2. **Frontend**: سيعمل على GitHub Pages
3. **CDN**: ستعمل الصور من Bunny CDN
4. **Monitoring**: ستعمل المراقبة مع GA4 و Sentry
5. **CI/CD**: سيعمل النشر التلقائي مع GitHub Actions

**المشروع سيكون جاهزاً للإنتاج بنسبة 100%! 🚀**

