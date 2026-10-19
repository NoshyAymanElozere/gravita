const Joi = require('joi');
const { slugRule } = require('./common.validation');

// الحقول المشتركة - name و description مقبولة كأسماء بديلة لـ nameEn و descriptionEn
const categoryKeys = {
    slug: slugRule,
    nameEn: Joi.string().min(2).max(80).trim().messages({
        'string.empty': 'اسم الفئة مطلوب',
        'string.min': 'اسم الفئة يجب أن يحتوي على حرفين على الأقل',
        'string.max': 'اسم الفئة لا يمكن أن يتجاوز 80 حرفاً'
    }),
    nameAr: Joi.string().min(2).max(80).trim(),
    descriptionEn: Joi.string().max(500).trim().allow(''),
    descriptionAr: Joi.string().max(500).trim().allow(''),
    image: Joi.string().allow('').optional(),
    sortOrder: Joi.number().integer(),
    isActive: Joi.boolean()
};

const aliases = (schema) => schema
    .rename('name', 'nameEn', { ignoreUndefined: true })
    .rename('description', 'descriptionEn', { ignoreUndefined: true });

// مخطط التحقق لإضافة فئة جديدة (Create Category Validation Schema)
const createCategorySchema = aliases(Joi.object({
    ...categoryKeys,
    nameEn: categoryKeys.nameEn.required().messages({ 'any.required': 'اسم الفئة (nameEn) حقل إجباري' })
}));

// مخطط التحقق لتعديل فئة (Update Category Validation Schema)
const updateCategorySchema = aliases(Joi.object(categoryKeys)).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث'
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
