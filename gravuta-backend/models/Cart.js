const mongoose = require('mongoose');

// عنصر العربة يمكن أن يكون منتجاً منفرداً أو باقة كاملة
const cartItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['product', 'bundle'],
        default: 'product'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [function () { return this.itemType !== 'bundle'; }, 'المنتج مطلوب في العربة']
    },
    bundle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle',
        required: [function () { return this.itemType === 'bundle'; }, 'الباقة مطلوبة في العربة']
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'الكمية يجب أن تكون 1 على الأقل']
    }
}, { _id: false }); // لا نحتاج لمعرف ID فريد لكل عنصر في العربة

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المستخدم مطلوب للعربة'],
        unique: true // كل مستخدم يملك عربة تسوق واحدة فقط
    },
    items: [cartItemSchema],
    // كوبون الخصم المطبق على العربة (يُعاد التحقق منه عند كل حساب للأسعار)
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
