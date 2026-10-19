const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const validate = require('../middlewares/validate.middleware');
const { newsletterSchema } = require('../validations/review.validation');
const asyncHandler = require('../utils/asyncHandler');

// الاشتراك في النشرة البريدية - POST /api/newsletter
router.post('/', validate(newsletterSchema), asyncHandler(async (req, res) => {
    const { email, lang } = req.body;

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing?.isActive) {
        return res.status(200).json({
            status: 'success',
            message: 'أنت مشترك بالفعل في النشرة البريدية'
        });
    }

    await NewsletterSubscriber.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email, lang, isActive: true },
        { upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
        status: 'success',
        message: '💌 تم الاشتراك في النشرة البريدية بنجاح!'
    });
}));

// إلغاء الاشتراك - POST /api/newsletter/unsubscribe
router.post('/unsubscribe', validate(newsletterSchema), asyncHandler(async (req, res) => {
    await NewsletterSubscriber.updateOne({ email: req.body.email.toLowerCase() }, { isActive: false });

    res.status(200).json({
        status: 'success',
        message: 'تم إلغاء الاشتراك من النشرة البريدية'
    });
}));

module.exports = router;
