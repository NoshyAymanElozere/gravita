const Joi = require('joi');

const bannerKeys = {
    titleEn: Joi.string().max(120).trim().allow(''),
    titleAr: Joi.string().max(120).trim().allow(''),
    image: Joi.string().trim().allow('').optional(),
    link: Joi.string().max(500).trim().allow(''),
    sortOrder: Joi.number().integer(),
    isActive: Joi.boolean()
};

// الصورة إجبارية عند الإنشاء (تصل كمسار بعد رفعها عبر Multer)
const createBannerSchema = Joi.object({
    ...bannerKeys,
    image: Joi.string().trim().required().messages({
        'any.required': 'صورة البانر (image) حقل إجباري',
        'string.empty': 'صورة البانر مطلوبة'
    })
});

const updateBannerSchema = Joi.object(bannerKeys).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث'
});

module.exports = {
    createBannerSchema,
    updateBannerSchema
};
