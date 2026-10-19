const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const validate = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../utils/helpers');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ إنشاء مستخدم أو أدمن جديد بواسطة الأدمن - POST /api/admin/users
router.post('/', validate(createUserSchema), asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    // التحقق من عدم تكرار البريد الإلكتروني
    if (await User.exists({ email: email.toLowerCase() })) {
        throw new AppError('البريد الإلكتروني مستخدم بالفعل لمستند آخر!', 400);
    }

    const savedUser = await User.create({
        name,
        email,
        phone: phone || '',
        password: await bcrypt.hash(password, 10),
        role: role || 'user'
    });

    res.status(201).json({
        status: 'success',
        message: '👤 تم إنشاء الحساب بنجاح بواسطة المسؤول!',
        data: {
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role,
                isActive: savedUser.isActive,
                createdAt: savedUser.createdAt
            }
        }
    });
}));

// 2️⃣ جلب قائمة بجميع المستخدمين - GET /api/admin/users?q=ahmed&role=user&isActive=true
router.get('/', asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.q) {
        const regex = { $regex: escapeRegex(req.query.q), $options: 'i' };
        filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const { results, pagination } = await paginate(User, filter, req.query, '', '-addresses -wishlist', { createdAt: -1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 3️⃣ جلب مستخدم مع ملخص طلباته - GET /api/admin/users/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError('المستخدم غير موجود', 404);
    }

    const [stats] = await Order.aggregate([
        { $match: { user: user._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, ordersCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            user,
            stats: { ordersCount: stats?.ordersCount || 0, totalSpent: stats?.totalSpent || 0 }
        }
    });
}));

// 4️⃣ تعديل بيانات مستخدم (بما في ذلك التفعيل/التعطيل، تغيير الباسورد، والصلاحيات) - PUT /api/admin/users/:id
router.put('/:id', validate(updateUserSchema), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError('المستخدم غير موجود لتعديله', 404);
    }

    // منع الأدمن من سحب صلاحياته أو تعطيل حسابه بنفسه
    if (String(user._id) === String(req.user._id) && (req.body.role === 'user' || req.body.isActive === false)) {
        throw new AppError('لا يمكنك تعطيل حسابك أو إزالة صلاحية الأدمن عن نفسك', 400);
    }

    // التحقق من عدم تكرار البريد الإلكتروني إذا تم تغييره
    if (req.body.email) {
        const existingUser = await User.exists({ email: req.body.email.toLowerCase(), _id: { $ne: user._id } });
        if (existingUser) {
            throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل لدى حساب آخر!', 400);
        }
    }

    // تشفير كلمة المرور الجديدة إذا تم إرسالها
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.passwordChangedAt = new Date();
    }

    user.set(req.body);
    await user.save();
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        message: '✨ تم تحديث بيانات المستخدم بنجاح!',
        data: {
            user
        }
    });
}));

// 5️⃣ حذف مستخدم - DELETE /api/admin/users/:id
// المستخدم الذي لديه طلبات يتم تعطيله فقط للحفاظ على سجل الطلبات
router.delete('/:id', asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) {
        throw new AppError('لا يمكنك حذف حسابك الخاص', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError('المستخدم غير موجود لحذفه', 404);
    }

    await Cart.deleteOne({ user: user._id });

    if (await Order.exists({ user: user._id })) {
        user.isActive = false;
        await user.save();
        return res.status(200).json({
            status: 'success',
            message: '🔒 المستخدم لديه طلبات سابقة لذلك تم تعطيل الحساب بدلاً من حذفه'
        });
    }

    await user.deleteOne();
    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف المستخدم بنجاح من قاعدة البيانات!'
    });
}));

module.exports = router;
