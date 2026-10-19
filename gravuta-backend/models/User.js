const mongoose = require('mongoose');
const { userAddressSchema } = require('./schemas/address.schema');

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
        required: [true, 'كلمة المرور مطلوبة (Password is required)'],
        select: false // لا تُرجع كلمة المرور في أي استعلام إلا بطلب صريح select('+password')
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // القيم المتاحة فقط
        default: 'user' // بشكل افتراضي يكون الحساب مستخدم عادي
    },
    isActive: {
        type: Boolean,
        default: true // الحساب نشط افتراضياً عند الإنشاء
    },
    // العناوين المحفوظة (صفحة "عناويني" وخطوة الشحن في الدفع)
    addresses: {
        type: [userAddressSchema],
        default: []
    },
    // المنتجات المفضلة (صفحة "مفضلي")
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // وقت آخر تغيير لكلمة المرور لإبطال الرموز القديمة
    passwordChangedAt: Date
}, {
    timestamps: true // يضيف تلقائياً وقت الإنشاء ووقت التعديل
});

// تصدير النموذج (Export Model)
module.exports = mongoose.model('User', userSchema);
