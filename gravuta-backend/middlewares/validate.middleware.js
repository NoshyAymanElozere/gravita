// وسيط عام للتحقق من بيانات المدخلات باستخدام مكتبة Joi
// source: 'body' (افتراضي) أو 'query'
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        // abortEarly: false يعيد جميع الأخطاء دفعة واحدة بدلاً من التوقف عند أول خطأ
        const { error, value } = schema.validate(req[source] || {}, { abortEarly: false });

        if (error) {
            // تجميع رسائل الأخطاء في مصفوفة
            const errorMessages = error.details.map(detail => detail.message);

            return res.status(400).json({
                status: 'fail',
                message: 'بيانات المدخلات غير صالحة (Validation Error)',
                errors: errorMessages
            });
        }

        // استبدال المدخلات بالقيم بعد التحويل (أرقام، قيم افتراضية، تنظيف النصوص)
        if (source === 'body') {
            req.body = value;
        } else {
            req.validatedQuery = value;
        }

        next(); // الانتقال إلى المعالج التالي إذا كانت المدخلات سليمة
    };
};

module.exports = validate;
