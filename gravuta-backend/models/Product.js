const mongoose = require('mongoose');
const { slugify } = require('../utils/helpers');

// تعريف مخطط المنتج (Product Schema) - مطابق لما تعرضه واجهة pharmaa
const productSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'الـ slug مطلوب (slug is required)'],
        unique: true,
        trim: true,
        lowercase: true
    },
    nameEn: {
        type: String,
        required: [true, 'اسم المنتج بالإنجليزية مطلوب (nameEn is required)'],
        trim: true
    },
    nameAr: {
        type: String,
        required: [true, 'اسم المنتج بالعربية مطلوب (nameAr is required)'],
        trim: true
    },
    subtitleEn: { type: String, default: '', trim: true },
    subtitleAr: { type: String, default: '', trim: true },
    descriptionEn: {
        type: String,
        required: [true, 'وصف المنتج بالإنجليزية مطلوب (descriptionEn is required)'],
        trim: true
    },
    descriptionAr: { type: String, default: '', trim: true },
    ingredientsEn: { type: String, default: '', trim: true },
    ingredientsAr: { type: String, default: '', trim: true },
    howToUseEn: { type: String, default: '', trim: true },
    howToUseAr: { type: String, default: '', trim: true },
    skinTypeEn: { type: String, default: '', trim: true },
    skinTypeAr: { type: String, default: '', trim: true },
    benefitsEn: { type: [String], default: [] },
    benefitsAr: { type: [String], default: [] },

    // السعر الأساسي (قبل التخفيض)
    price: {
        type: Number,
        required: [true, 'سعر المنتج مطلوب (price is required)'],
        min: [0, 'السعر لا يمكن أن يكون بالسالب']
    },
    // سعر التخفيض (اختياري) - يجب أن يكون أقل من السعر الأساسي
    discountPrice: {
        type: Number,
        min: [0, 'سعر التخفيض لا يمكن أن يكون بالسالب'],
        default: null
    },
    // السعر الفعلي للبيع = discountPrice أو price (يُحسب تلقائياً لاستخدامه في الفلترة والترتيب)
    finalPrice: { type: Number, default: 0 },

    size: { type: String, default: '', trim: true },
    image: {
        type: String,
        default: ''
    },
    galleryImages: { type: [String], default: [] },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'فئة المنتج مطلوبة (category is required)']
    },

    // المخزون
    stock: { type: Number, default: 0, min: [0, 'المخزون لا يمكن أن يكون بالسالب'] },
    lowStockThreshold: { type: Number, default: 5, min: 0 },

    // علامات العرض في الصفحة الرئيسية
    isBestSeller: { type: Boolean, default: false },
    // isNew اسم محجوز في Mongoose (يحدد هل المستند جديد) لذلك نخزنه باسم isNewArrival ونعرضه كـ isNew
    isNewArrival: { type: Boolean, default: false },

    // إحصائيات تُحدث تلقائياً من الطلبات والتقييمات
    soldCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // الحذف الناعم (Soft Delete) - المنتج غير المفعل لا يظهر في المتجر ولا يمكن شراؤه
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true, // يضيف تلقائياً وقت الإنشاء createdAt ووقت التعديل updatedAt
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.isNew = ret.isNewArrival;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// حالة المخزون بنفس القيم التي تستخدمها الواجهة
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === undefined) return undefined;
    if (this.stock <= 0) return 'out_of_stock';
    if (this.stock <= (this.lowStockThreshold ?? 5)) return 'low_stock';
    return 'in_stock';
});

// أسماء الحقول كما تستخدمها الواجهة (rating / reviewCount)
productSchema.virtual('rating').get(function () { return this.ratingAvg; });
productSchema.virtual('reviewCount').get(function () { return this.ratingCount; });

// حقول للتوافق مع الواجهات القديمة التي تستخدم name و description
productSchema.virtual('name').get(function () { return this.nameEn; });
productSchema.virtual('description').get(function () { return this.descriptionEn; });

productSchema.pre('validate', function () {
    if (!this.nameAr && this.nameEn) this.nameAr = this.nameEn;
    if (!this.descriptionAr && this.descriptionEn) this.descriptionAr = this.descriptionEn;
    if (!this.slug && this.nameEn) this.slug = slugify(this.nameEn);

    if (this.discountPrice !== null && this.discountPrice !== undefined && this.discountPrice >= this.price) {
        this.invalidate('discountPrice', 'سعر التخفيض يجب أن يكون أقل من السعر الأساسي');
    }

    this.finalPrice = this.discountPrice ?? this.price;
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });

// تصدير نموذج المنتج (Product Model)
module.exports = mongoose.model('Product', productSchema);
