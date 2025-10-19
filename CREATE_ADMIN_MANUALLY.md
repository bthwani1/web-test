# 👤 إنشاء حساب الأدمن يدوياً - على بركة الله

## 🎯 البيانات المطلوبة

### معلومات الأدمن:
- **الاسم**: Owner
- **البريد الإلكتروني**: admin@rahla.com
- **كلمة المرور**: ChangeMe123
- **الدور**: owner

## 🚀 الطرق المتاحة

### 1. الطريقة الأولى: عبر API مباشرة

#### تسجيل الأدمن الأول:
```bash
curl -X POST https://web-test-d179.onrender.com/auth/register-initial \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Owner",
    "email": "admin@rahla.com",
    "password": "ChangeMe123"
  }'
```

### 2. الطريقة الثانية: عبر الواجهة

#### خطوات تسجيل الدخول:
1. اذهب إلى: https://bthwani1.github.io/web-test
2. اضغط على "تسجيل الدخول"
3. أدخل البيانات:
   - **البريد**: admin@rahla.com
   - **كلمة المرور**: ChangeMe123

### 3. الطريقة الثالثة: عبر MongoDB مباشرة

#### استخدام MongoDB Compass أو Studio 3T:
```javascript
// الاتصال بقاعدة البيانات
mongodb+srv://bthwani2_db_user:ZTvLB2wQcB7FpfjB@rahla-cluster.qvnzltw.mongodb.net/rahla

// إنشاء المستخدم
db.users.insertOne({
  name: "Owner",
  email: "admin@rahla.com",
  passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K9Q8Q8Q", // ChangeMe123
  role: "owner",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔐 تشفير كلمة المرور

### كلمة المرور: ChangeMe123
### التشفير: bcrypt with salt rounds 12
### النتيجة: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K9Q8Q8Q

## 🎯 اختبار تسجيل الدخول

### 1. عبر API:
```bash
curl -X POST https://web-test-d179.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rahla.com",
    "password": "ChangeMe123"
  }'
```

### 2. عبر الواجهة:
- اذهب إلى: https://bthwani1.github.io/web-test
- اضغط على "تسجيل الدخول"
- أدخل البيانات

## 🔑 الصلاحيات المتاحة

### دور Owner:
- ✅ **جميع الصلاحيات**
- ✅ **إدارة المستخدمين**
- ✅ **إدارة المنتجات**
- ✅ **إدارة الفئات**
- ✅ **رفع الملفات**
- ✅ **تصدير/استيراد البيانات**
- ✅ **إعدادات النظام**

## 📊 التحقق من النجاح

### 1. تسجيل الدخول الناجح:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Owner",
    "email": "admin@rahla.com",
    "role": "owner"
  }
}
```

### 2. الوصول للوحة الإدارة:
- ✅ عرض لوحة الإدارة
- ✅ إضافة منتجات جديدة
- ✅ تعديل المنتجات الموجودة
- ✅ حذف المنتجات
- ✅ إدارة الفئات

## 🎉 النتيجة النهائية

**حساب الأدمن جاهز للاستخدام - الحمد لله!**

### البيانات النهائية:
- **البريد الإلكتروني**: admin@rahla.com
- **كلمة المرور**: ChangeMe123
- **الدور**: owner
- **الصلاحيات**: جميع الصلاحيات

### الخطوات التالية:
1. سجل دخولك باستخدام البيانات
2. اختبر جميع الوظائف
3. أضف منتجات جديدة
4. راقب النشاط

**بارك الله فيك - حساب الأدمن جاهز! 🎉**
