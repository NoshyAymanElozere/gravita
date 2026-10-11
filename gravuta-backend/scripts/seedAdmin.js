require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('لم يتم العثور على MONGO_URI في ملف الـ .env!');
        }

        // 1. الاتصال بقاعدة بيانات MongoDB Atlas
        console.log('⏳ جاري الاتصال بقاعدة البيانات...');
        await mongoose.connect(mongoUri);
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

        // 2. التحقق مما إذا كان هناك أدمن موجود بالفعل
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️ الأدمن موجود بالفعل في قاعدة البيانات باسم البريد الإلكتروني:', existingAdmin.email);
            process.exit(0); // الخروج من السكريبت بنجاح دون فعل شيء
        }

        // 3. تحديد البريد والباسورد الافتراضيين للأدمن
        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'Admin'; // الباسورد الافتراضي للأدمن

        // 4. تشفير كلمة المرور بشكل آمن
        console.log('🔐 جاري تشفير كلمة المرور...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // 5. إنشاء حساب الأدمن
        const adminUser = new User({
            name: 'الأدمن الرئيسي',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin' // تحديد الصلاحية كأدمن
        });

        // 6. الحفظ في قاعدة البيانات
        await adminUser.save();
        
        console.log('\n=============================================');
        console.log('🎉 تم إنشاء حساب الأدمن بنجاح!');
        console.log(`📧 البريد الإلكتروني: ${adminEmail}`);
        console.log(`🔑 كلمة المرور الافتراضية: ${adminPassword}`);
        console.log('=============================================\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء تشغيل السكريبت:', error.message);
        process.exit(1);
    }
};

// تشغيل السكريبت
seedAdmin();
