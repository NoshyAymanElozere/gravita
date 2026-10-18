const mongoose = require('mongoose');

// عنصر داخل الباقة يربط منتج + بيانات خطوة الروتين (Pivot between Bundle and Product)
const bundleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'المنتج مطلوب داخل الباقة (product is required)']
    },
    stepEn: {
        type: String,
        required: [true, 'اسم الخطوة بالإنجليزية مطلوب (stepEn is required)'],
        trim: true
    },
    stepAr: {
        type: String,
        required: [true, 'اسم الخطوة بالعربية مطلوب (stepAr is required)'],
        trim: true
    },
    benefitEn: {
        type: String,
        required: [true, 'فائدة المنتج بالإنجليزية مطلوبة (benefitEn is required)'],
        trim: true
    },
    benefitAr: {
        type: String,
        required: [true, 'فائدة المنتج بالعربية مطلوبة (benefitAr is required)'],
        trim: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'كمية المنتج داخل الباقة يجب أن تكون 1 على الأقل']
    },
    order: {
        type: Number,
        default: 1
    }
}, { _id: false });

// تعريف مخطط الباقة (Bundle Schema)
const bundleSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'الـ slug مطلوب (slug is required)'],
        unique: true,
        trim: true,
        lowercase: true
    },
    nameEn: { type: String, required: [true, 'nameEn is required'], trim: true },
    nameAr: { type: String, required: [true, 'nameAr is required'], trim: true },
    subtitleEn: { type: String, default: '', trim: true },
    subtitleAr: { type: String, default: '', trim: true },
    descriptionEn: { type: String, required: [true, 'descriptionEn is required'], trim: true },
    descriptionAr: { type: String, required: [true, 'descriptionAr is required'], trim: true },
    image: { type: String, default: '' },
    items: {
        type: [bundleItemSchema],
        validate: {
            validator: (items) => Array.isArray(items) && items.length >= 2,
            message: 'الباقة يجب أن تحتوي على منتجين على الأقل (Bundle must contain at least 2 products)'
        }
    },
    discountPercentage: {
        type: Number,
        required: [true, 'نسبة الخصم مطلوبة (discountPercentage is required)'],
        min: [0, 'نسبة الخصم لا يمكن أن تكون سالبة'],
        max: [99, 'نسبة الخصم لا يمكن أن تتعدى 99%']
    },
    // مجموع أسعار المنتجات منفردة - يُحسب تلقائياً في السيرفر
    originalPrice: {
        type: Number,
        required: true,
        min: [0, 'السعر الأصلي لا يمكن أن يكون سالباً']
    },
    // سعر الباقة بعد الخصم - يُحسب تلقائياً أو يُحدد يدوياً
    bundlePrice: {
        type: Number,
        required: true,
        min: [0, 'سعر الباقة لا يمكن أن يكون سالباً']
    },
    benefitsEn: { type: [String], default: [] },
    benefitsAr: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// قيمة التوفير (savings) = السعر الأصلي - سعر الباقة
bundleSchema.virtual('savings').get(function () {
    return (this.originalPrice || 0) - (this.bundlePrice || 0);
});

// فهرس للبحث العكسي: ما هي الباقات التي تحتوي على منتج معين؟
bundleSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Bundle', bundleSchema);
