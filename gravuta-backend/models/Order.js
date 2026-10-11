const mongoose = require('mongoose');
// gij 
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        
        ref: 'Product',
        required: [true, 'المنتج مطلوب في الطلب']
    },
    quantity: {
        type: Number,
        required: [true, 'الكمية مطلوبة']
    },
    price: {
        _type: Number,
        get type() {
            return this._type;
        },
        set type(value) {
            this._type = value;
        },
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
    _totalPrice: {
        type: Number,
        required: true
    },
    get totalPrice() {
        return this._totalPrice;
    },
    set totalPrice(value) {
        this._totalPrice = value;
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
