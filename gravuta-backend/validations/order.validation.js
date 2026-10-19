const Joi = require('joi');
const { objectId, phoneRule, addressSchema } = require('./common.validation');
const { ORDER_STATUSES, PAYMENT_METHODS } = require('../models/Order');

const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...ORDER_STATUSES)
        .required()
        .messages({
            'any.only': `حالة الطلب غير صالحة، يجب أن تكون إحدى القيم: ${ORDER_STATUSES.join(', ')}`,
            'any.required': 'حالة الطلب مطلوبة'
        }),
    note: Joi.string().trim().max(300).allow(''),
    trackingNumber: Joi.string().trim().max(60).allow(''),
    estimatedDelivery: Joi.date().iso()
});

// إنشاء طلب من العربة: إما addressId (عنوان محفوظ) أو address (عنوان جديد)
const createOrderSchema = Joi.object({
    addressId: objectId('معرف العنوان'),
    address: addressSchema,
    saveAddress: Joi.boolean().default(false),
    contact: Joi.object({
        name: Joi.string().trim().min(3).max(100),
        email: Joi.string().trim().email(),
        phone: phoneRule
    }),
    paymentMethod: Joi.string()
        .valid(...PAYMENT_METHODS)
        .default('cod')
        .messages({
            'any.only': `طريقة الدفع غير مدعومة (${PAYMENT_METHODS.join(', ')})`
        }),
    notes: Joi.string().trim().max(500).allow('')
}).xor('addressId', 'address').messages({
    'object.missing': 'عنوان الشحن مطلوب: أرسل addressId أو address',
    'object.xor': 'أرسل addressId أو address وليس كلاهما'
});

const cancelOrderSchema = Joi.object({
    reason: Joi.string().trim().max(300).allow('')
});

const returnOrderSchema = Joi.object({
    reason: Joi.string().trim().min(5).max(500).required().messages({
        'any.required': 'سبب الاسترجاع مطلوب',
        'string.min': 'يرجى توضيح سبب الاسترجاع'
    })
});

const orderQuerySchema = Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid(...ORDER_STATUSES, 'in-transit'),
    q: Joi.string().trim().max(100).allow(''),
    from: Joi.date().iso(),
    to: Joi.date().iso()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    cancelOrderSchema,
    returnOrderSchema,
    orderQuerySchema
};
