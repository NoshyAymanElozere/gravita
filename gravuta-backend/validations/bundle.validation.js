const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectId = (label) => Joi.string().regex(objectIdRegex).messages({
    'string.empty': `${label} مطلوب`,
    'string.pattern.base': `${label} غير صحيح (Invalid ID format)`,
    'any.required': `${label} حقل إجباري`
});

// عنصر داخل الباقة
const bundleItemSchema = Joi.object({
    product: objectId('معرف المنتج').required(),
    stepEn: Joi.string().trim().required(),
    stepAr: Joi.string().trim().required(),
    benefitEn: Joi.string().trim().required(),
    benefitAr: Joi.string().trim().required(),
    quantity: Joi.number().integer().min(1).default(1),
    order: Joi.number().integer().min(1)
});

const slugRule = Joi.string().trim().lowercase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).messages({
    'string.pattern.base': 'الـ slug يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطات فقط (e.g. dewy-hydration-duo)'
});

// ملاحظة: originalPrice لا يُرسل من العميل، بل يُحسب في السيرفر من أسعار المنتجات
const createBundleSchema = Joi.object({
    slug: slugRule.required(),
    nameEn: Joi.string().trim().min(3).required(),
    nameAr: Joi.string().trim().min(3).required(),
    subtitleEn: Joi.string().trim().allow(''),
    subtitleAr: Joi.string().trim().allow(''),
    descriptionEn: Joi.string().trim().required(),
    descriptionAr: Joi.string().trim().required(),
    image: Joi.string().allow('').optional(),
    discountPercentage: Joi.number().min(0).max(99).required(),
    // اختياري: لتحديد سعر الباقة يدوياً بدلاً من حسابه من نسبة الخصم
    bundlePrice: Joi.number().min(0),
    benefitsEn: Joi.array().items(Joi.string().trim()).default([]),
    benefitsAr: Joi.array().items(Joi.string().trim()).default([]),
    items: Joi.array().items(bundleItemSchema).min(2).required().messages({
        'array.min': 'الباقة يجب أن تحتوي على منتجين على الأقل'
    }),
    isActive: Joi.boolean()
});

const updateBundleSchema = Joi.object({
    slug: slugRule,
    nameEn: Joi.string().trim().min(3),
    nameAr: Joi.string().trim().min(3),
    subtitleEn: Joi.string().trim().allow(''),
    subtitleAr: Joi.string().trim().allow(''),
    descriptionEn: Joi.string().trim(),
    descriptionAr: Joi.string().trim(),
    image: Joi.string().allow('').optional(),
    discountPercentage: Joi.number().min(0).max(99),
    bundlePrice: Joi.number().min(0),
    benefitsEn: Joi.array().items(Joi.string().trim()),
    benefitsAr: Joi.array().items(Joi.string().trim()),
    items: Joi.array().items(bundleItemSchema).min(2).messages({
        'array.min': 'الباقة يجب أن تحتوي على منتجين على الأقل'
    }),
    isActive: Joi.boolean()
}).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث'
});

// العربة: إضافة باقة
const addBundleToCartSchema = Joi.object({
    bundleId: objectId('معرف الباقة').required(),
    quantity: Joi.number().integer().min(1).default(1)
});

// العربة: تعديل كمية باقة
const updateCartBundleSchema = Joi.object({
    bundleId: objectId('معرف الباقة').required(),
    quantity: Joi.number().integer().min(1).required()
});

module.exports = {
    createBundleSchema,
    updateBundleSchema,
    addBundleToCartSchema,
    updateCartBundleSchema
};
