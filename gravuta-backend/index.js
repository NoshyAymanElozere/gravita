require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET غير موجود في ملف الـ .env');
    process.exit(1);
}

// الاتصال بقاعدة بيانات MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ تم الاتصال بنجاح بقاعدة بيانات MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('❌ حدث خطأ أثناء الاتصال بقاعدة البيانات:', err.message);
    });

// تشغيل السيرفر والاستماع للمنفذ (Port)
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 السيرفر يعمل الآن على: http://localhost:${PORT}`);
    console.log(`=============================================`);
});
