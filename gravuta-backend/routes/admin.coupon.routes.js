const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const validate = require('../middlewares/validate.middleware');
const { createCouponSchema, updateCouponSchema } = require('../validations/coupon.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب كل الكوبونات - GET /api/admin/coupons
router.get('/', asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const { results, pagination } = await paginate(Coupon, filter, req.query, '', '', { createdAt: -1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ جلب كوبون واحد - GET /api/admin/coupons/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new AppError('الكوبون غير موجود', 404);
    }
    res.status(200).json({ status: 'success', data: coupon });
}));

// 3️⃣ إضافة كوبون - POST /api/admin/coupons
router.post('/', validate(createCouponSchema), asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
        status: 'success',
        message: '🏷️ تم إضافة الكوبون بنجاح!',
        data: coupon
    });
}));

// 4️⃣ تعديل كوبون - PUT /api/admin/coupons/:id
router.put('/:id', validate(updateCouponSchema), asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        throw new AppError('الكوبون غير موجود لتعديله', 404);
    }

    coupon.set(req.body);
    await coupon.save();

    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل الكوبون بنجاح!',
        data: coupon
    });
}));

// 5️⃣ حذف كوبون - DELETE /api/admin/coupons/:id
// الطلبات السابقة تحتفظ بنسخة من بيانات الكوبون لذلك لا تتأثر
router.delete('/:id', asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
        throw new AppError('الكوبون غير موجود لحذفه', 404);
    }
    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف الكوبون بنجاح!'
    });
}));

module.exports = router;
