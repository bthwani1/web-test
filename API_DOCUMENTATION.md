# 📚 API Documentation - Rahla Store Backend

## 🔗 Base URL
```
https://web-test-d179.onrender.com
```

## 🔐 Authentication

### Headers Required
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 📋 Endpoints

### 🔑 Authentication Routes

#### POST /auth/register-initial
**Description**: إنشاء أول مستخدم (owner) - مرة واحدة فقط

**Request Body**:
```json
{
  "name": "Owner Name",
  "email": "owner@example.com",
  "password": "SecurePassword123"
}
```

**Response**:
```json
{
  "ok": true,
  "id": "user_id"
}
```

#### POST /auth/login
**Description**: تسجيل الدخول

**Request Body**:
```json
{
  "email": "owner@example.com",
  "password": "SecurePassword123"
}
```

**Response**:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "Owner Name",
    "email": "owner@example.com",
    "role": "owner"
  }
}
```

#### GET /auth/me
**Description**: الحصول على معلومات المستخدم الحالي

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "name": "Owner Name",
    "email": "owner@example.com",
    "role": "owner"
  }
}
```

### 🛍️ Products Routes

#### GET /products
**Description**: قائمة المنتجات مع فلترة

**Query Parameters**:
- `q`: نص البحث
- `category`: فئة المنتج
- `tag`: وسم المنتج
- `min`: أقل سعر
- `max`: أعلى سعر
- `sort`: ترتيب (createdAt:desc, price:asc, etc.)
- `limit`: عدد النتائج (افتراضي: 50)
- `offset`: إزاحة (افتراضي: 0)

**Response**:
```json
{
  "total": 100,
  "items": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "slug": "product-slug",
      "price": 4500,
      "oldPrice": 6000,
      "category": "ملابس",
      "tags": ["جديد"],
      "desc": "Product description",
      "image": "https://rahlacdn.b-cdn.net/...",
      "rating": 4.6,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /products/:slugOrId
**Description**: منتج واحد بالـ slug أو ID

**Response**:
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "slug": "product-slug",
  "price": 4500,
  "oldPrice": 6000,
  "category": "ملابس",
  "tags": ["جديد"],
  "desc": "Product description",
  "image": "https://rahlacdn.b-cdn.net/...",
  "rating": 4.6
}
```

#### POST /products
**Description**: إنشاء منتج جديد

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin, editor

**Request Body**:
```json
{
  "name": "Product Name",
  "price": 4500,
  "oldPrice": 6000,
  "category": "ملابس",
  "tags": ["جديد"],
  "desc": "Product description",
  "image": "https://rahlacdn.b-cdn.net/..."
}
```

**Response**:
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "slug": "product-slug",
  "price": 4500,
  "oldPrice": 6000,
  "category": "ملابس",
  "tags": ["جديد"],
  "desc": "Product description",
  "image": "https://rahlacdn.b-cdn.net/...",
  "rating": 4,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /products/:id
**Description**: تحديث منتج

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin, editor

**Request Body**:
```json
{
  "name": "Updated Product Name",
  "price": 5000
}
```

#### DELETE /products/:id
**Description**: حذف منتج

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin

**Response**:
```json
{
  "deleted": true
}
```

#### GET /products/export
**Description**: تصدير المنتجات

**Query Parameters**:
- `format`: json أو csv (افتراضي: json)

**Response** (JSON):
```json
[
  {
    "_id": "product_id",
    "name": "Product Name",
    "price": 4500,
    "category": "ملابس"
  }
]
```

**Response** (CSV):
```csv
_id,name,price,category
product_id,Product Name,4500,ملابس
```

#### POST /products/import
**Description**: استيراد المنتجات

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin, editor

**Request Body**:
```json
[
  {
    "name": "Product 1",
    "price": 4500,
    "category": "ملابس"
  },
  {
    "name": "Product 2",
    "price": 3500,
    "category": "اكسسوارات"
  }
]
```

**Response**:
```json
{
  "created": 2
}
```

### 📁 Categories Routes

#### GET /categories
**Description**: قائمة الفئات

**Response**:
```json
{
  "items": [
    {
      "_id": "category_id",
      "name": "ملابس",
      "slug": "ملابس",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /categories
**Description**: إنشاء فئة جديدة

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin

**Request Body**:
```json
{
  "name": "فئة جديدة"
}
```

#### PATCH /categories/:id
**Description**: تحديث فئة

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin

#### DELETE /categories/:id
**Description**: حذف فئة

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin

### 🖼️ Media Routes

#### POST /media/sign-upload
**Description**: الحصول على signed URL للرفع

**Headers**: `Authorization: Bearer <token>`
**Roles**: owner, admin, editor

**Request Body**:
```json
{
  "key": "rahlamedia/products/filename.jpg",
  "contentType": "image/jpeg"
}
```

**Response**:
```json
{
  "url": "https://sg.storage.bunnycdn.com/rahlamedia/products/filename.jpg",
  "method": "PUT",
  "headers": {
    "Content-Type": "image/jpeg",
    "AccessKey": "storage_key"
  },
  "publicUrl": "https://rahlacdn.b-cdn.net/rahlamedia/products/filename.jpg"
}
```

## 🔒 Roles & Permissions

### Owner
- جميع الصلاحيات
- إدارة المستخدمين
- إعدادات النظام

### Admin
- إدارة المنتجات والفئات
- رفع الملفات
- تصدير/استيراد البيانات

### Editor
- إدارة المنتجات
- رفع الملفات
- لا يمكن حذف المنتجات

### Viewer
- قراءة فقط
- لا يمكن التعديل

## 📊 Response Codes

- `200` - نجح الطلب
- `201` - تم الإنشاء بنجاح
- `400` - بيانات غير صحيحة
- `401` - غير مصرح (token مفقود أو غير صحيح)
- `403` - ممنوع (لا توجد صلاحية)
- `404` - غير موجود
- `500` - خطأ في الخادم

## 🚀 Rate Limiting

- **120 requests/minute** لكل IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## 🔍 Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}
```

## 📝 Examples

### إنشاء منتج جديد
```bash
curl -X POST https://web-test-d179.onrender.com/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "تيشيرت جديد",
    "price": 4500,
    "category": "ملابس",
    "tags": ["جديد"],
    "desc": "تيشيرت قطني 100%"
  }'
```

### البحث في المنتجات
```bash
curl "https://web-test-d179.onrender.com/products?q=تيشيرت&category=ملابس&min=1000&max=5000"
```

### رفع صورة
```bash
# 1. الحصول على signed URL
curl -X POST https://web-test-d179.onrender.com/media/sign-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "rahlamedia/products/image.jpg",
    "contentType": "image/jpeg"
  }'

# 2. رفع الصورة
curl -X PUT "SIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  -H "AccessKey: STORAGE_KEY" \
  --data-binary @image.jpg
```
