const mongoose = require('mongoose');

// تعريف مخطط المنتج (Product Schema)
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'اسم المنتج مطلوب (name is required)'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'وصف المنتج مطلوب (description is required)'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'سعر المنتج مطلوب (price is required)'],
        min: [0, 'السعر لا يمكن أن يكون بالسالب']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'فئة المنتج مطلوبة (category is required)']
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // يضيف تلقائياً وقت الإنشاء createdAt ووقت التعديل updatedAt
});

// تصدير نموذج المنتج (Product Model)
module.exports = mongoose.model('Product', productSchema);
