const Joi = require('joi');
const { objectIdRegex, objectId } = require('./common.validation');

// مخطط التحقق لإضافة منتج للعربة
const addToCartSchema = Joi.object({
    productId: Joi.string()
        .regex(objectIdRegex)
        .required()
        .messages({
            'string.empty': 'معرف المنتج مطلوب',
            'string.pattern.base': 'معرف المنتج غير صحيح (Invalid Product ID format)',
            'any.required': 'معرف المنتج حقل إجباري'
        }),
    quantity: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'الكمية يجب أن تكون رقماً صحيحاً',
            'number.min': 'الكمية يجب أن تكون 1 على الأقل'
        })
});

// مخطط التحقق لتحديث كمية منتج في العربة
const updateCartItemSchema = Joi.object({
    productId: Joi.string()
        .regex(objectIdRegex)
        .required()
        .messages({
            'string.empty': 'معرف المنتج مطلوب',
            'string.pattern.base': 'معرف المنتج غير صحيح (Invalid Product ID format)',
            'any.required': 'معرف المنتج حقل إجباري'
        }),
    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'الكمية يجب أن تكون رقماً صحيحاً',
            'number.min': 'الكمية يجب أن تكون 1 على الأقل',
            'any.required': 'الكمية مطلوبة لتحديث العنصر'
        })
});

// تطبيق كوبون خصم على العربة
const applyCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().min(2).max(40).required().messages({
        'any.required': 'كود الخصم مطلوب',
        'string.empty': 'كود الخصم مطلوب'
    })
});

// دمج عربة الزائر (المحفوظة في المتصفح) مع عربة الحساب بعد تسجيل الدخول
const mergeCartSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        itemType: Joi.string().valid('product', 'bundle').default('product'),
        id: objectId('معرف المنتج/الباقة').required(),
        quantity: Joi.number().integer().min(1).default(1)
    })).max(50).required()
});

// GET /api/cart?paymentMethod=cod - لعرض رسوم الدفع عند الاستلام ضمن الحساب
const { PAYMENT_METHODS } = require('../models/Order');
const cartQuerySchema = Joi.object({
    paymentMethod: Joi.string().valid(...PAYMENT_METHODS)
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
    applyCouponSchema,
    mergeCartSchema,
    cartQuerySchema
};
