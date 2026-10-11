const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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
            'number.base': 'الكمية يجب أن تكون رقماً صحبحاً',
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

module.exports = {
    addToCartSchema,
    updateCartItemSchema
};
