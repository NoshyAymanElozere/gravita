const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const validate = require('../middlewares/validate.middleware');
const { updateOrderStatusSchema } = require('../validations/order.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب قائمة بكل طلبات النظام (للأدمن فقط) - GET /api/admin/orders
router.get('/', async (req, res) => {
    try {
        const { results, pagination } = await paginate(
            Order,
            {},
            req.query,
            [{ path: 'user', select: 'name email' }, { path: 'items.product' }, { path: 'items.bundle' }]
        );
            
        res.status(200).json({
            status: 'success',
            count: results.length,
            pagination,
            data: {
                orders: results
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ تحديث حالة الطلب (للأدمن فقط) - PUT /api/admin/orders/:id/status
router.put('/:id/status', validate(updateOrderStatusSchema), async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email').populate('items.product').populate('items.bundle');

        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'الطلب غير موجود لتعديل حالته!'
            });
        }

        res.status(200).json({
            status: 'success',
            message: `🚚 تم تحديث حالة الطلب بنجاح إلى: ${status}`,
            data: {
                order
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الطلب غير صحيح (Invalid Order ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
