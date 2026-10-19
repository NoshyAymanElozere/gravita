const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { idOrSlugFilter } = require('../utils/helpers');

// عدد المنتجات المفعلة في كل فئة
const countProductsByCategory = async () => {
    const counts = await Product.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    return Object.fromEntries(counts.map(c => [String(c._id), c.count]));
};

// 1️⃣ جلب كافة الفئات المفعلة مرتبة - GET /api/categories
router.get('/', asyncHandler(async (req, res) => {
    const { results, pagination } = await paginate(
        Category,
        { isActive: { $ne: false } },
        { limit: 50, ...req.query },
        '',
        '',
        { sortOrder: 1, nameEn: 1 }
    );
    const counts = await countProductsByCategory();

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results.map(category => ({ ...category.toJSON(), productCount: counts[String(category._id)] || 0 }))
    });
}));

// 2️⃣ جلب فئة واحدة بواسطة الـ ID أو الـ slug - GET /api/categories/:idOrSlug
router.get('/:idOrSlug', asyncHandler(async (req, res) => {
    const category = await Category.findOne({ ...idOrSlugFilter(req.params.idOrSlug), isActive: { $ne: false } });

    if (!category) {
        throw new AppError('الفئة غير موجودة', 404);
    }

    res.status(200).json({
        status: 'success',
        data: category
    });
}));

module.exports = router;
