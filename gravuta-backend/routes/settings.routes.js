const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');

// إعدادات الموقع العامة (الشعار) - GET /api/settings
router.get('/', asyncHandler(async (req, res) => {
    const site = await Setting.getSite();
    res.set('Cache-Control', 'public, max-age=60');
    res.status(200).json({
        status: 'success',
        data: {
            logo: site.logo || null,
            updatedAt: site.updatedAt
        }
    });
}));

module.exports = router;
