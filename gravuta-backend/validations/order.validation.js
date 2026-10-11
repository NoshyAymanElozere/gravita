const Joi = require('joi');

const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
        .required()
        .messages({
            'any.only': 'حالة الطلب غير صالحة، يجب أن تكون إحدى القيم: pending, processing, shipped, delivered, cancelled',
            'any.required': 'حالة الطلب مطلوبة'
        })
});

const createOrderSchema = Joi.object({
    shippingAddress: Joi.string()
        .min(5)
        .max(200)
        .trim()
        .required()
        .messages({
            'string.empty': 'عنوان الشحن مطلوب لإرسال الطلب',
            'string.min': 'عنوان الشحن يجب أن لا يقل عن 5 أحرف',
            'string.max': 'عنوان الشحن طويل جداً (الحد الأقصى 200 حرف)',
            'any.required': 'عنوان الشحن حقل إجباري'
        }),
    phone: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'رقم الهاتف مطلوب للاتصال والتسليم',
            'any.required': 'رقم الهاتف حقل إجباري'
        }),
    paymentMethod: Joi.string()
        .valid('COD', 'Card')
        .default('COD')
        .messages({
            'any.only': 'طريقة الدفع المحددة غير مدعومة (يجب أن تكون COD أو Card)'
        })
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
