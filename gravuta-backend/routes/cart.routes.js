const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const validate = require('../middlewares/validate.middleware');
const { addToCartSchema, updateCartItemSchema } = require('../validations/cart.validation');
const { protect } = require('../middlewares/auth.middleware');

// حماية جميع مسارات العربة - يجب تسجيل الدخول (Require authentication for all cart routes)
router.use(protect);

// 1️⃣ الحصول على عربة التسوق الخاصة بالمستخدم الحالي - GET /api/cart
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        // إذا لم يكن لدى المستخدم عربة تسوق بعد، نقوم بإنشاء عربة فارغة له
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({
            status: 'success',
            data: {
                cart
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 2️⃣ إضافة منتج إلى عربة التسوق - POST /api/cart
router.post('/', validate(addToCartSchema), async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qtyToAdd = quantity || 1;

        // 1. التأكد من وجود المنتج في قاعدة البيانات
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج المراد إضافته غير موجود!'
            });
        }

        // 2. البحث عن عربة تسوق المستخدم أو إنشاؤها إن لم توجد
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // 3. التحقق مما إذا كان المنتج موجوداً مسبقاً في العربة
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // المنتج موجود بالفعل، نقوم بزيادة الكمية
            cart.items[itemIndex].quantity += qtyToAdd;
        } else {
            // المنتج غير موجود، نقوم بإضافته كعنصر جديد
            cart.items.push({ product: productId, quantity: qtyToAdd });
        }

        // 4. حفظ التغييرات وإرجاع العربة مع بيانات المنتج
        await cart.save();
        const populatedCart = await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            message: '📥 تم إضافة المنتج إلى العربة بنجاح!',
            data: {
                cart: populatedCart
            }
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
            message: error.message
        });
    }
});

// 3️⃣ تحديث كمية منتج معين في العربة - PUT /api/cart
router.put('/', validate(updateCartItemSchema), async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // 1. جلب عربة تسوق المستخدم
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'fail',
                message: 'عربة التسوق غير موجودة!'
            });
        }

        // 2. البحث عن المنتج داخل العربة
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'هذا المنتج غير موجود في عربة التسوق لتعديل كميته!'
            });
        }

        // 3. تحديث الكمية وحفظ العربة
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const populatedCart = await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            message: '✏️ تم تحديث كمية المنتج في العربة بنجاح!',
            data: {
                cart: populatedCart
            }
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
            message: error.message
        });
    }
});

// 4️⃣ حذف منتج معين من العربة - DELETE /api/cart/:productId
router.delete('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'fail',
                message: 'عربة التسوق غير موجودة!'
            });
        }

        // التحقق من وجود المنتج في العربة
        const itemExists = cart.items.some(item => item.product.toString() === productId);
        if (!itemExists) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج غير موجود في عربة التسوق لحذفه!'
            });
        }

        // تصفية المنتج وحفظ العربة
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        const populatedCart = await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم إزالة المنتج من العربة بنجاح!',
            data: {
                cart: populatedCart
            }
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
            message: error.message
        });
    }
});

// 5️⃣ تفريغ عربة التسوق بالكامل - DELETE /api/cart
router.delete('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'fail',
                message: 'عربة التسوق غير موجودة!'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            status: 'success',
            message: '🧹 تم تفريغ عربة التسوق بالكامل!',
            data: {
                cart
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
