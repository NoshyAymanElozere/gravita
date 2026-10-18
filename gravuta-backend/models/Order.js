const mongoose = require('mongoose');

// نسخة ثابتة من منتجات الباقة وقت الشراء (لأن الباقة قد تتغير أو تُحذف لاحقاً)
const bundleSnapshotItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
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
    // بيانات الباقة وقت الشراء (فقط لعناصر الباقات)
    bundleSnapshot: {
        nameEn: String,
        nameAr: String,
        originalPrice: Number,
        discountPercentage: Number,
        items: [bundleSnapshotItemSchema]
    },
    quantity: {
        type: Number,
        required: [true, 'الكمية مطلوبة']
    },
    price: {
        type: Number,
        required: [true, 'السعر وقت الشراء مطلوب'] // يتم تسجيل السعر الحالي للمنتج وقت الطلب لأن الأسعار تتغير لاحقاً
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المستخدم مطلوب للطلب']
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
        required: [true, 'عنوان الشحن مطلوب']
    },
    phone: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card'],
        default: 'COD'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
