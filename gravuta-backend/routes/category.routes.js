const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const paginate = require('../utils/paginate');

// 1️⃣ جلب كافة الفئات - GET /api/categories
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(Category, {}, req.query);
        res.status(200).json({
            status: 'success',
            count: results.length,
            pagination,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ جلب فئة واحدة بواسطة الـ ID - GET /api/categories/:id
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'الفئة غير موجودة'
            });
        }

        res.status(200).json({
            status: 'success',
            data: category
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الفئة غير صحيح (Invalid ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'معرف الفئة غير صحيح أو حدث خطأ بالسيرفر'
        });
    }
});

module.exports = router;
