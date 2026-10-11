const mongoose = require('mongoose');

// مخطط المستخدم (User Schema)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الاسم مطلوب (Name is required)'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب (Email is required)'],
        unique: true, // لمنع تسجيل حسابين بنفس البريد
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة (Password is required)']
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // القيم المتاحة فقط
        default: 'user' // بشكل افتراضي يكون الحساب مستخدم عادي
    },
    isActive: {
        type: Boolean,
        default: true // الحساب نشط افتراضياً عند الإنشاء
    }
}, {
    timestamps: true // يضيف تلقائياً وقت الإنشاء ووقت التعديل
});

// تصدير النموذج (Export Model)
module.exports = mongoose.model('User', userSchema);
