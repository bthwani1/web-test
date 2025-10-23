# تقرير فحص وترابط — متجر رحلة (STORE-RAHLA)

التاريخ: 2025-10-23 16:05 UTC  
المصدر: web-test-main (6).zip

## خلاصة التقدم

- هيكلة مشروع واضحة: **backend/** و**admin/** و**gates/** و**observability/** و**.github/workflows/**.

- وثائق عملية كثيرة ضمن الجذر تعكس عمل تدقيقي متقدم (FE_ROUTES_ANALYSIS.md, API_DOCUMENTATION.md, FINAL_CHECKLIST.md...).

- الباك إند يعتمد Express + Mongoose + RBAC + Helmet + RateLimit + Sentry.

- اللوحة الإدارية **admin/** تعمل كواجهة HTML/JS خفيفة وتستدعي API موحّد.

## عيوب حرجة تمنع الإطلاق

1) **خطأ نحوي يمنع تشغيل الخادم**: استيراد Sentry غير صحيح.
   - الدليل: backend/server.js:7 — `const * as Sentry from '@sentry/node';`
   - التصحيح: `const Sentry = require('@sentry/node');` أو `import * as Sentry from '@sentry/node';` مع ESM.

2) **مسار خاطئ لوحدة رؤوس الأمان**:
   - الدليل: backend/server.js:8 — `const { applySecurityHeaders } = require('../security-headers');` يشير إلى `../security-headers`
   - الواقع: الملف موجود في جذر المشروع: `web-test-main/security-headers.js`
   - التصحيح المقترح داخل backend: `require('./security-headers')` مع نقل الملف أو نسخه إلى backend/.

3) **عدم تطابق بادئة المسارات بين الواجهة والباك**:

   - الواجهة تستدعي أمثلة مثل `/auth/login`, `/products`.
   - الأدلة: admin/admin.js:119 — `const response = await this.apiRequest('/auth/login', {`، و190 — سطر يستدعي `/products`.

   - الباك يعرّف المسارات تحت `/api/...`.

   - الدليل: backend/server.js — يحتوي على `app.use('/api/auth'|'/api/products'...)`.

   - الحل: إمّا إضافة البادئة `/api` على كل استدعاء في الواجهة أو ضبط `this.apiBase` ليشمل `/api`.

4) **متغيرات بيئة إلزامية بلا تحقق تشغيل**: لا يوجد تحقق صارم عند غياب مفاتيح مثل JWT/SENTRY/DB.
   - الحل: فحص عند الإقلاع مع إنهاء فوري إذا غاب أي مفتاح مطلوب.

## خارطة المسارات ومقارنة الاستدعاءات

### باك إند — نقاط نهاية المكتشفة

- `GET /health` (من server.js)
- `POST /register` (من routes/auth.js)
- `POST /login` (من routes/auth.js)
- `POST /refresh` (من routes/auth.js)
- `POST /logout` (من routes/auth.js)
- `GET /me` (من routes/auth.js)
- `POST /forgot-password` (من routes/auth.js)
- `POST /reset-password` (من routes/auth.js)
- `GET /` (من routes/products.js)
- `GET /:id` (من routes/products.js)
- `POST /` (من routes/products.js)
- `PUT /:id` (من routes/products.js)
- `DELETE /:id` (من routes/products.js)
- `POST /:id/images` (من routes/products.js)
- `DELETE /:id/images/:imageId` (من routes/products.js)

### الواجهة — الاستدعاءات المكتشفة

- `/auth/login`
- `/auth/me`
- `/categories`
- `/categories/${id}`
- `/categories/${this.currentCategory._id}`
- `/media/upload-url`
- `/products`
- `/products/${id}`
- `/products/${this.currentProduct._id}`
- `/products/export?format=csv`
- `/products/import`
- `/products?category=${categoryId}`
- `/products?limit=100`

## مخاطر أمنية/تشغيلية

- احتمال تسرب تهيئة عبر `.env.example` إن تم نقلها كما هي إلى بيئة تشغيل.

- غياب حماية CORS مفصلة حسب النطاق، يجب ضبط allowlist.

- غياب اختبارات تكامل تغطي RBAC والمسارات الحرجة.


## CI/CD

- يوجد Workflows أساسية لكن الخطوات غير مكتملة.

  - مثال: .github/workflows/ci.yml لا يشغل أدوات فحص أسرار أو Parity فعليًا.

  - إضافة: gitleaks, trufflehog, lint, unit/e2e, بناء artifacts، وفحوص Gates.


## قائمة إجراءات فورية (AP)

- AP-1: إصلاح استيراد Sentry في backend/server.js.
- AP-2: إصلاح مسار security-headers ونقله/استيراده بشكل صحيح.
- AP-3: توحيد البادئة `/api` بين الواجهة والباك أو تعديل apiBase في admin.js ليكون `https://host/api`.
- AP-4: إضافة فحص صارم للـ ENV عند الإقلاع مع إنهاء العملية عند النقص.
- AP-5: استكمال تعريف الفئات والأذونات في middleware/rbac.js والتأكد من استخدامها على المسارات.
- AP-6: إضافة اختبارات Jest/Supertest لتغطية auth/products/categories بحد أدنى 80%.
- AP-7: تفعيل CORS allowlist لنطاقات rahla.example فقط حسب السياسات.
- AP-8: استكمال Workflows لتشمل lint+test+build+security scans+parity+route-unique.
- AP-9: إضافة /healthz و/readyz مع فحوصات DB/Redis.
- AP-10: توليد وثيقة OpenAPI من المسارات وتثبيتها كـ مصدر حقيقة واحد.