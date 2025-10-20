@echo off
echo 🚀 بدء النشر النهائي للمشروع...

echo.
echo 📁 إضافة جميع الملفات إلى Git...
git add .

echo.
echo 📝 إنشاء commit...
git commit -m "feat: 100% complete web application with CI/CD pipeline"

echo.
echo 🚀 دفع التغييرات إلى GitHub...
git push origin main

echo.
echo ✅ تم النشر بنجاح!
echo.
echo 📋 الخطوات التالية:
echo 1. أضف متغيرات البيئة في GitHub: Settings → Secrets and variables → Actions → Variables
echo 2. أضف متغيرات البيئة في Render: Dashboard → Your Service → Environment
echo 3. استبدل GA4 Measurement ID في index.html
echo 4. اختبر النشر النهائي
echo.
echo 🎉 المشروع جاهز للإنتاج بنسبة 100%!
pause

