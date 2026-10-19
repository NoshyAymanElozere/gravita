const mongoose = require('mongoose');
const { orderAddressSchema } = require('./schemas/address.schema');

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];
const PAYMENT_METHODS = ['cod', 'credit_card', 'apple_pay', 'google_pay'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// الانتقالات المسموحة بين حالات الطلب (للأدمن)
const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'processing', 'shipped', 'cancelled'],
    confirmed: ['processing', 'shipped', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['returned'],
    return_requested: ['returned', 'delivered'],
    cancelled: [],
    returned: []
};

// نسخة ثابتة من منتجات الباقة وقت الشراء (لأن الباقة قد تتغير أو تُحذف لاحقاً)
const bundleSnapshotItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nameEn: String,
    nameAr: String,
    quantity: Number,
    stepEn: String,
    stepAr: String
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['product', 'bundle'],
        default: 'product'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [function () { return this.itemType !== 'bundle'; }, 'المنتج مطلوب في الطلب']
    },
    bundle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle',
        required: [function () { return this.itemType === 'bundle'; }, 'الباقة مطلوبة في الطلب']
    },
    // بيانات العرض وقت الشراء (تبقى صحيحة حتى لو تغير المنتج أو حُذف)
    nameEn: String,
    nameAr: String,
    image: String,
    size: String,
    // بيانات الباقة وقت الشراء (فقط لعناصر الباقات)
    bundleSnapshot: {
        originalPrice: Number,
        discountPercentage: Number,
        items: [bundleSnapshotItemSchema]
    },
    quantity: {
        type: Number,
        required: [true, 'الكمية مطلوبة'],
        min: 1
    },
    // السعر وقت الشراء لأن الأسعار تتغير لاحقاً
    unitPrice: {
        type: Number,
        required: [true, 'السعر وقت الشراء مطلوب']
    },
    lineTotal: {
        type: Number,
        required: true
    }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    // رقم الطلب الظاهر للعميل (e.g. AURA-482913)
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المستخدم مطلوب للطلب']
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: 'الطلب يجب أن يحتوي على عنصر واحد على الأقل'
        }
    },
    contact: {
        name: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true }
    },
    shippingAddress: {
        type: orderAddressSchema,
        required: [true, 'عنوان الشحن مطلوب']
    },
    notes: { type: String, default: '', trim: true },

    paymentMethod: {
        type: String,
        enum: PAYMENT_METHODS,
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: 'pending'
    },
    // رقم العملية لدى بوابة الدفع (لا نخزن بيانات البطاقة أبداً)
    paymentRef: { type: String, default: '' },

    coupon: {
        code: String,
        discountType: { type: String, enum: ['percentage', 'fixed'] },
        value: Number
    },

    // تفاصيل الحساب
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    codFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
        type: String,
        enum: ORDER_STATUSES,
        default: 'pending'
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    trackingNumber: { type: String, default: '' },
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelReason: { type: String, default: '' },
    returnReason: { type: String, default: '' },
    // هل تمت إعادة المخزون لهذا الطلب؟ (لمنع إعادته مرتين)
    stockRestored: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// للتوافق مع الواجهات القديمة التي تستخدم totalPrice
orderSchema.virtual('totalPrice').get(function () { return this.total; });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// تغيير الحالة مع تسجيلها في سجل الحالات
orderSchema.methods.setStatus = function (status, { note = '', by } = {}) {
    this.status = status;
    this.statusHistory.push({ status, note, by, at: new Date() });
    if (status === 'delivered') {
        this.deliveredAt = new Date();
        if (this.paymentMethod === 'cod') this.paymentStatus = 'paid';
    }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
