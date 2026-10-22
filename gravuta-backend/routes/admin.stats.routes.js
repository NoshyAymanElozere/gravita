const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Bundle = require('../models/Bundle');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

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

// تقرير مبيعات مفصل لفترة محددة - GET /api/admin/stats/report?from=2026-01-01&to=2026-01-31&format=json|csv
// JSON: ملخص + تفصيل يومي + حسب الحالة + حسب طريقة الدفع + أفضل المنتجات
// CSV: تصدير جميع طلبات الفترة كملف جاهز للإكسل
router.get('/report', asyncHandler(async (req, res) => {
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (isNaN(from) || isNaN(to) || from > to) {
        throw new AppError('نطاق التاريخ غير صالح (from/to بصيغة YYYY-MM-DD)', 400);
    }
    // نهاية اليوم المحدد في to حتى يشمل التقرير طلبات ذلك اليوم كاملة
    const toEnd = new Date(to);
    if (!req.query.to || !String(req.query.to).includes('T')) toEnd.setHours(23, 59, 59, 999);

    const range = { createdAt: { $gte: from, $lte: toEnd } };
    const sold = { ...range, status: { $ne: 'cancelled' } };

    if (req.query.format === 'csv') {
        const orders = await Order.find(range).populate('user', 'name email').sort({ createdAt: 1 }).lean();
        const esc = (v) => {
            const s = v === undefined || v === null ? '' : String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const header = ['orderNumber', 'date', 'customer', 'email', 'items', 'paymentMethod', 'paymentStatus', 'status', 'subtotal', 'discount', 'shippingFee', 'codFee', 'total'];
        const rows = orders.map(o => [
            o.orderNumber,
            new Date(o.createdAt).toISOString().slice(0, 10),
            o.contact?.name || o.user?.name || '',
            o.contact?.email || o.user?.email || '',
            (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
            o.paymentMethod,
            o.paymentStatus,
            o.status,
            o.subtotal,
            o.discount,
            o.shippingFee,
            o.codFee,
            o.total
        ].map(esc).join(','));
        const csv = '﻿' + [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv"`);
        return res.status(200).send(csv);
    }

    const [[summary], byDay, byStatus, byPaymentMethod, topProducts, newCustomers] = await Promise.all([
        Order.aggregate([
            { $match: sold },
            {
                $group: {
                    _id: null,
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' },
                    avgOrder: { $avg: '$total' },
                    discounts: { $sum: '$discount' },
                    shipping: { $sum: { $add: ['$shippingFee', '$codFee'] } },
                    units: { $sum: { $sum: '$items.quantity' } }
                }
            }
        ]),
        Order.aggregate([
            { $match: sold },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            { $match: range },
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            { $match: sold },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            { $match: sold },
            { $unwind: '$items' },
            {
                $group: {
                    _id: { name: { $ifNull: ['$items.nameEn', 'Unknown'] }, nameAr: { $ifNull: ['$items.nameAr', ''] }, itemType: '$items.itemType' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.lineTotal' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, nameEn: '$_id.name', nameAr: '$_id.nameAr', itemType: '$_id.itemType', quantity: 1, revenue: 1 } }
        ]),
        User.countDocuments({ role: 'user', createdAt: { $gte: from, $lte: toEnd } })
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            period: { from: from.toISOString(), to: toEnd.toISOString() },
            summary: {
                orders: summary?.orders || 0,
                revenue: summary?.revenue || 0,
                averageOrderValue: Math.round(summary?.avgOrder || 0),
                unitsSold: summary?.units || 0,
                discounts: summary?.discounts || 0,
                shippingCollected: summary?.shipping || 0,
                newCustomers
            },
            byDay: byDay.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
            byStatus: Object.fromEntries(byStatus.map(s => [s._id, { count: s.count, revenue: s.revenue }])),
            byPaymentMethod: Object.fromEntries(byPaymentMethod.map(m => [m._id, { count: m.count, revenue: m.revenue }])),
            topProducts
        }
    });
}));

module.exports = router;
