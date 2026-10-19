const mongoose = require('mongoose');

// حقول العنوان المشتركة بين عناوين المستخدم المحفوظة وعنوان الشحن داخل الطلب
const addressFields = {
    fullName: { type: String, required: [true, 'الاسم الكامل مطلوب في العنوان'], trim: true },
    phone: { type: String, required: [true, 'رقم الهاتف مطلوب في العنوان'], trim: true },
    addressLine1: { type: String, required: [true, 'العنوان (السطر الأول) مطلوب'], trim: true },
    addressLine2: { type: String, default: '', trim: true },
    city: { type: String, required: [true, 'المدينة مطلوبة'], trim: true },
    state: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true },
    country: { type: String, default: 'Saudi Arabia', trim: true }
};

// عنوان محفوظ في حساب المستخدم (له _id لتعديله وحذفه)
const userAddressSchema = new mongoose.Schema({
    ...addressFields,
    isDefault: { type: Boolean, default: false }
});

// نسخة ثابتة من العنوان داخل الطلب (لا تتأثر بتعديل أو حذف عنوان المستخدم لاحقاً)
const orderAddressSchema = new mongoose.Schema(addressFields, { _id: false });

module.exports = {
    userAddressSchema,
    orderAddressSchema
};
