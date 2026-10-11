const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const validate = require('../middlewares/validate.middleware');
const { createOrderSchema } = require('../validations/order.validation');
const { protect } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');

// حماية جميع مسارات الطلبات للمستخدمين المسجلين - GET/POST /api/orders
router.use(protect);

// 1️⃣ إنشاء طلب جديد من عناصر العربة - POST /api/orders
router.post('/', validate(createOrderSchema), async (req, res) => {
    try {
        const { shippingAddress, phone, paymentMethod } = req.body;

        // 1. جلب عربة تسوق المستخدم مع بيانات المنتجات
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'عربة التسوق فارغة! لا يمكنك إرسال طلب فارغ.'
            });
        }

        // 2. حساب السعر الإجمالي وتحضير عناصر الطلب
        let totalPrice = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'أحد المنتجات في العربة لم يعد متوفراً!'
                });
            }
            const itemPrice = item.product.price;
            totalPrice += itemPrice * item.quantity;
            
            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                price: itemPrice // حفظ السعر الحالي
            });
        }

        // 3. إنشاء الطلب في قاعدة البيانات
        const newOrder = new Order({
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress,
            phone,
            paymentMethod: paymentMethod || 'COD'
        });

        const savedOrder = await newOrder.save();

        // 4. تفريغ عربة التسوق بعد إتمام الطلب بنجاح
        cart.items = [];
        await cart.save();

        res.status(201).json({
            status: 'success',
            message: '🎉 تم تسجيل طلبك بنجاح وجاري تجهيزه!',
            data: {
                order: savedOrder
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ جلب جميع طلبات المستخدم الحالي - GET /api/orders/my-orders
router.get('/my-orders', async (req, res) => {
    try {
        const { results, pagination } = await paginate(Order, { user: req.user._id }, req.query, 'items.product');
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

// 3️⃣ جلب تفاصيل طلب معين بواسطة معرف الطلب - GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'الطلب غير موجود!'
            });
        }

        // التأكد من أن الطلب يخص المستخدم الحالي (أو يسمح للأدمن برؤيته كصلاحية إضافية)
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'عذراً، ليس لديك الصلاحية لعرض تفاصيل هذا الطلب!'
            });
        }

        res.status(200).json({
            status: 'success',
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
