const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const validate = require('../middlewares/validate.middleware');
const { moderateReviewSchema } = require('../validations/review.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// ============ ⭐ التقييمات ============

// 1️⃣ جلب كل التقييمات - GET /api/admin/reviews?isApproved=false&product=<id>
router.get('/reviews', asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';
    if (req.query.product) filter.product = req.query.product;

    const { results, pagination } = await paginate(
        Review,
        filter,
        req.query,
        [{ path: 'product', select: 'slug nameEn nameAr' }, { path: 'user', select: 'name email' }],
        '',
        { createdAt: -1 }
    );

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ إظهار/إخفاء تقييم - PATCH /api/admin/reviews/:id { isApproved }
router.patch('/reviews/:id', validate(moderateReviewSchema), asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { returnDocument: 'after' });
    if (!review) {
        throw new AppError('التقييم غير موجود', 404);
    }
    await Review.recalcProductRating(review.product);

    res.status(200).json({
        status: 'success',
        message: review.isApproved ? '✅ تم إظهار التقييم' : '🙈 تم إخفاء التقييم',
        data: review
    });
}));

// 3️⃣ حذف تقييم - DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
        throw new AppError('التقييم غير موجود', 404);
    }
    await Review.recalcProductRating(review.product);

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف التقييم'
    });
}));

// ============ 💌 النشرة البريدية ============

// جلب المشتركين - GET /api/admin/newsletter?isActive=true
router.get('/newsletter', asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const { results, pagination } = await paginate(NewsletterSubscriber, filter, req.query, '', '', { createdAt: -1 });
    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// حذف مشترك - DELETE /api/admin/newsletter/:id
router.delete('/newsletter/:id', asyncHandler(async (req, res) => {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
        throw new AppError('المشترك غير موجود', 404);
    }
    res.status(200).json({
        status: 'success',
        message: '🗑️ تم حذف المشترك'
    });
}));

module.exports = router;
