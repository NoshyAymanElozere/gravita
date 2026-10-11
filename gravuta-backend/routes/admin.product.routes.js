const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const validate = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema } = require('../validations/product.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ إضافة منتج جديد مع دعم رفع الصور - POST /api/admin/products
router.post('/', upload.single('image'), (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
}, validate(createProductSchema), async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;

        // التحقق من وجود الفئة في قاعدة البيانات قبل حفظ المنتج
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                status: 'fail',
                message: 'الفئة المحددة غير موجودة في قاعدة البيانات!'
            });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            image
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({
            status: 'success',
            message: '🎉 تم إضافة المنتج بنجاح إلى قاعدة البيانات!',
            data: savedProduct
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الفئة غير صحيح (Invalid Category ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ تعديل بيانات منتج مع دعم تحديث الصورة - PUT /api/admin/products/:id
router.put('/:id', upload.single('image'), (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
}, validate(updateProductSchema), async (req, res) => {
    try {
        // التحقق من وجود الفئة في قاعدة البيانات إذا تم إرسالها للتحديث
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'الفئة المحددة غير موجودة في قاعدة البيانات!'
                });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category');

        if (!updatedProduct) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج غير موجود لتعديله'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '✨ تم تعديل المنتج بنجاح!',
            data: updatedProduct
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المنتج أو الفئة غير صحيح (Invalid ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 3️⃣ حذف منتج من قاعدة البيانات - DELETE /api/admin/products/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج غير موجود لحذفه'
            });
        }

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف المنتج بنجاح من قاعدة البيانات!'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المنتج غير صحيح (Invalid Product ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
