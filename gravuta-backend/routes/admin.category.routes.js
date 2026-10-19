const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { attachUploadedImages } = require('../utils/helpers');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب كل الفئات (بما فيها غير المفعلة) - GET /api/admin/categories
router.get('/', asyncHandler(async (req, res) => {
    const { results, pagination } = await paginate(Category, {}, req.query, '', '', { sortOrder: 1, nameEn: 1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ إضافة فئة جديدة مع دعم رفع الصور - POST /api/admin/categories
router.post('/', upload.single('image'), attachUploadedImages, validate(createCategorySchema), asyncHandler(async (req, res) => {
    const savedCategory = await Category.create(req.body);

    res.status(201).json({
        status: 'success',
        message: '🎉 تم إضافة الفئة بنجاح!',
        data: savedCategory
    });
}));

// 3️⃣ تعديل بيانات فئة مع دعم تحديث الصورة - PUT /api/admin/categories/:id
router.put('/:id', upload.single('image'), attachUploadedImages, validate(updateCategorySchema), asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError('الفئة غير موجودة لتعديلها', 404);
    }

    category.set(req.body);
    await category.save();

    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل الفئة بنجاح!',
        data: category
    });
}));

// 4️⃣ حذف فئة - DELETE /api/admin/categories/:id (مرفوض إذا كانت تحتوي على منتجات)
router.delete('/:id', asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
        throw new AppError(`لا يمكن حذف الفئة لأنها تحتوي على ${productCount} منتج - انقل المنتجات أو عطّل الفئة`, 409);
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
        throw new AppError('الفئة غير موجودة لحذفها', 404);
    }

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف الفئة بنجاح!'
    });
}));

module.exports = router;
