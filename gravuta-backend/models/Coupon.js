const mongoose = require('mongoose');

// تعريف مخطط كوبون الخصم (Coupon Schema)
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'كود الخصم مطلوب (code is required)'],
        unique: true,
        trim: true,
        uppercase: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'نوع الخصم مطلوب (discountType is required)']
    },
    value: {
        type: Number,
        required: [true, 'قيمة الخصم مطلوبة (value is required)'],
        min: [0, 'قيمة الخصم لا يمكن أن تكون سالبة']
    },
    // الحد الأدنى لقيمة الطلب لتفعيل الكوبون
    minOrderAmount: { type: Number, default: 0, min: 0 },
    // سقف الخصم للكوبونات بالنسبة المئوية (اختياري)
    maxDiscount: { type: Number, default: null, min: 0 },
    expiresAt: { type: Date, default: null },
    // عدد مرات الاستخدام الكلي (null = غير محدود)
    usageLimit: { type: Number, default: null, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    // عدد مرات الاستخدام لكل مستخدم
    perUserLimit: { type: Number, default: 1, min: 1 },
    descriptionEn: { type: String, default: '', trim: true },
    descriptionAr: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

couponSchema.path('value').validate(function (value) {
    return this.discountType !== 'percentage' || value <= 100;
}, 'نسبة الخصم لا يمكن أن تتعدى 100%');

module.exports = mongoose.model('Coupon', couponSchema);
