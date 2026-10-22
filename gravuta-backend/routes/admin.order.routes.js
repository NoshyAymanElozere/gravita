const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { STATUS_TRANSITIONS } = require('../models/Order');
const validate = require('../middlewares/validate.middleware');
const { updateOrderStatusSchema, updatePaymentStatusSchema, orderQuerySchema } = require('../validations/order.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../utils/helpers');
const { cancelOrder, generateTrackingNumber } = require('../utils/orders');

const orderPopulate = [
    { path: 'user', select: 'name email phone' },
    { path: 'items.product', select: 'slug image stock' },
    { path: 'items.bundle', select: 'slug image' }
];

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب قائمة بكل طلبات النظام - GET /api/admin/orders?status=pending&q=AURA-1234&from=2026-01-01&to=2026-12-31
router.get('/', validate(orderQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const { status, q, from, to } = req.validatedQuery;
    const filter = {};

    if (status) {
        filter.status = status === 'in-transit' ? 'shipped' : status;
    }
    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = from;
        if (to) filter.createdAt.$lte = to;
    }
    // البحث برقم الطلب أو بريد/اسم العميل أو رقم الهاتف
    if (q) {
        const regex = { $regex: escapeRegex(q), $options: 'i' };
        const users = await User.find({ $or: [{ email: regex }, { name: regex }] }).select('_id');
        filter.$or = [
            { orderNumber: regex },
            { 'contact.phone': regex },
            { user: { $in: users.map(u => u._id) } }
        ];
    }

    const { results, pagination } = await paginate(Order, filter, req.query, orderPopulate, '', { createdAt: -1 });

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: {
            orders: results
        }
    });
}));

// 2️⃣ جلب تفاصيل طلب - GET /api/admin/orders/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(orderPopulate);
    if (!order) {
        throw new AppError('الطلب غير موجود!', 404);
    }

    res.status(200).json({
        status: 'success',
        data: {
            order,
            allowedTransitions: STATUS_TRANSITIONS[order.status] || []
        }
    });
}));

// 3️⃣ تحديث حالة الطلب - PUT /api/admin/orders/:id/status
// { status, note?, trackingNumber?, estimatedDelivery? }
// يتم التحقق من الانتقالات المسموحة، والإلغاء يعيد المخزون والكوبون تلقائياً
router.put('/:id/status', validate(updateOrderStatusSchema), asyncHandler(async (req, res) => {
    const { status, note, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError('الطلب غير موجود لتعديل حالته!', 404);
    }

    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
        throw new AppError(
            `لا يمكن تغيير حالة الطلب من ${order.status} إلى ${status} (المسموح: ${allowed.join(', ') || 'لا شيء'})`,
            400
        );
    }

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    if (status === 'cancelled') {
        await cancelOrder(order, { reason: note || 'Cancelled by admin', by: req.user._id });
    } else {
        if (status === 'shipped' && !order.trackingNumber) {
            order.trackingNumber = generateTrackingNumber();
        }
        if (status === 'returned' && order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }
        order.setStatus(status, { note, by: req.user._id });
        await order.save();
    }

    await order.populate(orderPopulate);

    res.status(200).json({
        status: 'success',
        message: `🚚 تم تحديث حالة الطلب بنجاح إلى: ${status}`,
        data: {
            order
        }
    });
}));

// 4️⃣ تحديث حالة الدفع - PATCH /api/admin/orders/:id/payment
// { paymentStatus, paymentRef? } - مثلاً تأكيد استلام التحويل البنكي على حساب المتجر
router.patch('/:id/payment', validate(updatePaymentStatusSchema), asyncHandler(async (req, res) => {
    const { paymentStatus, paymentRef } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError('الطلب غير موجود لتعديل حالة الدفع!', 404);
    }

    order.paymentStatus = paymentStatus;
    if (paymentRef !== undefined) order.paymentRef = paymentRef;
    await order.save();
    await order.populate(orderPopulate);

    res.status(200).json({
        status: 'success',
        message: `💳 تم تحديث حالة الدفع بنجاح إلى: ${paymentStatus}`,
        data: {
            order
        }
    });
}));

module.exports = router;
