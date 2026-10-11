const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'المنتج مطلوب في العربة']
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
    items: [cartItemSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
