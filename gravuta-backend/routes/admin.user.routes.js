const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const validate = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ إنشاء مستخدم أو أدمن جديد بواسطة الأدمن - POST /api/admin/users
router.post('/', validate(createUserSchema), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. التحقق من عدم تكرار البريد الإلكتروني
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: 'fail',
                message: 'البريد الإلكتروني مستخدم بالفعل لمستند آخر!'
            });
        }

        // 2. تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. إنشاء المستخدم الجديد بالصلاحية المحددة (سواء user أو admin)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        // 4. حفظ المستخدم في قاعدة البيانات
        const savedUser = await newUser.save();

        res.status(201).json({
            status: 'success',
            message: '👤 تم إنشاء الحساب بنجاح بواسطة المسؤول!',
            data: {
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role,
                    isActive: savedUser.isActive,
                    createdAt: savedUser.createdAt
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

// 2️⃣ جلب قائمة بجميع المستخدمين - GET /api/admin/users
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(User, {}, req.query, '', '-password');
        res.status(200).json({
            status: 'success',
            count: results.length,
            pagination,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 3️⃣ تعديل بيانات مستخدم (بما في ذلك التفعيل/التعطيل، تغيير الباسورد، والصلاحيات) - PUT /api/admin/users/:id
router.put('/:id', validate(updateUserSchema), async (req, res) => {
    try {
        // 1. تشفير كلمة المرور الجديدة إذا تم إرسالها
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        // 2. التحقق من عدم تكرار البريد الإلكتروني إذا تم تغييره
        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'هذا البريد الإلكتروني مستخدم بالفعل لدى حساب آخر!'
                });
            }
        }

        // 3. تحديث البيانات في قاعدة البيانات
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود لتعديله'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '✨ تم تحديث بيانات المستخدم بنجاح!',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المستخدم غير صحيح (Invalid User ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 4️⃣ حذف مستخدم نهائياً من قاعدة البيانات - DELETE /api/admin/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود لحذفه'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف المستخدم بنجاح من قاعدة البيانات!'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المستخدم غير صحيح (Invalid User ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
