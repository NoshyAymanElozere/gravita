const express = require('express');
const path = require('path');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// تفعيل CORS للسماح بالطلبات من الواجهات المحددة في CORS_ORIGINS (مفصولة بفاصلة)
// إذا لم يتم تحديدها يُسمح لكل النطاقات (مناسب للتطوير فقط)
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));

// Middleware لتمرير بيانات JSON من الـ Requests
app.use(express.json({ limit: '1mb' }));

// تقديم مجلد uploads كـ Static Folder لعرض الصور المرفوعة عبر رابط السيرفر
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// تقديم الملفات الثابتة للواجهة الأمامية
app.use(express.static(path.join(__dirname, 'public')));

// ربط مسارات المستخدمين والمسارات العامة (User / Public Endpoints)
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/bundles', require('./routes/bundle.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/newsletter', require('./routes/newsletter.routes'));
app.use('/api/banners', require('./routes/banner.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// ربط مسارات الإدارة (Admin Endpoints)
app.use('/api/admin/products', require('./routes/admin.product.routes'));
app.use('/api/admin/categories', require('./routes/admin.category.routes'));
app.use('/api/admin/bundles', require('./routes/admin.bundle.routes'));
app.use('/api/admin/users', require('./routes/admin.user.routes'));
app.use('/api/admin/orders', require('./routes/admin.order.routes'));
app.use('/api/admin/coupons', require('./routes/admin.coupon.routes'));
app.use('/api/admin/stats', require('./routes/admin.stats.routes'));
app.use('/api/admin/banners', require('./routes/admin.banner.routes'));
// التقييمات والنشرة البريدية: /api/admin/reviews و /api/admin/newsletter
app.use('/api/admin', require('./routes/admin.review.routes'));

// فحص حالة السيرفر - GET /api/health
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', uptime: process.uptime() });
});

// المسار الرئيسي للسيرفر (Root Route)
app.get('/', (req, res) => {
    res.send('مرحباً بك في سيرفر Node.js المتصل بـ MongoDB Atlas! 🚀');
});

// أي مسار API غير معروف + معالجة الأخطاء المركزية
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
