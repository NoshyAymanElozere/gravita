const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const validate = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validations/user.validation');
const { protect } = require('../middlewares/auth.middleware');

// حماية جميع المسارات التالية (Apply protection for authenticated users)
router.use(protect);

// 1️⃣ جلب بيانات الملف الشخصي للمستخدم الحالي - GET /api/users/profile
router.get('/profile', async (req, res) => {
    try {
        // يتم جلب بيانات المستخدم الذي قام بتسجيل الدخول والمخزن في req.user بواسطة protect middleware
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ تعديل بيانات الملف الشخصي للمستخدم الحالي - PUT /api/users/profile
router.put('/profile', validate(updateProfileSchema), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (name) updateData.name = name;

        // التحقق من عدم تكرار البريد الإلكتروني مع مستخدمين آخرين
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'هذا البريد الإلكتروني مستخدم بالفعل لدى حساب آخر!'
                });
            }
            updateData.email = email;
        }

        // تشفير كلمة المرور الجديدة إذا تم إرسالها
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // تحديث البيانات في قاعدة البيانات
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: '✨ تم تحديث ملفك الشخصي بنجاح!',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 3️⃣ حذف حساب المستخدم الحالي نهائياً - DELETE /api/users/profile
router.delete('/profile', async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف حسابك الشخصي بنجاح من قاعدة البيانات!'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
