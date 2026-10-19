const Joi = require('joi');
const { phoneRule } = require('./common.validation');

// مخطط التحقق لتسجيل الدخول (Login Validation Schema)
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'البريد الإلكتروني مطلوب',
            'string.email': 'البريد الإلكتروني غير صالح',
            'any.required': 'البريد الإلكتروني حقل إجباري'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'كلمة المرور مطلوبة',
            'any.required': 'كلمة المرور حقل إجباري'
        })
});

// مخطط التحقق لتسجيل حساب جديد (Register Validation Schema)
const registerSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'الاسم مطلوب',
            'string.min': 'الاسم يجب أن يحتوي على 3 حروف على الأقل',
            'string.max': 'الاسم لا يمكن أن يتجاوز 50 حرفاً',
            'any.required': 'الاسم حقل إجباري'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'البريد الإلكتروني مطلوب',
            'string.email': 'البريد الإلكتروني غير صالح',
            'any.required': 'البريد الإلكتروني حقل إجباري'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'كلمة المرور مطلوبة',
            'string.min': 'كلمة المرور يجب أن لا تقل عن 6 أحرف',
            'any.required': 'كلمة المرور حقل إجباري'
        }),
    phone: phoneRule.allow('').optional(),
    role: Joi.string().valid('user').optional() // نسمح بـ user فقط للتسجيل، ولا يمكن تسجيل أدمن من هنا
});

module.exports = {
    loginSchema,
    registerSchema
};
