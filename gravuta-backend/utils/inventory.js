const Product = require('../models/Product');
const AppError = require('./AppError');

/**
 * تجميع الكميات المطلوبة لكل منتج من عناصر الطلب
 * (المنتجات المنفردة + مكونات الباقات × كمية الباقة)
 * items: [{ itemType, product, quantity, bundleSnapshot: { items: [{ product, quantity }] } }]
 */
const collectProductQuantities = (items) => {
    const quantities = new Map();
    const add = (productId, qty) => {
        const key = String(productId);
        quantities.set(key, (quantities.get(key) || 0) + qty);
    };

    for (const item of items) {
        if (item.itemType === 'bundle') {
            for (const component of item.bundleSnapshot?.items || []) {
                add(component.product, (component.quantity || 1) * item.quantity);
            }
        } else {
            add(item.product, item.quantity);
        }
    }
    return quantities;
};

// إرجاع كميات إلى المخزون (يُستخدم عند إلغاء الطلب أو فشل إنشائه)
const releaseStock = async (quantities) => {
    for (const [productId, qty] of quantities) {
        await Product.updateOne({ _id: productId }, { $inc: { stock: qty, soldCount: -qty } });
    }
};

/**
 * حجز المخزون بشكل آمن:
 * كل تحديث مشروط بأن المخزون يكفي (stock >= qty) فلا يمكن أن ينزل المخزون تحت الصفر حتى مع الطلبات المتزامنة.
 * إذا فشل أي منتج تتم إعادة ما تم حجزه بالفعل ويُرمى خطأ 409.
 */
const reserveStock = async (quantities) => {
    const reserved = new Map();

    for (const [productId, qty] of quantities) {
        const result = await Product.updateOne(
            { _id: productId, isActive: { $ne: false }, stock: { $gte: qty } },
            { $inc: { stock: -qty, soldCount: qty } }
        );

        if (result.modifiedCount !== 1) {
            await releaseStock(reserved);
            const product = await Product.findById(productId).select('nameEn nameAr stock');
            const name = product ? product.nameAr : productId;
            const available = product ? product.stock : 0;
            throw new AppError(
                `الكمية المطلوبة من "${name}" غير متوفرة (المتاح: ${available})`,
                409,
                [{ product: productId, requested: qty, available }]
            );
        }

        reserved.set(productId, qty);
    }

    return reserved;
};

module.exports = {
    collectProductQuantities,
    reserveStock,
    releaseStock
};
