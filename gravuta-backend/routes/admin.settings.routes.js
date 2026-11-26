const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const MAX_LOGO_BYTES = 1024 * 1024; // 1MB

// الشعار يُرفع في الذاكرة ثم يُحفظ في قاعدة البيانات (وليس على القرص)
const logoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_LOGO_BYTES },
    fileFilter: (req, file, cb) => {
        const okExt = /\.(png|jpe?g|webp|gif|svg)$/i.test(path.extname(file.originalname));
        const okMime = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.mimetype);
        if (okExt && okMime) return cb(null, true);
        cb(new AppError('الشعار يجب أن يكون صورة (png, jpg, webp, gif, svg)', 400), false);
    }
});

const respond = (res, site, message) =>
    res.status(200).json({
        status: 'success',
        message,
        data: { logo: site.logo || null, updatedAt: site.updatedAt }
    });

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// GET /api/admin/settings
router.get('/', asyncHandler(async (req, res) => {
    respond(res, await Setting.getSite());
}));

// رفع شعار جديد - PUT /api/admin/settings/logo (multipart, field: logo)
router.put('/logo', (req, res, next) => {
    logoUpload.single('logo')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('حجم الشعار يجب ألا يتجاوز 1MB', 400));
        }
        next(err);
    });
}, asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('يرجى اختيار صورة الشعار (logo)', 400);
    const site = await Setting.getSite();
    site.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    await site.save();
    respond(res, site, '✨ تم تحديث الشعار بنجاح!');
}));

// إرجاع الشعار الافتراضي - DELETE /api/admin/settings/logo
router.delete('/logo', asyncHandler(async (req, res) => {
    const site = await Setting.getSite();
    site.logo = '';
    await site.save();
    respond(res, site, 'تمت استعادة الشعار الافتراضي');
}));

module.exports = router;
