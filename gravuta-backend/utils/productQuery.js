const Category = require('../models/Category');
const { escapeRegex, isObjectId } = require('./helpers');

// ترتيب المنتجات (القيم المستخدمة في صفحة المتجر)
const SORTS = {
    'best-selling': { isBestSeller: -1, soldCount: -1, createdAt: -1 },
    'price-low-high': { finalPrice: 1, _id: 1 },
    'price-asc': { finalPrice: 1, _id: 1 },
    'price-high-low': { finalPrice: -1, _id: 1 },
    'price-desc': { finalPrice: -1, _id: 1 },
    newest: { createdAt: -1 },
    rating: { ratingAvg: -1, ratingCount: -1 }
};

const productSort = (sort) => SORTS[sort] || SORTS['best-selling'];

/**
 * بناء فلتر المنتجات من متغيرات الرابط
 * @param {Object} q - الاستعلام بعد التحقق (category, skinType, minPrice, maxPrice, q, bestSeller, isNew, inStock, isActive)
 * @param {Object} options - { admin: true } للسماح بعرض المنتجات غير المفعلة
 * يرجع null إذا كانت الفئة المطلوبة غير موجودة (النتيجة فارغة)
 */
const buildProductFilter = async (q = {}, { admin = false } = {}) => {
    const filter = {};

    if (!admin) {
        filter.isActive = { $ne: false };
    } else if (q.isActive !== undefined) {
        filter.isActive = q.isActive;
    }

    // الفئة بالـ slug أو بالمعرف
    if (q.category) {
        const category = await Category.findOne(
            isObjectId(q.category) ? { _id: q.category } : { slug: q.category.toLowerCase() }
        ).select('_id');
        if (!category) return null;
        filter.category = category._id;
    }

    // نوع البشرة (بحث جزئي في النص كما تفعل الواجهة حالياً)
    if (q.skinType && q.skinType !== 'all') {
        filter.skinTypeEn = { $regex: escapeRegex(q.skinType), $options: 'i' };
    }

    // نطاق السعر على السعر الفعلي بعد التخفيض
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
        filter.finalPrice = {};
        if (q.minPrice !== undefined) filter.finalPrice.$gte = q.minPrice;
        if (q.maxPrice !== undefined) filter.finalPrice.$lte = q.maxPrice;
    }

    // البحث بالاسم أو الوصف المختصر (بالعربية أو الإنجليزية)
    if (q.q) {
        const regex = { $regex: escapeRegex(q.q), $options: 'i' };
        filter.$or = [{ nameEn: regex }, { nameAr: regex }, { subtitleEn: regex }, { subtitleAr: regex }];
    }

    if (q.bestSeller !== undefined) filter.isBestSeller = q.bestSeller;
    if (q.isNew !== undefined) filter.isNewArrival = q.isNew;
    if (q.inStock === true) filter.stock = { $gt: 0 };
    if (q.inStock === false) filter.stock = { $lte: 0 };

    return filter;
};

module.exports = {
    productSort,
    buildProductFilter
};
