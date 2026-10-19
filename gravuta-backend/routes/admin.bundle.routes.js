const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const validate = require('../middlewares/validate.middleware');
const { createBundleSchema, updateBundleSchema } = require('../validations/bundle.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { parseJsonFields, attachUploadedImages } = require('../utils/helpers');
const { buildBundlePricing } = require('../utils/bundlePricing');
const { decorateBundle } = require('../utils/pricing');

const populateProducts = { path: 'items.product', populate: { path: 'category', select: 'slug nameEn nameAr' } };
const parseBundleFormFields = parseJsonFields('items', 'benefitsEn', 'benefitsAr');

const findBundle = async (id) => {
    const bundle = await Bundle.findById(id);
    if (!bundle) {
        throw new AppError('الباقة غير موجودة', 404);
    }
    return bundle;
};

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب كل الباقات (بما فيها غير المفعلة) - GET /api/admin/bundles
router.get('/', asyncHandler(async (req, res) => {
    const { results, pagination } = await paginate(Bundle, {}, req.query, populateProducts, '', { sortOrder: 1, createdAt: -1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results.map(decorateBundle)
    });
}));

// 2️⃣ جلب باقة واحدة - GET /api/admin/bundles/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const bundle = await findBundle(req.params.id);
    await bundle.populate(populateProducts);
    res.status(200).json({
        status: 'success',
        data: decorateBundle(bundle)
    });
}));

// 3️⃣ إضافة باقة جديدة مع دعم رفع الصورة - POST /api/admin/bundles
router.post('/', upload.single('image'), attachUploadedImages, parseBundleFormFields, validate(createBundleSchema), asyncHandler(async (req, res) => {
    const pricing = await buildBundlePricing(req.body.items, req.body.discountPercentage, req.body.bundlePrice);
    if (pricing.error) {
        throw new AppError(pricing.error, 400);
    }

    const savedBundle = await Bundle.create({
        ...req.body,
        items: pricing.items,
        originalPrice: pricing.originalPrice,
        bundlePrice: pricing.bundlePrice,
        discountPercentage: pricing.discountPercentage
    });
    await savedBundle.populate(populateProducts);

    res.status(201).json({
        status: 'success',
        message: '🎉 تم إضافة الباقة بنجاح!',
        ...(pricing.warning && { warning: pricing.warning }),
        data: decorateBundle(savedBundle)
    });
}));

// 4️⃣ تعديل باقة - PUT /api/admin/bundles/:id
router.put('/:id', upload.single('image'), attachUploadedImages, parseBundleFormFields, validate(updateBundleSchema), asyncHandler(async (req, res) => {
    const bundle = await findBundle(req.params.id);

    const { items, discountPercentage, bundlePrice, ...otherFields } = req.body;
    bundle.set(otherFields);

    // إعادة حساب الأسعار إذا تغيرت المنتجات أو الخصم أو السعر
    let warning;
    if (items || discountPercentage !== undefined || bundlePrice !== undefined) {
        const itemsToPrice = items || bundle.items.map(i => i.toObject());
        const discountToUse = discountPercentage !== undefined ? discountPercentage : bundle.discountPercentage;

        const pricing = await buildBundlePricing(itemsToPrice, discountToUse, bundlePrice);
        if (pricing.error) {
            throw new AppError(pricing.error, 400);
        }

        bundle.items = pricing.items;
        bundle.originalPrice = pricing.originalPrice;
        bundle.bundlePrice = pricing.bundlePrice;
        bundle.discountPercentage = pricing.discountPercentage;
        warning = pricing.warning;
    }

    const savedBundle = await bundle.save();
    await savedBundle.populate(populateProducts);

    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل الباقة بنجاح!',
        ...(warning && { warning }),
        data: decorateBundle(savedBundle)
    });
}));

// 5️⃣ إعادة حساب سعر الباقة بعد تغيير أسعار المنتجات - PATCH /api/admin/bundles/:id/recalculate
router.patch('/:id/recalculate', asyncHandler(async (req, res) => {
    const bundle = await findBundle(req.params.id);

    const pricing = await buildBundlePricing(bundle.items.map(i => i.toObject()), bundle.discountPercentage);
    if (pricing.error) {
        throw new AppError(pricing.error, 400);
    }

    bundle.originalPrice = pricing.originalPrice;
    bundle.bundlePrice = pricing.bundlePrice;
    await bundle.save();

    res.status(200).json({
        status: 'success',
        message: '🔄 تم إعادة حساب أسعار الباقة',
        ...(pricing.warning && { warning: pricing.warning }),
        data: bundle
    });
}));

// 6️⃣ حذف باقة - DELETE /api/admin/bundles/:id
// الطلبات السابقة لا تتأثر لأنها تحتفظ بنسخة من بيانات الباقة (bundleSnapshot)
router.delete('/:id', asyncHandler(async (req, res) => {
    const deletedBundle = await Bundle.findByIdAndDelete(req.params.id);
    if (!deletedBundle) {
        throw new AppError('الباقة غير موجودة لحذفها', 404);
    }

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف الباقة بنجاح!'
    });
}));

module.exports = router;
