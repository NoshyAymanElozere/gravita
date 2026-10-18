const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const validate = require('../middlewares/validate.middleware');
const { createBundleSchema, updateBundleSchema } = require('../validations/bundle.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const { parseBundleFormFields, buildBundlePricing } = require('../utils/bundlePricing');

const populateProducts = { path: 'items.product', populate: { path: 'category' } };

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// وسيط تجهيز الصورة المرفوعة (إن وجدت)
const attachImage = (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
};

const handleError = (res, error) => {
    if (error.name === 'CastError') {
        return res.status(400).json({ status: 'fail', message: 'معرف غير صحيح (Invalid ID format)' });
    }
    if (error.code === 11000) {
        return res.status(400).json({ status: 'fail', message: 'الـ slug مستخدم بالفعل لباقة أخرى' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'بيانات الباقة غير صالحة',
            errors: Object.values(error.errors).map(e => e.message)
        });
    }
    res.status(500).json({ status: 'error', message: error.message });
};

// 1️⃣ جلب كل الباقات (بما فيها غير المفعلة) - GET /api/admin/bundles
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(Bundle, {}, req.query, populateProducts);
        res.status(200).json({
            status: 'success',
            count: results.length,
            pagination,
            data: results
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 2️⃣ إضافة باقة جديدة مع دعم رفع الصورة - POST /api/admin/bundles
router.post('/', upload.single('image'), attachImage, parseBundleFormFields, validate(createBundleSchema), async (req, res) => {
    try {
        const pricing = await buildBundlePricing(req.body.items, req.body.discountPercentage, req.body.bundlePrice);
        if (pricing.error) {
            return res.status(400).json({ status: 'fail', message: pricing.error });
        }

        const newBundle = new Bundle({
            ...req.body,
            items: pricing.items,
            originalPrice: pricing.originalPrice,
            bundlePrice: pricing.bundlePrice,
            discountPercentage: pricing.discountPercentage
        });

        const savedBundle = await newBundle.save();
        await savedBundle.populate(populateProducts);

        res.status(201).json({
            status: 'success',
            message: '🎉 تم إضافة الباقة بنجاح!',
            data: savedBundle
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 3️⃣ تعديل باقة - PUT /api/admin/bundles/:id
router.put('/:id', upload.single('image'), attachImage, parseBundleFormFields, validate(updateBundleSchema), async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id);
        if (!bundle) {
            return res.status(404).json({ status: 'fail', message: 'الباقة غير موجودة لتعديلها' });
        }

        const { items, discountPercentage, bundlePrice, ...otherFields } = req.body;
        Object.assign(bundle, otherFields);

        // إعادة حساب الأسعار إذا تغيرت المنتجات أو الخصم أو السعر
        if (items || discountPercentage !== undefined || bundlePrice !== undefined) {
            const itemsToPrice = items || bundle.items.map(i => i.toObject());
            const discountToUse = discountPercentage !== undefined ? discountPercentage : bundle.discountPercentage;

            const pricing = await buildBundlePricing(itemsToPrice, discountToUse, bundlePrice);
            if (pricing.error) {
                return res.status(400).json({ status: 'fail', message: pricing.error });
            }

            bundle.items = pricing.items;
            bundle.originalPrice = pricing.originalPrice;
            bundle.bundlePrice = pricing.bundlePrice;
            bundle.discountPercentage = pricing.discountPercentage;
        }

        const savedBundle = await bundle.save();
        await savedBundle.populate(populateProducts);

        res.status(200).json({
            status: 'success',
            message: '✨ تم تعديل الباقة بنجاح!',
            data: savedBundle
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 4️⃣ إعادة حساب سعر الباقة بعد تغيير أسعار المنتجات - PATCH /api/admin/bundles/:id/recalculate
router.patch('/:id/recalculate', async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id);
        if (!bundle) {
            return res.status(404).json({ status: 'fail', message: 'الباقة غير موجودة' });
        }

        const pricing = await buildBundlePricing(bundle.items.map(i => i.toObject()), bundle.discountPercentage);
        if (pricing.error) {
            return res.status(400).json({ status: 'fail', message: pricing.error });
        }

        bundle.originalPrice = pricing.originalPrice;
        bundle.bundlePrice = pricing.bundlePrice;
        await bundle.save();

        res.status(200).json({
            status: 'success',
            message: '🔄 تم إعادة حساب أسعار الباقة',
            data: bundle
        });
    } catch (error) {
        handleError(res, error);
    }
});

// 5️⃣ حذف باقة - DELETE /api/admin/bundles/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedBundle = await Bundle.findByIdAndDelete(req.params.id);
        if (!deletedBundle) {
            return res.status(404).json({ status: 'fail', message: 'الباقة غير موجودة لحذفها' });
        }

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف الباقة بنجاح!'
        });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
