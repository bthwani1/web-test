import dotenv from "dotenv"; 
dotenv.config();
import { connect, disconnect } from "./src/db.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

// إعدادات الأدمن من متغيرات البيئة
const { 
  ADMIN_NAME = "Owner", 
  ADMIN_EMAIL, 
  ADMIN_PASSWORD,
  ADMIN_ROLE = "owner"
} = process.env;

// التحقق من وجود البيانات المطلوبة
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ خطأ: يجب تعيين ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env");
  console.log("📝 مثال:");
  console.log("ADMIN_NAME=Owner");
  console.log("ADMIN_EMAIL=admin@example.com");
  console.log("ADMIN_PASSWORD=SecurePassword123");
  console.log("ADMIN_ROLE=owner");
  process.exit(1);
}

// التحقق من صحة كلمة المرور
if (ADMIN_PASSWORD.length < 8) {
  console.error("❌ خطأ: كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  process.exit(1);
}

// التحقق من صحة البريد الإلكتروني
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(ADMIN_EMAIL)) {
  console.error("❌ خطأ: البريد الإلكتروني غير صحيح");
  process.exit(1);
}

async function createAdmin() {
  try {
    console.log("🔗 الاتصال بقاعدة البيانات...");
    await connect(process.env.MONGODB_URI);
    
    console.log("🔍 فحص وجود الأدمن...");
    const exists = await User.findOne({ email: ADMIN_EMAIL });
    
    if (exists) {
      console.log("⚠️ الأدمن موجود بالفعل:", ADMIN_EMAIL);
      console.log("👤 الدور:", exists.role);
      console.log("📅 تاريخ الإنشاء:", exists.createdAt);
      process.exit(0);
    }
    
    console.log("🔐 تشفير كلمة المرور...");
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    console.log("👤 إنشاء حساب الأدمن...");
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: ADMIN_ROLE
    });
    
    console.log("✅ تم إنشاء حساب الأدمن بنجاح!");
    console.log("📧 البريد الإلكتروني:", admin.email);
    console.log("👤 الاسم:", admin.name);
    console.log("🔑 الدور:", admin.role);
    console.log("🆔 المعرف:", admin._id);
    console.log("📅 تاريخ الإنشاء:", admin.createdAt);
    
    console.log("\n🚀 يمكنك الآن تسجيل الدخول باستخدام:");
    console.log(`📧 البريد: ${ADMIN_EMAIL}`);
    console.log(`🔑 كلمة المرور: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error("❌ خطأ في إنشاء حساب الأدمن:", error.message);
    process.exit(1);
  } finally {
    console.log("🔌 قطع الاتصال بقاعدة البيانات...");
    await disconnect();
    process.exit(0);
  }
}

// تشغيل الدالة
createAdmin();
