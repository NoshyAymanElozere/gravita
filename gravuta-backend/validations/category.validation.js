const Joi = require('joi');

// مخطط التحقق لإضافة فئة جديدة (Create Category Validation Schema)
const createCategorySchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'اسم الفئة مطلوب',
            'string.min': 'اسم الفئة يجب أن يحتوي على 3 حروف على الأقل',
            'string.max': 'اسم الفئة لا يمكن أن يتجاوز 50 حرفاً',
            'any.required': 'اسم الفئة حقل إجباري'
        }),

    description: Joi.string()
        .min(5)
        .max(200)
        .trim()
        .required()
        .messages({
            'string.empty': 'وصف الفئة مطلوب',
            'string.min': 'وصف الفئة يجب أن يحتوي على 5 حروف على الأقل',
            'string.max': 'وصف الفئة لا يمكن أن يتجاوز 200 حرف',
            'any.required': 'وصف الفئة حقل إجباري'
        }),
    
    image: Joi.string().allow('').optional()
});

// مخطط التحقق لتعديل فئة (Update Category Validation Schema)
const updateCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).trim(),
    description: Joi.string().min(5).max(200).trim(),
    image: Joi.string().allow('').optional()
}).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث (name أو description أو image)'
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
