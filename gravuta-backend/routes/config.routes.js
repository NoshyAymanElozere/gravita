const express = require('express');
const router = express.Router();
const { SHIPPING_RULES } = require('../utils/pricing');

// إعدادات عامة تحتاجها الواجهة: طرق الدفع المتاحة وبيانات الحساب البنكي للتحويل
// تُضبط من ملف .env: BANK_NAME / BANK_IBAN / BANK_ACCOUNT_NAME
// GET /api/config
router.get('/', (req, res) => {
    const onlinePayments = process.env.ONLINE_PAYMENTS_ENABLED === 'true';
    res.status(200).json({
        status: 'success',
        data: {
            payments: {
                methods: onlinePayments
                    ? ['cod', 'bank_transfer', 'credit_card', 'apple_pay', 'google_pay']
                    : ['cod', 'bank_transfer'],
                codFee: SHIPPING_RULES.codFee,
                bankTransfer: {
                    bankName: process.env.BANK_NAME || 'Saudi National Bank (SNB)',
                    iban: process.env.BANK_IBAN || 'SA00 0000 0000 0000 0000 0000',
                    accountName: process.env.BANK_ACCOUNT_NAME || 'AURA Laboratories Trading Co.'
                }
            },
            shipping: {
                fee: SHIPPING_RULES.shippingFee,
                freeShippingThreshold: SHIPPING_RULES.freeShippingThreshold
            }
        }
    });
});

module.exports = router;
