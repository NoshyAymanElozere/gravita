const multer = require('multer');

// مسار غير موجود (404) لأي طلب API لا يطابق أي Route
const notFound = (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `المسار غير موجود (Route not found): ${req.method} ${req.originalUrl}`
    });
};

// وسيط معالجة الأخطاء المركزي - يحول أخطاء Mongoose و JWT و Multer لردود موحدة
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.statusCode < 500 ? 'fail' : 'error',
            message: err.message,
            ...(err.details && { errors: err.details })
        });
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: 'fail', message: `خطأ في رفع الملف: ${err.message}` });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ status: 'fail', message: `معرف غير صحيح (Invalid ${err.path}: ${err.value})` });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ status: 'fail', message: `القيمة مستخدمة بالفعل (Duplicate ${field})` });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'البيانات غير صالحة (Validation Error)',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'fail', message: 'صيغة JSON غير صحيحة في جسم الطلب' });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'fail', message: 'رمز الأمان غير صالح أو منتهي الصلاحية' });
    }

    console.error('💥 Unexpected error:', err);
    res.status(500).json({ status: 'error', message: 'حدث خطأ غير متوقع بالسيرفر' });
};

module.exports = { notFound, errorHandler };
