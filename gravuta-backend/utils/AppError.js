// خطأ تشغيلي متوقع (Operational Error) يحمل كود الحالة ورسالة واضحة للعميل
class AppError extends Error {
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        if (details) this.details = details;
    }
}

module.exports = AppError;
