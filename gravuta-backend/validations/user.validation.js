const Joi = require('joi');

// مخطط التحقق لإنشاء مستخدم بواسطة الأدمن (Create User by Admin Validation Schema)
const createUserSchema = Joi.object({
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

    role: Joi.string()
        .valid('user', 'admin')
        .default('user')
        .messages({
            'any.only': 'الصلاحية المحددة غير صالحة، يجب أن تكون user أو admin'
        })
});

// مخطط التحقق لتعديل بيانات مستخدم بواسطة الأدمن (Update User by Admin Validation Schema)
const updateUserSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .messages({
            'string.min': 'الاسم يجب أن يحتوي على 3 حروف على الأقل',
            'string.max': 'الاسم لا يمكن أن يتجاوز 50 حرفاً'
        }),

    email: Joi.string()
        .email()
        .messages({
            'string.email': 'البريد الإلكتروني غير صالح'
        }),

    password: Joi.string()
        .min(6)
        .messages({
            'string.min': 'كلمة المرور يجب أن لا تقل عن 6 أحرف'
        }),

    role: Joi.string()
        .valid('user', 'admin')
        .messages({
            'any.only': 'الصلاحية المحددة غير صالحة، يجب أن تكون user أو admin'
        }),

    isActive: Joi.boolean()
        .messages({
            'boolean.base': 'حالة الحساب يجب أن تكون القيمة true أو false'
        })
}).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث (name, email, password, role, أو isActive)'
});

// مخطط التحقق لتعديل بيانات الملف الشخصي بواسطة المستخدم نفسه (Update Profile Validation Schema)
const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .messages({
            'string.min': 'الاسم يجب أن يحتوي على 3 حروف على الأقل',
            'string.max': 'الاسم لا يمكن أن يتجاوز 50 حرفاً'
        }),

    email: Joi.string()
        .email()
        .messages({
            'string.email': 'البريد الإلكتروني غير صالح'
        }),

    password: Joi.string()
        .min(6)
        .messages({
            'string.min': 'كلمة المرور يجب أن لا تقل عن 6 أحرف'
        })
}).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث (name, email, أو password)'
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    updateProfileSchema
};
