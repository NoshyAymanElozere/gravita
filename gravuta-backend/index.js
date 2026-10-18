require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer'); // استيراد مولتر لمعالجة الأخطاء العامة
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// تفعيل CORS للسماح بالطلبات عبر النطاقات المختلفة
app.use(cors());

// Middleware لتمرير بيانات JSON من الـ Requests
app.use(express.json());

// تقديم مجلد uploads كـ Static Folder لعرض الصور المرفوعة عبر رابط السيرفر
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// تقديم الملفات الثابتة للواجهة الأمامية
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة بيانات MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ تم الاتصال بنجاح بقاعدة بيانات MongoDB Atlas!');
    })
    .catch((err) => {
        console.error('❌ حدث خطأ أثناء الاتصال بقاعدة البيانات:', err.message);
    });

// استيراد مسارات المنتجات والفئات والتحقق للمستخدمين (User / Public Routes)
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const bundleRoutes = require('./routes/bundle.routes');

// استيراد مسارات الإدارة للأدمن (Admin Routes)
const productAdminRoutes = require('./routes/admin.product.routes');
const categoryAdminRoutes = require('./routes/admin.category.routes');
const userAdminRoutes = require('./routes/admin.user.routes');
const orderAdminRoutes = require('./routes/admin.order.routes');
const bundleAdminRoutes = require('./routes/admin.bundle.routes');

// ربط مسارات المستخدمين والمسارات العامة (User / Public Endpoints)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bundles', bundleRoutes);

// ربط مسارات الإدارة (Admin Endpoints)
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/admin/categories', categoryAdminRoutes);
app.use('/api/admin/users', userAdminRoutes);
app.use('/api/admin/orders', orderAdminRoutes);
app.use('/api/admin/bundles', bundleAdminRoutes);

// المسار الرئيسي للسيرفر (Root Route)
app.get('/', (req, res) => {
    res.send('مرحباً بك في سيرفر Node.js المتصل بـ MongoDB Atlas! 🚀');
});

// وسيط معالجة الأخطاء العامة (بما فيها أخطاء رفع الملفات في Multer)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 'fail',
            message: `خطأ في رفع الملف: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
    next();
});

// تشغيل السيرفر والاستماع للمنفذ (Port)
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 السيرفر يعمل الآن على: http://localhost:${PORT}`);
    console.log(`=============================================`);
});
