const mongoose = require('mongoose');

// مشتركو النشرة البريدية (نموذج الاشتراك في الـ Footer والصفحة الرئيسية)
const newsletterSubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        unique: true,
        trim: true,
        lowercase: true
    },
    lang: { type: String, enum: ['en', 'ar'], default: 'en' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
