const mongoose = require('mongoose');

// شرائح البانر الرئيسي (Hero banner slides) التي تظهر في أعلى الصفحة الرئيسية للمتجر
const bannerSchema = new mongoose.Schema({
    titleEn: { type: String, default: '', trim: true },
    titleAr: { type: String, default: '', trim: true },
    image: {
        type: String,
        required: [true, 'صورة البانر مطلوبة (image is required)'],
        trim: true
    },
    link: { type: String, default: '', trim: true }, // رابط اختياري عند الضغط على الشريحة
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bannerSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
