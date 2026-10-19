// يغلف معالجات الـ async ويمرر أي خطأ إلى وسيط معالجة الأخطاء المركزي بدلاً من تكرار try/catch
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
