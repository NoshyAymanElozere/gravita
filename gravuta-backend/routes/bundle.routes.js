const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const paginate = require('../utils/paginate');

const populateProducts = { path: 'items.product', populate: { path: 'category' } };

// 1️⃣ جلب كافة الباقات المفعلة - GET /api/bundles
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(Bundle, { isActive: true }, req.query, populateProducts);
        res.status(200).json({
            status: 'success',
            count: results.length,
            pagination,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ جلب الباقات التي تحتوي على منتج معين - GET /api/bundles/by-product/:productId
// (لقسم "باقات تشمل هذا المنتج" في صفحة تفاصيل المنتج)
router.get('/by-product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المنتج غير صحيح (Invalid Product ID format)'
            });
        }

        const bundles = await Bundle.find({ isActive: true, 'items.product': productId })
            .populate(populateProducts);

        res.status(200).json({
            status: 'success',
            count: bundles.length,
            data: bundles
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 3️⃣ جلب باقة واحدة بواسطة الـ ID أو الـ slug - GET /api/bundles/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const filter = mongoose.Types.ObjectId.isValid(idOrSlug)
            ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] }
            : { slug: idOrSlug.toLowerCase() };

        const bundle = await Bundle.findOne({ ...filter, isActive: true }).populate(populateProducts);

        if (!bundle) {
            return res.status(404).json({
                status: 'fail',
                message: 'الباقة غير موجودة'
            });
        }

        res.status(200).json({
            status: 'success',
            data: bundle
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
