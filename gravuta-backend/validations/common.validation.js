const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectId = (label = 'المعرف') => Joi.string().regex(objectIdRegex).messages({
    'string.empty': `${label} مطلوب`,
    'string.pattern.base': `${label} غير صحيح (Invalid ID format)`,
    'any.required': `${label} حقل إجباري`
});

const slugRule = Joi.string().trim().lowercase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).messages({
    'string.pattern.base': 'الـ slug يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطات فقط (e.g. ocean-glow-serum)'
});

const phoneRule = Joi.string().trim().regex(/^\+?[0-9\s-]{7,20}$/).messages({
    'string.pattern.base': 'رقم الهاتف غير صالح'
});

// حقول العنوان (لعناوين المستخدم وعنوان الشحن في الطلب)
const addressKeys = {
    fullName: Joi.string().trim().min(3).max(100),
    phone: phoneRule,
    addressLine1: Joi.string().trim().min(3).max(200),
    addressLine2: Joi.string().trim().max(200).allow(''),
    city: Joi.string().trim().min(2).max(100),
    state: Joi.string().trim().max(100).allow(''),
    postalCode: Joi.string().trim().max(20).allow(''),
    country: Joi.string().trim().max(100)
};

const addressSchema = Joi.object({
    ...addressKeys,
    fullName: addressKeys.fullName.required(),
    phone: addressKeys.phone.required(),
    addressLine1: addressKeys.addressLine1.required(),
    city: addressKeys.city.required()
});

module.exports = {
    objectIdRegex,
    objectId,
    slugRule,
    phoneRule,
    addressKeys,
    addressSchema
};
