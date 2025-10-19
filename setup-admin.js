#!/usr/bin/env node

/**
 * سكريبت إنشاء حساب الأدمن - Rahla Store
 * على بركة الله
 */

import { connect, disconnect } from "./rahla-api/src/db.js";
import User from "./rahla-api/src/models/User.js";
import bcrypt from "bcryptjs";

// إعدادات الأدمن
const adminData = {
  name: "Owner",
  email: "admin@rahla.com",
  password: "ChangeMe123",
  role: "owner"
};

async function createAdmin() {
  try {
    console.log("🎯 إنشاء حساب الأدمن - على بركة الله");
    console.log("=====================================\n");

    // الاتصال بقاعدة البيانات
    console.log("🔗 الاتصال بقاعدة البيانات...");
    await connect("mongodb+srv://bthwani2_db_user:ZTvLB2wQcB7FpfjB@rahla-cluster.qvnzltw.mongodb.net/rahla?retryWrites=true&w=majority");
    console.log("✅ تم الاتصال بنجاح\n");

    // فحص وجود الأدمن
    console.log("🔍 فحص وجود الأدمن...");
    const exists = await User.findOne({ email: adminData.email });
    
    if (exists) {
      console.log("⚠️ الأدمن موجود بالفعل:", adminData.email);
      console.log("👤 الدور:", exists.role);
      console.log("📅 تاريخ الإنشاء:", exists.createdAt);
      console.log("\n✅ يمكنك تسجيل الدخول الآن!");
      return;
    }

    // تشفير كلمة المرور
    console.log("🔐 تشفير كلمة المرور...");
    const passwordHash = await bcrypt.hash(adminData.password, 12);

    // إنشاء حساب الأدمن
    console.log("👤 إنشاء حساب الأدمن...");
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      passwordHash,
      role: adminData.role
    });

    // عرض النتيجة
    console.log("\n✅ تم إنشاء حساب الأدمن بنجاح - الحمد لله!");
    console.log("=====================================");
    console.log("📧 البريد الإلكتروني:", admin.email);
    console.log("👤 الاسم:", admin.name);
    console.log("🔑 الدور:", admin.role);
    console.log("🆔 المعرف:", admin._id);
    console.log("📅 تاريخ الإنشاء:", admin.createdAt);

    console.log("\n🚀 يمكنك الآن تسجيل الدخول باستخدام:");
    console.log("=====================================");
    console.log(`📧 البريد: ${admin.email}`);
    console.log(`🔑 كلمة المرور: ${adminData.password}`);
    console.log(`🌐 رابط تسجيل الدخول: https://bthwani1.github.io/web-test`);

    console.log("\n💡 نصائح أمنية:");
    console.log("- احفظ بيانات الدخول في مكان آمن");
    console.log("- غير كلمة المرور بعد أول تسجيل دخول");
    console.log("- لا تشارك بيانات الدخول مع أحد");

    console.log("\n🎉 بارك الله فيك - حساب الأدمن جاهز!");

  } catch (error) {
    console.error("❌ خطأ في إنشاء حساب الأدمن:", error.message);
    console.log("🔧 تأكد من اتصال الإنترنت وقاعدة البيانات");
  } finally {
    console.log("\n🔌 قطع الاتصال بقاعدة البيانات...");
    await disconnect();
    console.log("✅ تم الانتهاء - الله يبارك!");
  }
}

// تشغيل السكريبت
createAdmin();
