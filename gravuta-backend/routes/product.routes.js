const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const validate = require('../middlewares/validate.middleware');
const { productQuerySchema } = require('../validations/product.validation');
const { createReviewSchema } = require('../validations/review.validation');
const { protect } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { idOrSlugFilter, isObjectId } = require('../utils/helpers');
const { productSort, buildProductFilter } = require('../utils/productQuery');

const categoryPopulate = { path: 'category', select: 'slug nameEn nameAr' };

const emptyPage = (limit = 10) => ({
    currentPage: 1, totalPages: 1, totalItems: 0, limit, hasNextPage: false, hasPrevPage: false
});

// جلب منتج مفعل بالمعرف أو الـ slug أو رمي خطأ 404
const findActiveProduct = async (idOrSlug) => {
    const product = await Product.findOne({ ...idOrSlugFilter(idOrSlug), isActive: { $ne: false } });
    if (!product) {
        throw new AppError('المنتج غير موجود', 404);
    }
    return product;
};

// 1️⃣ جلب المنتجات مع الفلترة والبحث والترتيب - GET /api/products
// ?category=serums&skinType=dry&minPrice=0&maxPrice=500&q=serum&bestSeller=true&isNew=true&inStock=true&sort=price-low-high&page=1&limit=12
router.get('/', validate(productQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const query = req.validatedQuery;
    const filter = await buildProductFilter(query);

    if (!filter) {
        return res.status(200).json({ status: 'success', count: 0, pagination: emptyPage(query.limit), data: [] });
    }

    const { results, pagination } = await paginate(
        Product, filter, req.query, categoryPopulate, '', productSort(query.sort)
    );

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ جلب منتج واحد بواسطة الـ ID أو الـ slug - GET /api/products/:idOrSlug
router.get('/:idOrSlug', asyncHandler(async (req, res) => {
    const product = await findActiveProduct(req.params.idOrSlug);
    await product.populate(categoryPopulate);

    res.status(200).json({
        status: 'success',
        data: product
    });
}));

// 3️⃣ منتجات مشابهة من نفس الفئة - GET /api/products/:idOrSlug/related?limit=4
router.get('/:idOrSlug/related', asyncHandler(async (req, res) => {
    const product = await findActiveProduct(req.params.idOrSlug);
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 20);

    const related = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: { $ne: false }
    })
        .sort({ isBestSeller: -1, soldCount: -1 })
        .limit(limit)
        .populate(categoryPopulate);

    res.status(200).json({
        status: 'success',
        count: related.length,
        data: related
    });
}));

// 4️⃣ تقييمات المنتج - GET /api/products/:idOrSlug/reviews?page=1&limit=10
router.get('/:idOrSlug/reviews', asyncHandler(async (req, res) => {
    const product = await findActiveProduct(req.params.idOrSlug);

    const { results, pagination } = await paginate(
        Review,
        { product: product._id, isApproved: true },
        req.query,
        '',
        '',
        { createdAt: -1 }
    );

    // توزيع التقييمات (عدد تقييمات كل نجمة)
    const distribution = await Review.aggregate([
        { $match: { product: product._id, isApproved: true } },
        { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        summary: {
            ratingAvg: product.ratingAvg,
            ratingCount: product.ratingCount,
            distribution: Object.fromEntries([5, 4, 3, 2, 1].map(star => [
                star, distribution.find(d => d._id === star)?.count || 0
            ]))
        },
        data: results
    });
}));

// 5️⃣ إضافة أو تعديل تقييمي للمنتج - POST /api/products/:id/reviews
router.post('/:id/reviews', protect, validate(createReviewSchema), asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }
    const product = await findActiveProduct(req.params.id);

    // مشتري موثق: لديه طلب تم توصيله يحتوي على المنتج (منفرداً أو داخل باقة)
    const verified = Boolean(await Order.exists({
        user: req.user._id,
        status: 'delivered',
        $or: [
            { 'items.product': product._id },
            { 'items.bundleSnapshot.items.product': product._id }
        ]
    }));

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    const review = existing || new Review({ product: product._id, user: req.user._id });
    review.set({ ...req.body, authorName: req.user.name, verified });
    await review.save();
    await Review.recalcProductRating(product._id);

    res.status(existing ? 200 : 201).json({
        status: 'success',
        message: existing ? '✨ تم تعديل تقييمك بنجاح!' : '⭐ شكراً لك! تم إضافة تقييمك',
        data: review
    });
}));

// 6️⃣ حذف تقييمي للمنتج - DELETE /api/products/:id/reviews
router.delete('/:id/reviews', protect, asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }
    const review = await Review.findOneAndDelete({ product: req.params.id, user: req.user._id });
    if (!review) {
        throw new AppError('لا يوجد لديك تقييم لهذا المنتج', 404);
    }
    await Review.recalcProductRating(req.params.id);

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف تقييمك'
    });
}));

module.exports = router;
