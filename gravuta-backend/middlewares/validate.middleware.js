// وسيط عام للتحقق من بيانات المدخلات باستخدام مكتبة Joi
const validate = (schema) => {
    return (req, res, next) => {
        // abortEarly: false يعيد جميع الأخطاء دفعة واحدة بدلاً من التوقف عند أول خطأ
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            // تجميع رسائل الأخطاء في مصفوفة
            const errorMessages = error.details.map(detail => detail.message);

            return res.status(400).json({
                status: 'fail',
                message: 'بيانات المدخلات غير صالحة (Validation Error)',
                errors: errorMessages
            });
        }

        next(); // الانتقال إلى المعالج التالي إذا كانت المدخلات سليمة
    };
};

module.exports = validate;
