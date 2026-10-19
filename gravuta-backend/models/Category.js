const mongoose = require('mongoose');
const { slugify } = require('../utils/helpers');

// تعريف مخطط الفئة (Category Schema) - ثنائي اللغة ويُعرف في الروابط بالـ slug
const categorySchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'الـ slug مطلوب (slug is required)'],
        unique: true,
        trim: true,
        lowercase: true
    },
    nameEn: {
        type: String,
        required: [true, 'اسم الفئة بالإنجليزية مطلوب (nameEn is required)'],
        trim: true
    },
    nameAr: {
        type: String,
        required: [true, 'اسم الفئة بالعربية مطلوب (nameAr is required)'],
        trim: true
    },
    descriptionEn: { type: String, default: '', trim: true },
    descriptionAr: { type: String, default: '', trim: true },
    image: {
        type: String,
        default: ''
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true, // يضيف تلقائياً وقت الإنشاء ووقت التعديل
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// حقول للتوافق مع الواجهات القديمة التي تستخدم name و description
categorySchema.virtual('name').get(function () { return this.nameEn; });
categorySchema.virtual('description').get(function () { return this.descriptionEn; });

// قيم افتراضية: الـ slug من الاسم الإنجليزي، والعربي = الإنجليزي إن لم يُرسل
categorySchema.pre('validate', function () {
    if (!this.nameAr && this.nameEn) this.nameAr = this.nameEn;
    if (!this.descriptionAr && this.descriptionEn) this.descriptionAr = this.descriptionEn;
    if (!this.slug && this.nameEn) this.slug = slugify(this.nameEn);
});

categorySchema.index({ isActive: 1, sortOrder: 1 });

// تصدير نموذج الفئة (Category Model)
module.exports = mongoose.model('Category', categorySchema);
