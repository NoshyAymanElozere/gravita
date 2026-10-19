const Product = require('../models/Product');
const Bundle = require('../models/Bundle');

const effectivePrice = (product) => product.discountPrice ?? product.price;

/**
 * يتحقق من وجود كل المنتجات (المفعلة) ويحسب أسعار الباقة.
 * - originalPrice = مجموع (السعر الأساسي للمنتج × الكمية)
 * - bundlePrice   = السعر المحدد يدوياً، أو originalPrice × (1 - discountPercentage / 100)
 * - discountPercentage يُعاد حسابه إذا تم تحديد bundlePrice يدوياً
 * - warning: إذا كان سعر الباقة أعلى من مجموع أسعار المنتجات بعد تخفيضاتها الحالية
 * يرجع { error } أو { items, originalPrice, bundlePrice, discountPercentage, warning? }
 */
const buildBundlePricing = async (items, discountPercentage, manualBundlePrice) => {
    const productIds = items.map(item => String(item.product));

    // منع تكرار نفس المنتج داخل الباقة
    if (new Set(productIds).size !== productIds.length) {
        return { error: 'لا يمكن تكرار نفس المنتج داخل الباقة (استخدم quantity بدلاً من ذلك)' };
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: { $ne: false } });
    if (products.length !== productIds.length) {
        const foundIds = products.map(p => p._id.toString());
        const missing = productIds.filter(id => !foundIds.includes(id));
        return { error: `بعض المنتجات غير موجودة أو غير مفعلة: ${missing.join(', ')}` };
    }

    const productById = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    const normalizedItems = items.map((item, index) => ({
        ...item,
        quantity: item.quantity || 1,
        order: item.order || index + 1
    }));

    const originalPrice = normalizedItems.reduce(
        (sum, item) => sum + productById[String(item.product)].price * item.quantity,
        0
    );
    const effectiveTotal = normalizedItems.reduce(
        (sum, item) => sum + effectivePrice(productById[String(item.product)]) * item.quantity,
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

    const result = {
        items: normalizedItems,
        originalPrice,
        bundlePrice,
        discountPercentage: finalDiscount
    };

    if (bundlePrice >= effectiveTotal) {
        result.warning = `تنبيه: سعر الباقة (${bundlePrice}) ليس أقل من مجموع أسعار المنتجات بعد التخفيض (${effectiveTotal})`;
    }

    return result;
};

/**
 * مزامنة الباقات بعد تعديل منتج:
 * - إعادة حساب أسعار كل باقة تحتوي على المنتج (عند تغير سعره)
 * - تعطيل الباقات التي أصبح أحد منتجاتها غير مفعل
 * يرجع ملخصاً بالباقات التي تم تحديثها أو تعطيلها
 */
const syncBundlesForProduct = async (productId) => {
    const bundles = await Bundle.find({ 'items.product': productId });
    const summary = { repriced: [], deactivated: [] };

    for (const bundle of bundles) {
        const pricing = await buildBundlePricing(bundle.items.map(i => i.toObject()), bundle.discountPercentage);

        if (pricing.error) {
            // أحد المنتجات لم يعد متاحاً => الباقة لا يمكن بيعها
            if (bundle.isActive) {
                bundle.isActive = false;
                await bundle.save();
                summary.deactivated.push(bundle.slug);
            }
            continue;
        }

        if (bundle.originalPrice !== pricing.originalPrice || bundle.bundlePrice !== pricing.bundlePrice) {
            bundle.originalPrice = pricing.originalPrice;
            bundle.bundlePrice = pricing.bundlePrice;
            await bundle.save();
            summary.repriced.push(bundle.slug);
        }
    }

    return summary;
};

module.exports = {
    effectivePrice,
    buildBundlePricing,
    syncBundlesForProduct
};
