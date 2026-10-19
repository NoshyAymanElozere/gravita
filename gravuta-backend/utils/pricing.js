const Order = require('../models/Order');
const { effectivePrice } = require('./bundlePricing');

// قواعد الشحن (نفس القواعد المستخدمة حالياً في واجهة pharmaa) - يمكن تعديلها من ملف .env
const SHIPPING_RULES = {
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD ?? 200),
    shippingFee: Number(process.env.SHIPPING_FEE ?? 25),
    codFee: Number(process.env.COD_FEE ?? 15)
};

// الحقول المطلوبة من المنتج داخل العربة والباقات (للعرض وحساب السعر والتوفر)
const PRODUCT_CART_FIELDS = 'slug nameEn nameAr price discountPrice finalPrice size image stock lowStockThreshold isActive category';

const cartPopulate = [
    { path: 'items.product', select: PRODUCT_CART_FIELDS },
    { path: 'items.bundle', populate: { path: 'items.product', select: PRODUCT_CART_FIELDS } },
    { path: 'coupon' }
];

const isProductSellable = (product) => Boolean(product) && product.isActive !== false;

// أقصى كمية يمكن شراؤها من الباقة = أقل ناتج (مخزون المنتج ÷ الكمية داخل الباقة)
const bundleMaxQuantity = (bundle) => {
    if (!bundle || !bundle.isActive || !bundle.items?.length) return 0;
    let max = Infinity;
    for (const item of bundle.items) {
        if (!isProductSellable(item.product)) return 0;
        max = Math.min(max, Math.floor((item.product.stock ?? 0) / (item.quantity || 1)));
    }
    return Number.isFinite(max) ? max : 0;
};

// إضافة حقول محسوبة للباقة: التوفر، أقصى كمية، ومجموع الأسعار بعد التخفيضات الحالية
const decorateBundle = (bundle) => {
    const obj = typeof bundle.toJSON === 'function' ? bundle.toJSON() : { ...bundle };
    const maxQuantity = bundleMaxQuantity(bundle);
    obj.available = maxQuantity > 0;
    obj.maxQuantity = maxQuantity;
    obj.effectiveOriginalPrice = (bundle.items || []).reduce(
        (sum, item) => sum + (item.product ? effectivePrice(item.product) * (item.quantity || 1) : 0),
        0
    );
    return obj;
};

// حساب قيمة الخصم من الكوبون
const computeCouponDiscount = (coupon, subtotal) => {
    let discount = coupon.discountType === 'percentage'
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;
    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    return Math.min(discount, subtotal);
};

/**
 * التحقق من صلاحية الكوبون للمستخدم وقيمة الطلب
 * يرجع { valid: true, discount } أو { valid: false, message }
 */
const evaluateCoupon = async (coupon, subtotal, userId) => {
    if (!coupon || !coupon.isActive) {
        return { valid: false, message: 'كود الخصم غير صالح (Invalid promotion code)' };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false, message: 'انتهت صلاحية كود الخصم (Coupon expired)' };
    }
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: 'تم استنفاد عدد مرات استخدام هذا الكوبون' };
    }
    if (subtotal < coupon.minOrderAmount) {
        return {
            valid: false,
            message: `الحد الأدنى لتفعيل هذا الكوبون هو ${coupon.minOrderAmount} (Minimum order amount is ${coupon.minOrderAmount})`
        };
    }
    if (userId) {
        const usedByUser = await Order.countDocuments({
            user: userId,
            'coupon.code': coupon.code,
            status: { $ne: 'cancelled' }
        });
        if (usedByUser >= coupon.perUserLimit) {
            return { valid: false, message: 'لقد استخدمت هذا الكوبون من قبل (Coupon already used)' };
        }
    }
    return { valid: true, discount: computeCouponDiscount(coupon, subtotal) };
};

/**
 * المصدر الوحيد لحساب أسعار العربة (تستخدمه العربة والطلبات)
 * @param {Document} cart - عربة بعد عمل populate(cartPopulate)
 * @param {Object} options - { paymentMethod, userId }
 */
const priceCart = async (cart, { paymentMethod, userId } = {}) => {
    const lines = [];

    for (const item of cart.items) {
        if (item.itemType === 'bundle') {
            const bundle = item.bundle;
            const maxQuantity = bundleMaxQuantity(bundle);
            const unitPrice = bundle ? bundle.bundlePrice : 0;
            lines.push({
                itemType: 'bundle',
                bundle: bundle ? decorateBundle(bundle) : null,
                quantity: item.quantity,
                unitPrice,
                lineTotal: unitPrice * item.quantity,
                maxQuantity,
                available: maxQuantity >= item.quantity
            });
            continue;
        }

        const product = item.product;
        const sellable = isProductSellable(product);
        const maxQuantity = sellable ? product.stock ?? 0 : 0;
        const unitPrice = product ? effectivePrice(product) : 0;
        lines.push({
            itemType: 'product',
            product: product ? product.toJSON() : null,
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
            maxQuantity,
            available: sellable && maxQuantity >= item.quantity
        });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

    let discount = 0;
    let couponInfo = null;
    if (cart.coupon) {
        const result = await evaluateCoupon(cart.coupon, subtotal, userId);
        couponInfo = {
            code: cart.coupon.code,
            discountType: cart.coupon.discountType,
            value: cart.coupon.value,
            valid: result.valid,
            message: result.valid ? null : result.message
        };
        if (result.valid) discount = result.discount;
    }

    const afterDiscount = subtotal - discount;
    const shippingFee = subtotal === 0 || afterDiscount > SHIPPING_RULES.freeShippingThreshold ? 0 : SHIPPING_RULES.shippingFee;
    const codFee = subtotal > 0 && paymentMethod === 'cod' ? SHIPPING_RULES.codFee : 0;

    return {
        _id: cart._id,
        user: cart.user,
        items: lines,
        itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
        coupon: couponInfo,
        subtotal,
        discount,
        shippingFee,
        codFee,
        total: afterDiscount + shippingFee + codFee,
        allAvailable: lines.every(line => line.available),
        freeShippingThreshold: SHIPPING_RULES.freeShippingThreshold,
        updatedAt: cart.updatedAt
    };
};

module.exports = {
    SHIPPING_RULES,
    PRODUCT_CART_FIELDS,
    cartPopulate,
    bundleMaxQuantity,
    decorateBundle,
    computeCouponDiscount,
    evaluateCoupon,
    priceCart
};
