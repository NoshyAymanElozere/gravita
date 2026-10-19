const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Bundle = require('../models/Bundle');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// حماية جميع المسارات التالية للأدمن فقط
router.use(protect, restrictTo('admin'));

// إحصائيات لوحة التحكم - GET /api/admin/stats?days=30
router.get('/', asyncHandler(async (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const revenueStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];

    const [
        ordersByStatus,
        [revenue],
        dailySales,
        topProducts,
        lowStock,
        usersCount,
        productsCount,
        bundlesCount
    ] = await Promise.all([
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.aggregate([
            { $match: { status: { $in: [...revenueStatuses, 'pending'] }, createdAt: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } }
        ]),
        Order.aggregate([
            { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Product.find({ isActive: { $ne: false } })
            .sort({ soldCount: -1 })
            .limit(5)
            .select('slug nameEn nameAr soldCount stock image'),
        Product.find({ isActive: { $ne: false }, $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
            .sort({ stock: 1 })
            .limit(20)
            .select('slug nameEn nameAr stock lowStockThreshold'),
        User.countDocuments({ role: 'user' }),
        Product.countDocuments({ isActive: { $ne: false } }),
        Bundle.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            periodDays: days,
            revenue: {
                total: revenue?.total || 0,
                orders: revenue?.orders || 0,
                averageOrderValue: Math.round(revenue?.avgOrder || 0)
            },
            ordersByStatus: Object.fromEntries(ordersByStatus.map(s => [s._id, s.count])),
            dailySales: dailySales.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
            topProducts,
            lowStock,
            totals: { users: usersCount, products: productsCount, bundles: bundlesCount }
        }
    });
}));

module.exports = router;
