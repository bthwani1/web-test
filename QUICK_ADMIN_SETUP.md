# ⚡ إنشاء حساب الأدمن - دليل سريع

## 🚀 الطريقة السريعة

### 1. تشغيل السكريبت التفاعلي
```bash
npm run create-admin
```

### 2. إدخال البيانات
```
👤 الاسم: Owner
📧 البريد الإلكتروني: admin@rahla.com
🔑 كلمة المرور: ChangeMe123
🔑 الدور: owner
```

### 3. النتيجة
```
✅ تم إنشاء حساب الأدمن بنجاح!
📧 البريد الإلكتروني: admin@rahla.com
👤 الاسم: Owner
🔑 الدور: owner
```

## 🔧 الطريقة اليدوية

### 1. إعداد متغيرات البيئة
```bash
# في ملف .env
ADMIN_NAME=Owner
ADMIN_EMAIL=admin@rahla.com
ADMIN_PASSWORD=ChangeMe123
ADMIN_ROLE=owner
MONGODB_URI=mongodb+srv://...
```

### 2. تشغيل السكريبت
```bash
cd rahla-api
npm run seed
```

## 🎯 تسجيل الدخول

### 1. في الواجهة
- اذهب إلى: https://bthwani1.github.io/web-test
- اضغط على "تسجيل الدخول"
- أدخل البيانات

### 2. عبر API
```bash
curl -X POST https://your-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rahla.com",
    "password": "ChangeMe123"
  }'
```

## 🔑 الأدوار المتاحة

- **owner**: جميع الصلاحيات
- **admin**: إدارة المحتوى
- **editor**: تحرير المحتوى
- **viewer**: قراءة فقط

## ✅ النتيجة النهائية

**حساب الأدمن جاهز للاستخدام! 🎉**
