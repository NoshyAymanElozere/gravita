const mongoose = require('mongoose');

// تعريف مخطط الفئة (Category Schema)
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'اسم الفئة مطلوب (Category name is required)'],
        unique: true, // لمنع تكرار نفس الفئة
        trim: true
    },
    description: {
        type: String,
        required: [true, 'وصف الفئة مطلوب (Category description is required)'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // يضيف تلقائياً وقت الإنشاء ووقت التعديل
});

// تصدير نموذج الفئة (Category Model)
module.exports = mongoose.model('Category', categorySchema);
