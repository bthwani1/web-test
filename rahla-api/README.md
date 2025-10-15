# Rahla API (Express + MongoDB)

## 1) إعداد محلي
```bash
npm i
cp .env.example .env
# حدث MONGODB_URI و JWT_SECRET
npm run dev
# صحّة
curl http://localhost:8080/health
```

## 2) إنشاء مدير أولي
```bash
npm run seed
```

## 3) API Endpoints

### Auth
- `POST /auth/register-initial` - إنشاء أول مدير (مرة واحدة فقط)
- `POST /auth/login` - تسجيل الدخول

### Categories
- `GET /categories` - قائمة الفئات
- `POST /categories` - إنشاء فئة (owner/admin)
- `PATCH /categories/:id` - تحديث فئة (owner/admin)
- `DELETE /categories/:id` - حذف فئة (owner/admin)

### Products
- `GET /products` - قائمة المنتجات (مع فلاتر)
- `GET /products/:slugOrId` - منتج واحد
- `POST /products` - إنشاء منتج (owner/admin/editor)
- `PATCH /products/:id` - تحديث منتج (owner/admin/editor)
- `DELETE /products/:id` - حذف منتج (owner/admin)

## 4) فلاتر المنتجات
```
GET /products?q=search&category=ملابس&tag=جديد&min=1000&max=5000&sort=price:asc&limit=20&offset=0
```

## 5) النشر على Render
1. ارفع الكود إلى GitHub
2. في Render:
   - اختر "Web Service"
   - ربط مع GitHub repo
   - Build Command: `npm install`
   - Start Command: `npm start`
   - أضف Environment Variables من .env

## 6) متغيرات البيئة
```env
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
CORS_ORIGIN=https://your-domain.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure123
```
