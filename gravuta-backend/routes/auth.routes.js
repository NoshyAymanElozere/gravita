const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validations/auth.validation');

// مسار تسجيل حساب جديد لمستخدم عادي - POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. التحقق من عدم تكرار البريد الإلكتروني
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: 'fail',
                message: 'البريد الإلكتروني مستخدم بالفعل! يرجى استخدام بريد آخر'
            });
        }

        // 2. تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. إنشاء مستخدم جديد (بشكل افتراضي يكون دوره 'user')
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user' // إجبار الحساب على أن يكون 'user' فقط
        });

        // 4. حفظ المستخدم في قاعدة البيانات
        const savedUser = await newUser.save();

        // 5. إنشاء رمز الأمان (JWT Token) لتسجيل الدخول مباشرة
        const token = jwt.sign(
            { id: savedUser._id, role: savedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            status: 'success',
            message: '🎉 تم تسجيل حسابك بنجاح!',
            token,
            data: {
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// مسار تسجيل الدخول - POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. البحث عن المستخدم بالبريد الإلكتروني
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق مما إذا كان الحساب نشطاً
        if (!user.isActive) {
            return res.status(403).json({
                status: 'fail',
                message: 'تم تعطيل هذا الحساب، يرجى التواصل مع المسؤول!'
            });
        }

        // 2. التحقق من صحة كلمة المرور
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // 3. إنشاء رمز الأمان (JWT Token)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // 4. إرجاع النتيجة والرمز
        res.status(200).json({
            status: 'success',
            message: '👋 تم تسجيل الدخول بنجاح!',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
