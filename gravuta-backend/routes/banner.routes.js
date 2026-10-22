const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');

// جلب شرائح البانر المفعلة مرتبة - GET /api/banners
router.get('/', asyncHandler(async (req, res) => {
    const banners = await Banner.find({ isActive: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({
        status: 'success',
        count: banners.length,
        data: banners
    });
}));

module.exports = router;
