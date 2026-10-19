const crypto = require('crypto');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { collectProductQuantities, releaseStock } = require('./inventory');

const RETURN_WINDOW_DAYS = Number(process.env.RETURN_WINDOW_DAYS ?? 14);
const ESTIMATED_DELIVERY_DAYS = Number(process.env.ESTIMATED_DELIVERY_DAYS ?? 3);

// رقم طلب قصير وفريد يظهر للعميل (e.g. AURA-482913)
const generateOrderNumber = async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = `AURA-${crypto.randomInt(100000, 1000000)}`;
        if (!(await Order.exists({ orderNumber: candidate }))) return candidate;
    }
    return `AURA-${Date.now().toString().slice(-8)}`;
};

const generateTrackingNumber = () => `TRK-${crypto.randomInt(10000000, 100000000)}`;

// تحويل أسطر العربة المحسوبة إلى أسطر طلب ثابتة (Snapshot)
const buildOrderLines = (pricedCart) => pricedCart.items.map((line) => {
    if (line.itemType === 'bundle') {
        const bundle = line.bundle;
        return {
            itemType: 'bundle',
            bundle: bundle._id,
            nameEn: bundle.nameEn,
            nameAr: bundle.nameAr,
            image: bundle.image,
            size: 'Complete Set',
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            bundleSnapshot: {
                originalPrice: bundle.originalPrice,
                discountPercentage: bundle.discountPercentage,
                items: bundle.items.map(bi => ({
                    product: bi.product._id,
                    nameEn: bi.product.nameEn,
                    nameAr: bi.product.nameAr,
                    quantity: bi.quantity,
                    stepEn: bi.stepEn,
                    stepAr: bi.stepAr
                }))
            }
        };
    }

    const product = line.product;
    return {
        itemType: 'product',
        product: product._id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        image: product.image,
        size: product.size,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal
    };
});

// إعادة استخدام الكوبون (عند إلغاء الطلب أو فشل إنشائه)
const releaseCoupon = async (code) => {
    if (!code) return;
    await Coupon.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
};

// حجز استخدام الكوبون بشرط عدم تجاوز الحد الأقصى
const consumeCoupon = async (couponId) => {
    const result = await Coupon.updateOne(
        {
            _id: couponId,
            isActive: true,
            $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }]
        },
        { $inc: { usedCount: 1 } }
    );
    return result.modifiedCount === 1;
};

// إلغاء الطلب: إعادة المخزون والكوبون (مرة واحدة فقط لكل طلب)
const cancelOrder = async (order, { reason = '', by } = {}) => {
    order.setStatus('cancelled', { note: reason, by });
    order.cancelReason = reason;
    if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
    }

    if (!order.stockRestored) {
        await releaseStock(collectProductQuantities(order.items));
        await releaseCoupon(order.coupon?.code);
        order.stockRestored = true;
    }

    await order.save();
    return order;
};

const canRequestReturn = (order) => {
    if (order.status !== 'delivered') return false;
    const deliveredAt = order.deliveredAt || order.updatedAt;
    return Date.now() - deliveredAt.getTime() <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

module.exports = {
    RETURN_WINDOW_DAYS,
    ESTIMATED_DELIVERY_DAYS,
    generateOrderNumber,
    generateTrackingNumber,
    buildOrderLines,
    consumeCoupon,
    releaseCoupon,
    cancelOrder,
    canRequestReturn
};
