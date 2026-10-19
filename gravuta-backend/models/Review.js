const mongoose = require('mongoose');

// تعريف مخطط التقييم (Review Schema)
const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'المنتج مطلوب للتقييم']
    },
    // المستخدم صاحب التقييم (قد يكون فارغاً للتقييمات المستوردة)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    authorName: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    rating: {
        type: Number,
        required: [true, 'التقييم مطلوب'],
        min: [1, 'التقييم يجب أن يكون من 1 إلى 5'],
        max: [5, 'التقييم يجب أن يكون من 1 إلى 5']
    },
    comment: { type: String, required: [true, 'نص التقييم مطلوب'], trim: true },
    // لغة التعليق الأصلية (لعرض commentEn/commentAr في الواجهة)
    lang: { type: String, enum: ['en', 'ar'], default: 'en' },
    // ترجمة اختيارية للتعليق باللغة الأخرى
    commentTranslation: { type: String, default: '', trim: true },
    photo: { type: String, default: '' },
    // مشتري موثق (اشترى المنتج واستلمه) - يُحدد في السيرفر فقط
    verified: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false }],
    isApproved: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// أسماء الحقول كما تستخدمها الواجهة (commentEn / commentAr)
reviewSchema.virtual('commentEn').get(function () {
    return this.lang === 'en' ? this.comment : (this.commentTranslation || this.comment);
});
reviewSchema.virtual('commentAr').get(function () {
    return this.lang === 'ar' ? this.comment : (this.commentTranslation || this.comment);
});

// مستخدم واحد = تقييم واحد لكل منتج
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

// إعادة حساب متوسط وعدد تقييمات المنتج
reviewSchema.statics.recalcProductRating = async function (productId) {
    const [stats] = await this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    await mongoose.model('Product').updateOne(
        { _id: productId },
        {
            ratingAvg: stats ? Math.round(stats.avg * 10) / 10 : 0,
            ratingCount: stats ? stats.count : 0
        }
    );
};

module.exports = mongoose.model('Review', reviewSchema);
