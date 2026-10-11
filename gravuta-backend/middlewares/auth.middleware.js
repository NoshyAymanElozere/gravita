const jwt = require('jsonwebtoken');
const User = require('../models/User');

// وسيط حماية المسارات (Protect Middleware) - التحقق من تسجيل الدخول
const protect = async (req, res, next) => {
    try {
        let token;

        // 1. التحقق من وجود الـ Token في الـ Headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول أولاً'
            });
        }

        // 2. التحقق من صحة الـ Token وفك تشفيره
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. التحقق مما إذا كان المستخدم صاحب الـ Token ما زال موجوداً في قاعدة البيانات
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'المستخدم المرتبط بهذا الرمز لم يعد موجوداً'
            });
        }

        // 4. حفظ بيانات المستخدم في الـ Request لاستخدامها لاحقاً
        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'fail',
            message: 'رمز الأمان غير صالح أو منتهي الصلاحية'
        });
    }
};

// وسيط تحديد الصلاحيات (Authorization Middleware) - السماح لأدوار محددة فقط
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // التحقق من صلاحية المستخدم الحالي (req.user تم إعداده في protect middleware)
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'عذراً، ليس لديك الصلاحية الكافية للقيام بهذا الإجراء'
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
