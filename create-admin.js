#!/usr/bin/env node

/**
 * سكريبت إنشاء حساب الأدمن - Rahla Store
 * استخدام: node create-admin.js
 */

import dotenv from "dotenv";
import { connect, disconnect } from "./rahla-api/src/db.js";
import User from "./rahla-api/src/models/User.js";
import bcrypt from "bcryptjs";
import readline from "readline";

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء واجهة القراءة
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// دالة لسؤال المستخدم
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// دالة للتحقق من صحة البريد الإلكتروني
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// دالة للتحقق من قوة كلمة المرور
const isStrongPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

async function createAdmin() {
  try {
    console.log("🎯 مرحباً بك في سكريبت إنشاء حساب الأدمن");
    console.log("=====================================\n");

    // التحقق من اتصال قاعدة البيانات
    console.log("🔗 الاتصال بقاعدة البيانات...");
    await connect(process.env.MONGODB_URI);
    console.log("✅ تم الاتصال بنجاح\n");

    // جمع بيانات الأدمن
    console.log("📝 أدخل بيانات الأدمن:");
    
    const name = await question("👤 الاسم: ");
    if (!name.trim()) {
      console.log("❌ الاسم مطلوب");
      process.exit(1);
    }

    const email = await question("📧 البريد الإلكتروني: ");
    if (!isValidEmail(email)) {
      console.log("❌ البريد الإلكتروني غير صحيح");
      process.exit(1);
    }

    // التحقق من وجود البريد
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ هذا البريد الإلكتروني مستخدم بالفعل");
      console.log("👤 المستخدم الموجود:", existingUser.name);
      console.log("🔑 الدور:", existingUser.role);
      process.exit(1);
    }

    const password = await question("🔑 كلمة المرور: ");
    if (!isStrongPassword(password)) {
      console.log("❌ كلمة المرور ضعيفة. يجب أن تحتوي على:");
      console.log("   - 8 أحرف على الأقل");
      console.log("   - حرف كبير");
      console.log("   - حرف صغير");
      console.log("   - رقم");
      process.exit(1);
    }

    const role = await question("🔑 الدور (owner/admin/editor/viewer) [owner]: ") || "owner";
    const validRoles = ["owner", "admin", "editor", "viewer"];
    if (!validRoles.includes(role)) {
      console.log("❌ دور غير صحيح. الأدوار المتاحة:", validRoles.join(", "));
      process.exit(1);
    }

    // إنشاء حساب الأدمن
    console.log("\n🔐 تشفير كلمة المرور...");
    const passwordHash = await bcrypt.hash(password, 12);

    console.log("👤 إنشاء حساب الأدمن...");
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role
    });

    // عرض النتيجة
    console.log("\n✅ تم إنشاء حساب الأدمن بنجاح!");
    console.log("=====================================");
    console.log("📧 البريد الإلكتروني:", admin.email);
    console.log("👤 الاسم:", admin.name);
    console.log("🔑 الدور:", admin.role);
    console.log("🆔 المعرف:", admin._id);
    console.log("📅 تاريخ الإنشاء:", admin.createdAt);

    console.log("\n🚀 يمكنك الآن تسجيل الدخول باستخدام:");
    console.log("=====================================");
    console.log(`📧 البريد: ${admin.email}`);
    console.log(`🔑 كلمة المرور: ${password}`);
    console.log(`🌐 رابط تسجيل الدخول: https://bthwani1.github.io/web-test`);

    console.log("\n💡 نصائح أمنية:");
    console.log("- احفظ بيانات الدخول في مكان آمن");
    console.log("- غير كلمة المرور بانتظام");
    console.log("- لا تشارك بيانات الدخول مع أحد");

  } catch (error) {
    console.error("❌ خطأ في إنشاء حساب الأدمن:", error.message);
    process.exit(1);
  } finally {
    console.log("\n🔌 قطع الاتصال بقاعدة البيانات...");
    await disconnect();
    rl.close();
    process.exit(0);
  }
}

// تشغيل السكريبت
createAdmin();
