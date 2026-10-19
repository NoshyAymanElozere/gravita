const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const validate = require('../middlewares/validate.middleware');
const {
    updateProfileSchema,
    changePasswordSchema,
    createAddressSchema,
    updateAddressSchema
} = require('../validations/user.validation');
const { protect, signToken } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/helpers');

const MAX_ADDRESSES = 10;

// حماية جميع المسارات التالية (Apply protection for authenticated users)
router.use(protect);

// ملاحظة: كل مسار متاح بالشكلين /me و /profile (للتوافق مع الواجهات القديمة)

// ============ 👤 الملف الشخصي ============

// 1️⃣ جلب بيانات الملف الشخصي للمستخدم الحالي - GET /api/users/me
router.get(['/me', '/profile'], asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
}));

// 2️⃣ تعديل بيانات الملف الشخصي للمستخدم الحالي - PUT /api/users/me
router.put(['/me', '/profile'], validate(updateProfileSchema), asyncHandler(async (req, res) => {
    const { name, email, phone, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // التحقق من عدم تكرار البريد الإلكتروني مع مستخدمين آخرين
    if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
        if (existingUser) {
            throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل لدى حساب آخر!', 400);
        }
        user.email = email;
    }

    // تغيير كلمة المرور يتطلب كلمة المرور الحالية
    let token;
    if (password) {
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            throw new AppError('كلمة المرور الحالية غير صحيحة', 401);
        }
        user.password = await bcrypt.hash(password, 10);
        user.passwordChangedAt = new Date();
        token = signToken(user);
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        message: '✨ تم تحديث ملفك الشخصي بنجاح!',
        ...(token && { token }),
        data: {
            user
        }
    });
}));

// 3️⃣ تغيير كلمة المرور - PUT /api/users/me/password
router.put(['/me/password', '/profile/password'], validate(changePasswordSchema), asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
        throw new AppError('كلمة المرور الحالية غير صحيحة', 401);
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    // رمز جديد لأن الرموز القديمة أصبحت غير صالحة
    res.status(200).json({
        status: 'success',
        message: '🔐 تم تغيير كلمة المرور بنجاح!',
        token: signToken(user)
    });
}));

// 4️⃣ حذف حساب المستخدم الحالي - DELETE /api/users/me
// إذا كان لدى المستخدم طلبات سابقة يتم تعطيل الحساب وإخفاء بياناته بدلاً من حذفه (للحفاظ على سجل الطلبات)
router.delete(['/me', '/profile'], asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await Cart.deleteOne({ user: userId });

    const hasOrders = await Order.exists({ user: userId });
    if (hasOrders) {
        await User.updateOne({ _id: userId }, {
            isActive: false,
            name: 'Deleted User',
            email: `deleted-${userId}@deleted.local`,
            phone: '',
            addresses: [],
            wishlist: []
        });
    } else {
        await User.deleteOne({ _id: userId });
    }

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف حسابك الشخصي بنجاح!'
    });
}));

// ============ 📍 العناوين ============

// جلب كل العناوين - GET /api/users/me/addresses
router.get('/me/addresses', asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('addresses');
    res.status(200).json({
        status: 'success',
        data: { addresses: user.addresses }
    });
}));

// إضافة عنوان - POST /api/users/me/addresses
router.post('/me/addresses', validate(createAddressSchema), asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.addresses.length >= MAX_ADDRESSES) {
        throw new AppError(`لا يمكن حفظ أكثر من ${MAX_ADDRESSES} عناوين`, 400);
    }

    // أول عنوان يصبح الافتراضي تلقائياً، وعند اختيار عنوان افتراضي جديد يُلغى السابق
    const isDefault = user.addresses.length === 0 || req.body.isDefault;
    if (isDefault) {
        user.addresses.forEach(address => { address.isDefault = false; });
    }
    user.addresses.push({ ...req.body, isDefault });
    await user.save();

    res.status(201).json({
        status: 'success',
        message: '📍 تم إضافة العنوان بنجاح!',
        data: {
            address: user.addresses[user.addresses.length - 1],
            addresses: user.addresses
        }
    });
}));

// جلب العنوان من حساب المستخدم أو رمي خطأ 404
const findAddress = (user, addressId) => {
    const address = isObjectId(addressId) ? user.addresses.id(addressId) : null;
    if (!address) {
        throw new AppError('العنوان غير موجود', 404);
    }
    return address;
};

// تعديل عنوان - PUT /api/users/me/addresses/:addressId
router.put('/me/addresses/:addressId', validate(updateAddressSchema), asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = findAddress(user, req.params.addressId);

    if (req.body.isDefault === true) {
        user.addresses.forEach(a => { a.isDefault = false; });
    }
    // لا يمكن إلغاء الافتراضي بدون اختيار عنوان آخر
    if (req.body.isDefault === false && address.isDefault) {
        delete req.body.isDefault;
    }
    address.set(req.body);
    await user.save();

    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل العنوان بنجاح!',
        data: { address, addresses: user.addresses }
    });
}));

// تعيين عنوان كافتراضي - PATCH /api/users/me/addresses/:addressId/default
router.patch('/me/addresses/:addressId/default', asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = findAddress(user, req.params.addressId);

    user.addresses.forEach(a => { a.isDefault = false; });
    address.isDefault = true;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: '⭐ تم تعيين العنوان كافتراضي',
        data: { addresses: user.addresses }
    });
}));

// حذف عنوان - DELETE /api/users/me/addresses/:addressId
router.delete('/me/addresses/:addressId', asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = findAddress(user, req.params.addressId);
    const wasDefault = address.isDefault;

    address.deleteOne();
    // إذا حُذف العنوان الافتراضي يصبح أول عنوان متبقٍ هو الافتراضي
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }
    await user.save();

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف العنوان بنجاح!',
        data: { addresses: user.addresses }
    });
}));

// ============ ❤️ المفضلة ============

// جلب المفضلة (المنتجات المفعلة فقط) - GET /api/users/me/wishlist
router.get('/me/wishlist', asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'wishlist',
        match: { isActive: { $ne: false } },
        populate: { path: 'category', select: 'slug nameEn nameAr' }
    });

    res.status(200).json({
        status: 'success',
        count: user.wishlist.length,
        data: {
            ids: user.wishlist.map(p => p._id),
            products: user.wishlist
        }
    });
}));

// إضافة منتج للمفضلة - POST /api/users/me/wishlist/:productId
router.post('/me/wishlist/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }

    const product = await Product.exists({ _id: productId, isActive: { $ne: false } });
    if (!product) {
        throw new AppError('المنتج غير موجود!', 404);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { wishlist: productId } },
        { returnDocument: 'after' }
    );

    res.status(200).json({
        status: 'success',
        message: '❤️ تم إضافة المنتج إلى المفضلة',
        data: { ids: user.wishlist }
    });
}));

// إزالة منتج من المفضلة - DELETE /api/users/me/wishlist/:productId
router.delete('/me/wishlist/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { wishlist: productId } },
        { returnDocument: 'after' }
    );

    res.status(200).json({
        status: 'success',
        message: '💔 تم إزالة المنتج من المفضلة',
        data: { ids: user.wishlist }
    });
}));

module.exports = router;
