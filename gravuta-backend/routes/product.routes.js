const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const paginate = require('../utils/paginate');

// 1️⃣ جلب كافة المنتجات من قاعدة البيانات - GET /api/products
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(Product, {}, req.query, 'category');
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

// 2️⃣ جلب منتج واحد بواسطة الـ ID - GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج غير موجود'
            });
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف المنتج غير صحيح (Invalid Product ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'معرف المنتج غير صحيح أو حدث خطأ بالسيرفر'
        });
    }
});

module.exports = router;
