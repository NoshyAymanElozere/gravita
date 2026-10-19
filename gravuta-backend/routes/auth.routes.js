const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const validate = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validations/auth.validation');
const { protect, signToken } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// بيانات المستخدم التي تُرجع للواجهة (بدون كلمة المرور)
const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
});

// مسار تسجيل حساب جديد لمستخدم عادي - POST /api/auth/register
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // 1. التحقق من عدم تكرار البريد الإلكتروني
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError('البريد الإلكتروني مستخدم بالفعل! يرجى استخدام بريد آخر', 400);
    }

    // 2. تشفير كلمة المرور وإنشاء المستخدم (بشكل إجباري يكون دوره 'user')
    const hashedPassword = await bcrypt.hash(password, 10);
    const savedUser = await User.create({
        name,
        email,
        phone: phone || '',
        password: hashedPassword,
        role: 'user'
    });

    // 3. إنشاء رمز الأمان (JWT Token) لتسجيل الدخول مباشرة
    res.status(201).json({
        status: 'success',
        message: '🎉 تم تسجيل حسابك بنجاح!',
        token: signToken(savedUser),
        data: {
            user: publicUser(savedUser)
        }
    });
}));

// مسار تسجيل الدخول - POST /api/auth/login
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. البحث عن المستخدم بالبريد الإلكتروني (مع كلمة المرور المخفية افتراضياً)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    // 2. التحقق مما إذا كان الحساب نشطاً
    if (!user.isActive) {
        throw new AppError('تم تعطيل هذا الحساب، يرجى التواصل مع المسؤول!', 403);
    }

    res.status(200).json({
        status: 'success',
        message: '👋 تم تسجيل الدخول بنجاح!',
        token: signToken(user),
        data: {
            user: publicUser(user)
        }
    });
}));

// جلب المستخدم الحالي من الـ Token (لاستعادة الجلسة عند فتح الموقع) - GET /api/auth/me
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: publicUser(req.user)
        }
    });
});

module.exports = router;
