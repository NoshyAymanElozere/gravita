const Product = require('../models/Product');

/**
 * عند استخدام multipart/form-data (لرفع الصورة) تصل المصفوفات كنصوص JSON.
 * هذه الدالة تحولها لمصفوفات حقيقية قبل التحقق بـ Joi.
 */
const parseBundleFormFields = (req, res, next) => {
    const jsonFields = ['items', 'benefitsEn', 'benefitsAr'];
    try {
        for (const field of jsonFields) {
            if (typeof req.body[field] === 'string') {
                req.body[field] = JSON.parse(req.body[field]);
            }
        }
        next();
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: 'صيغة JSON غير صحيحة في الحقول (items / benefitsEn / benefitsAr)'
        });
    }
};

/**
 * يتحقق من وجود كل المنتجات ويحسب أسعار الباقة.
 * - originalPrice = مجموع (سعر المنتج × الكمية)
 * - bundlePrice   = السعر المحدد يدوياً، أو originalPrice × (1 - discountPercentage / 100)
 * - discountPercentage يُعاد حسابه إذا تم تحديد bundlePrice يدوياً
 * يرجع { error } أو { items, originalPrice, bundlePrice, discountPercentage }
 */
const buildBundlePricing = async (items, discountPercentage, manualBundlePrice) => {
    const productIds = items.map(item => String(item.product));

    // منع تكرار نفس المنتج داخل الباقة
    if (new Set(productIds).size !== productIds.length) {
        return { error: 'لا يمكن تكرار نفس المنتج داخل الباقة (استخدم quantity بدلاً من ذلك)' };
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
        const foundIds = products.map(p => p._id.toString());
        const missing = productIds.filter(id => !foundIds.includes(id));
        return { error: `بعض المنتجات غير موجودة في قاعدة البيانات: ${missing.join(', ')}` };
    }

    const priceById = Object.fromEntries(products.map(p => [p._id.toString(), p.price]));

    const normalizedItems = items.map((item, index) => ({
        ...item,
        quantity: item.quantity || 1,
        order: item.order || index + 1
    }));

    const originalPrice = normalizedItems.reduce(
        (sum, item) => sum + priceById[String(item.product)] * item.quantity,
        0
    );

    let bundlePrice;
    let finalDiscount = Number(discountPercentage) || 0;

    if (manualBundlePrice !== undefined && manualBundlePrice !== null && manualBundlePrice !== '') {
        bundlePrice = Number(manualBundlePrice);
        if (bundlePrice > originalPrice) {
            return { error: `سعر الباقة (${bundlePrice}) لا يمكن أن يكون أكبر من مجموع أسعار المنتجات (${originalPrice})` };
        }
        finalDiscount = originalPrice > 0 ? Math.round((1 - bundlePrice / originalPrice) * 100) : 0;
    } else {
        bundlePrice = Math.round(originalPrice * (1 - finalDiscount / 100));
    }

    return {
        items: normalizedItems,
        originalPrice,
        bundlePrice,
        discountPercentage: finalDiscount
    };
};

module.exports = {
    parseBundleFormFields,
    buildBundlePricing
};
