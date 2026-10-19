const Joi = require('joi');

const createReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'التقييم مطلوب',
        'number.min': 'التقييم يجب أن يكون من 1 إلى 5',
        'number.max': 'التقييم يجب أن يكون من 1 إلى 5'
    }),
    comment: Joi.string().trim().min(3).max(1000).required().messages({
        'any.required': 'نص التقييم مطلوب',
        'string.min': 'نص التقييم قصير جداً'
    }),
    lang: Joi.string().valid('en', 'ar').default('en'),
    photo: Joi.string().allow('')
});

const updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string().trim().min(3).max(1000),
    lang: Joi.string().valid('en', 'ar'),
    photo: Joi.string().allow('')
}).min(1);

const moderateReviewSchema = Joi.object({
    isApproved: Joi.boolean().required()
});

const newsletterSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'any.required': 'البريد الإلكتروني مطلوب',
        'string.email': 'البريد الإلكتروني غير صالح'
    }),
    lang: Joi.string().valid('en', 'ar').default('en')
});

module.exports = {
    createReviewSchema,
    updateReviewSchema,
    moderateReviewSchema,
    newsletterSchema
};
