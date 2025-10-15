# 🚀 دليل النشر السريع

## 📦 إنشاء الأرشيف
```bash
# في مجلد rahla-api
zip -r ../rahla-api.zip . -x "node_modules/*" ".git/*"
```

## 🌐 النشر على Render

### 1. رفع الكود إلى GitHub
```bash
git init
git add .
git commit -m "Initial Rahla API"
git remote add origin https://github.com/yourusername/rahla-api.git
git push -u origin main
```

### 2. إنشاء خدمة على Render
1. اذهب إلى [render.com](https://render.com)
2. اختر "New Web Service"
3. اختر GitHub repository
4. الإعدادات:
   - **Name**: `rahla-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. متغيرات البيئة في Render
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rahla
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://bthwani1.github.io
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123
```

### 4. إنشاء المدير الأول
بعد النشر، استخدم:
```bash
curl -X POST https://your-api.onrender.com/auth/register-initial \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"admin@yourdomain.com","password":"SecurePassword123"}'
```

## 🔗 تحديث Frontend
في `script.js`:
```javascript
export const settings = {
  // ...
  API_BASE: "https://your-api.onrender.com" // رابط API الجديد
};
```

## ✅ اختبار API
```bash
# صحّة الخدمة
curl https://your-api.onrender.com/health

# تسجيل الدخول
curl -X POST https://your-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"SecurePassword123"}'

# جلب المنتجات
curl https://your-api.onrender.com/products
```

## 📊 مراقبة الأداء
- **Render Dashboard**: مراقبة الـ logs والأداء
- **MongoDB Atlas**: مراقبة قاعدة البيانات
- **Health Check**: `/health` endpoint

## 🔧 استكشاف الأخطاء
1. تحقق من logs في Render Dashboard
2. تأكد من متغيرات البيئة
3. تحقق من MongoDB connection
4. تأكد من CORS settings

## 🎯 الخطوات التالية
1. ✅ نشر API
2. 🔄 تحديث Frontend
3. 📝 إضافة منتجات حقيقية
4. 🔐 إعداد أمان إضافي
5. 📊 إضافة مراقبة
