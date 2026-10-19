const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/helpers');

// 1️⃣ أفضل التقييمات لقسم آراء العملاء في الصفحة الرئيسية - GET /api/reviews/featured?limit=6
router.get('/featured', asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 20);

    const reviews = await Review.find({ isApproved: true, rating: { $gte: 4 } })
        .sort({ helpfulCount: -1, rating: -1, createdAt: -1 })
        .limit(limit)
        .populate({ path: 'product', select: 'slug nameEn nameAr image' });

    res.status(200).json({
        status: 'success',
        count: reviews.length,
        data: reviews
    });
}));

// 2️⃣ تعليم التقييم كمفيد (مرة واحدة لكل مستخدم، والضغط مرة أخرى يلغيها) - POST /api/reviews/:id/helpful
router.post('/:id/helpful', protect, asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) {
        throw new AppError('معرف التقييم غير صحيح', 400);
    }

    const review = await Review.findById(req.params.id).select('+helpfulBy');
    if (!review || !review.isApproved) {
        throw new AppError('التقييم غير موجود', 404);
    }

    const alreadyMarked = review.helpfulBy.some(id => id.equals(req.user._id));
    if (alreadyMarked) {
        review.helpfulBy.pull(req.user._id);
    } else {
        review.helpfulBy.push(req.user._id);
    }
    review.helpfulCount = review.helpfulBy.length;
    await review.save();

    res.status(200).json({
        status: 'success',
        data: { helpfulCount: review.helpfulCount, markedHelpful: !alreadyMarked }
    });
}));

module.exports = router;
