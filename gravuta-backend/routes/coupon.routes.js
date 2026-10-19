const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Coupon = require('../models/Coupon');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { evaluateCoupon } = require('../utils/pricing');

const validateCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().min(2).max(40).required(),
    subtotal: Joi.number().min(0).default(0)
});

// التحقق من كوبون لعربة الزائر قبل تسجيل الدخول - POST /api/coupons/validate { code, subtotal }
// (حد الاستخدام لكل مستخدم يُتحقق منه لاحقاً عند تطبيق الكوبون على عربة الحساب)
router.post('/validate', validate(validateCouponSchema), asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.body.code });
    const result = await evaluateCoupon(coupon, req.body.subtotal);
    if (!result.valid) {
        throw new AppError(result.message, 400);
    }

    res.status(200).json({
        status: 'success',
        data: {
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                value: coupon.value,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscount: coupon.maxDiscount,
                expiresAt: coupon.expiresAt,
                descriptionEn: coupon.descriptionEn,
                descriptionAr: coupon.descriptionAr
            },
            discount: result.discount
        }
    });
}));

module.exports = router;
