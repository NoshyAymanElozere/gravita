const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getBearerToken = (req) => {
    const header = req.headers.authorization;
    return header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
};

// يتحقق من الـ Token ويرجع المستخدم أو رسالة الخطأ المناسبة
const resolveUser = async (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return { error: 'رمز الأمان غير صالح أو منتهي الصلاحية' };
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return { error: 'المستخدم المرتبط بهذا الرمز لم يعد موجوداً' };
    }
    if (!user.isActive) {
        return { error: 'تم تعطيل هذا الحساب، يرجى التواصل مع المسؤول!' };
    }
    // رفض الرموز الصادرة قبل آخر تغيير لكلمة المرور
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
        return { error: 'تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مرة أخرى' };
    }
    return { user };
};

// وسيط حماية المسارات (Protect Middleware) - التحقق من تسجيل الدخول
const protect = async (req, res, next) => {
    try {
        // 1. التحقق من وجود الـ Token في الـ Headers
        const token = getBearerToken(req);
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول أولاً'
            });
        }

        // 2. التحقق من صحة الـ Token وحالة المستخدم
        const { user, error } = await resolveUser(token);
        if (error) {
            return res.status(401).json({ status: 'fail', message: error });
        }

        // 3. حفظ بيانات المستخدم في الـ Request لاستخدامها لاحقاً
        req.user = user;
        next();
    } catch (error) {
        next(error);
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

// إنشاء رمز الأمان (JWT Token)
const signToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

module.exports = {
    protect,
    restrictTo,
    signToken
};
