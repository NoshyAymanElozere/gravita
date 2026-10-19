const mongoose = require('mongoose');
const AppError = require('./AppError');

// تحويل نص إلى slug صالح للروابط (e.g. "Ocean Glow Serum" => "ocean-glow-serum")
const slugify = (text = '') =>
    String(text)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// حماية نص البحث قبل استخدامه داخل RegExp
const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value);

// فلتر للبحث بالمعرف أو بالـ slug (يُستخدم في المسارات العامة /:idOrSlug)
const idOrSlugFilter = (idOrSlug) =>
    isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase() };

/**
 * عند استخدام multipart/form-data (لرفع الصور) تصل المصفوفات والكائنات كنصوص JSON.
 * هذا الوسيط يحول الحقول المحددة إلى قيم حقيقية قبل التحقق بـ Joi.
 */
const parseJsonFields = (...fields) => (req, res, next) => {
    for (const field of fields) {
        if (typeof req.body?.[field] === 'string') {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch {
                return next(new AppError(`صيغة JSON غير صحيحة في الحقل (${field})`, 400));
            }
        }
    }
    next();
};

// إرفاق مسارات الصور المرفوعة عبر Multer بجسم الطلب (image مفردة و galleryImages متعددة)
const attachUploadedImages = (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    if (req.files) {
        if (req.files.image?.[0]) {
            req.body.image = `/uploads/${req.files.image[0].filename}`;
        }
        if (req.files.galleryImages?.length) {
            const uploaded = req.files.galleryImages.map(f => `/uploads/${f.filename}`);
            const existing = Array.isArray(req.body.galleryImages) ? req.body.galleryImages : [];
            req.body.galleryImages = [...existing, ...uploaded];
        }
    }
    next();
};

module.exports = {
    slugify,
    escapeRegex,
    isObjectId,
    idOrSlugFilter,
    parseJsonFields,
    attachUploadedImages
};
