const Joi = require('joi');

const couponKeys = {
    code: Joi.string().trim().uppercase().regex(/^[A-Z0-9_-]{2,40}$/).messages({
        'string.pattern.base': 'الكود يجب أن يحتوي على حروف إنجليزية وأرقام فقط (2-40 حرفاً)'
    }),
    discountType: Joi.string().valid('percentage', 'fixed'),
    value: Joi.number().min(0).when('discountType', {
        is: 'percentage',
        then: Joi.number().max(100).messages({ 'number.max': 'نسبة الخصم لا يمكن أن تتعدى 100%' })
    }),
    minOrderAmount: Joi.number().min(0),
    maxDiscount: Joi.number().min(0).allow(null),
    expiresAt: Joi.date().iso().allow(null),
    usageLimit: Joi.number().integer().min(0).allow(null),
    perUserLimit: Joi.number().integer().min(1),
    descriptionEn: Joi.string().trim().max(300).allow(''),
    descriptionAr: Joi.string().trim().max(300).allow(''),
    isActive: Joi.boolean()
};

const createCouponSchema = Joi.object({
    ...couponKeys,
    code: couponKeys.code.required(),
    discountType: couponKeys.discountType.required(),
    value: couponKeys.value.required()
});

const updateCouponSchema = Joi.object(couponKeys).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث'
});

module.exports = {
    createCouponSchema,
    updateCouponSchema
};
