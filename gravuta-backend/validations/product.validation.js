const Joi = require('joi');

// مخطط التحقق لإضافة منتج جديد (Create Product Validation Schema)
const createProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.empty': 'اسم المنتج مطلوب',
            'string.min': 'اسم المنتج يجب أن يحتوي على 3 حروف على الأقل',
            'string.max': 'اسم المنتج لا يمكن أن يتجاوز 100 حرف',
            'any.required': 'اسم المنتج حقل إجباري'
        }),

    description: Joi.string()
        .min(5)
        .max(500)
        .trim()
        .required()
        .messages({
            'string.empty': 'وصف المنتج مطلوب',
            'string.min': 'وصف المنتج يجب أن يحتوي على 5 حروف على الأقل',
            'any.required': 'وصف المنتج حقل إجباري'
        }),

    price: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'السعر يجب أن يكون رقماً',
            'number.min': 'السعر لا يمكن أن يكون أقل من 0',
            'any.required': 'سعر المنتج حقل إجباري'
        }),

    category: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.empty': 'معرف الفئة مطلوب',
            'string.hex': 'معرف الفئة يجب أن يكون بنظام hex (24 حرفاً)',
            'string.length': 'معرف الفئة يجب أن يكون بطول 24 حرفاً بالضبط',
            'any.required': 'معرف الفئة حقل إجباري'
        }),

    image: Joi.string().allow('').optional()
});

// مخطط التحقق لتعديل منتج (Update Product Validation Schema)
const updateProductSchema = Joi.object({
    name: Joi.string().min(3).max(100).trim(),
    description: Joi.string().min(5).max(500).trim(),
    price: Joi.number().min(0),
    category: Joi.string().hex().length(24).messages({
        'string.hex': 'معرف الفئة يجب أن يكون بنظام hex (24 حرفاً)',
        'string.length': 'معرف الفئة يجب أن يكون بطول 24 حرفاً بالضبط'
    }),
    image: Joi.string().allow('').optional()
}).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث (name, description, price, category, أو image)'
});

module.exports = {
    createProductSchema,
    updateProductSchema
};
