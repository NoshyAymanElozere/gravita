const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ إضافة فئة جديدة مع دعم رفع الصور - POST /api/admin/categories
router.post('/', upload.single('image'), (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
}, validate(createCategorySchema), async (req, res) => {
    try {
        const { name, description, image } = req.body;  

        // التحقق من عدم تكرار الاسم
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                status: 'fail',
                message: 'هذه الفئة موجودة بالفعل!'
            });
        }

        const newCategory = new Category({
            name,
            description,
            image
        });

        const savedCategory = await newCategory.save();

        res.status(201).json({
            status: 'success',
            message: '🎉 تم إضافة الفئة بنجاح!',
            data: savedCategory
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ تعديل بيانات فئة مع دعم تحديث الصورة - PUT /api/admin/categories/:id
router.put('/:id', upload.single('image'), (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
}, validate(updateCategorySchema), async (req, res) => {
    try {
        // التحقق من الاسم إذا كان يتم تحديثه لمنع التكرار
        if (req.body.name) {
            const existingCategory = await Category.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
            if (existingCategory) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'هذا الاسم مستخدم بالفعل في فئة أخرى!'
                });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                status: 'fail',
                message: 'الفئة غير موجودة لتعديلها'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '✨ تم تعديل الفئة بنجاح!',
            data: updatedCategory
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الفئة غير صحيح (Invalid ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 3️⃣ حذف فئة - DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                status: 'fail',
                message: 'الفئة غير موجودة لحذفها'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف الفئة بنجاح!'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الفئة غير صحيح (Invalid ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
