const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { idOrSlugFilter, isObjectId } = require('../utils/helpers');
const { decorateBundle } = require('../utils/pricing');

const populateProducts = { path: 'items.product', populate: { path: 'category', select: 'slug nameEn nameAr' } };

// 1️⃣ جلب كافة الباقات المفعلة - GET /api/bundles
// كل باقة تحتوي على: available (هل كل منتجاتها متوفرة) و maxQuantity و effectiveOriginalPrice
router.get('/', asyncHandler(async (req, res) => {
    const { results, pagination } = await paginate(
        Bundle, { isActive: true }, req.query, populateProducts, '', { sortOrder: 1, createdAt: -1 }
    );
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results.map(decorateBundle)
    });
}));

// 2️⃣ جلب الباقات التي تحتوي على منتج معين - GET /api/bundles/by-product/:productId
// (لقسم "باقات تشمل هذا المنتج" في صفحة تفاصيل المنتج)
router.get('/by-product/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }

    const bundles = await Bundle.find({ isActive: true, 'items.product': productId })
        .sort({ sortOrder: 1 })
        .populate(populateProducts);

    res.status(200).json({
        status: 'success',
        count: bundles.length,
        data: bundles.map(decorateBundle)
    });
}));

// 3️⃣ جلب باقة واحدة بواسطة الـ ID أو الـ slug - GET /api/bundles/:idOrSlug
router.get('/:idOrSlug', asyncHandler(async (req, res) => {
    const bundle = await Bundle.findOne({ ...idOrSlugFilter(req.params.idOrSlug), isActive: true })
        .populate(populateProducts);

    if (!bundle) {
        throw new AppError('الباقة غير موجودة', 404);
    }

    res.status(200).json({
        status: 'success',
        data: decorateBundle(bundle)
    });
}));

module.exports = router;
