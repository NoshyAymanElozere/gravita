const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const validate = require('../middlewares/validate.middleware');
const { createBannerSchema, updateBannerSchema } = require('../validations/banner.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { attachUploadedImages } = require('../utils/helpers');

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب كل الشرائح (بما فيها غير المفعلة) - GET /api/admin/banners
router.get('/', asyncHandler(async (req, res) => {
    const { results, pagination } = await paginate(Banner, {}, req.query, '', '', { sortOrder: 1, createdAt: 1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ إضافة شريحة جديدة مع رفع الصورة - POST /api/admin/banners
router.post('/', upload.single('image'), attachUploadedImages, validate(createBannerSchema), asyncHandler(async (req, res) => {
    const banner = await Banner.create(req.body);
    res.status(201).json({
        status: 'success',
        message: '🎉 تم إضافة الشريحة بنجاح!',
        data: banner
    });
}));

// 3️⃣ تعديل شريحة مع تحديث الصورة - PUT /api/admin/banners/:id
router.put('/:id', upload.single('image'), attachUploadedImages, validate(updateBannerSchema), asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        throw new AppError('الشريحة غير موجودة لتعديلها', 404);
    }
    banner.set(req.body);
    await banner.save();
    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل الشريحة بنجاح!',
        data: banner
    });
}));

// 4️⃣ حذف شريحة - DELETE /api/admin/banners/:id
router.delete('/:id', asyncHandler(async (req, res) => {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new AppError('الشريحة غير موجودة لحذفها', 404);
    }
    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف الشريحة بنجاح!'
    });
}));

module.exports = router;
