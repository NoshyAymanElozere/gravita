const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const validate = require('../middlewares/validate.middleware');
const { addToCartSchema, updateCartItemSchema } = require('../validations/cart.validation');
const { addBundleToCartSchema, updateCartBundleSchema } = require('../validations/bundle.validation');
const { protect } = require('../middlewares/auth.middleware');

// جلب بيانات المنتجات والباقات (ومنتجات كل باقة) داخل العربة
const cartPopulate = [
    { path: 'items.product' },
    { path: 'items.bundle', populate: { path: 'items.product', select: 'name price image' } }
];

// هل هذا العنصر منتج منفرد بهذا المعرف؟ (عناصر الباقات لا تحتوي على product)
const isProductItem = (item, productId) =>
    item.itemType !== 'bundle' && item.product && item.product.toString() === productId;

// هل هذا العنصر باقة بهذا المعرف؟
const isBundleItem = (item, bundleId) =>
    item.itemType === 'bundle' && item.bundle && item.bundle.toString() === bundleId;

// حماية جميع مسارات العربة - يجب تسجيل الدخول (Require authentication for all cart routes)
router.use(protect);

// 1️⃣ الحصول على عربة التسوق الخاصة بالمستخدم الحالي - GET /api/cart
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate(cartPopulate);
        
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
        const itemIndex = cart.items.findIndex(item => isProductItem(item, productId));

        if (itemIndex > -1) {
            // المنتج موجود بالفعل، نقوم بزيادة الكمية
            cart.items[itemIndex].quantity += qtyToAdd;
        } else {
            // المنتج غير موجود، نقوم بإضافته كعنصر جديد
            cart.items.push({ itemType: 'product', product: productId, quantity: qtyToAdd });
        }

        // 4. حفظ التغييرات وإرجاع العربة مع بيانات المنتج
        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

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
        const itemIndex = cart.items.findIndex(item => isProductItem(item, productId));

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'هذا المنتج غير موجود في عربة التسوق لتعديل كميته!'
            });
        }

        // 3. تحديث الكمية وحفظ العربة
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

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

// 🎁 إضافة باقة إلى العربة - POST /api/cart/bundles
router.post('/bundles', validate(addBundleToCartSchema), async (req, res) => {
    try {
        const { bundleId, quantity } = req.body;
        const qtyToAdd = quantity || 1;

        const bundle = await Bundle.findOne({ _id: bundleId, isActive: true });
        if (!bundle) {
            return res.status(404).json({
                status: 'fail',
                message: 'الباقة المراد إضافتها غير موجودة أو غير متاحة!'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => isBundleItem(item, bundleId));
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qtyToAdd;
        } else {
            cart.items.push({ itemType: 'bundle', bundle: bundleId, quantity: qtyToAdd });
        }

        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

        res.status(200).json({
            status: 'success',
            message: '🎁 تم إضافة الباقة إلى العربة بنجاح!',
            data: {
                cart: populatedCart
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الباقة غير صحيح (Invalid Bundle ID format)'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 🎁 تحديث كمية باقة في العربة - PUT /api/cart/bundles
router.put('/bundles', validate(updateCartBundleSchema), async (req, res) => {
    try {
        const { bundleId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ status: 'fail', message: 'عربة التسوق غير موجودة!' });
        }

        const itemIndex = cart.items.findIndex(item => isBundleItem(item, bundleId));
        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'هذه الباقة غير موجودة في عربة التسوق لتعديل كميتها!'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

        res.status(200).json({
            status: 'success',
            message: '✏️ تم تحديث كمية الباقة في العربة بنجاح!',
            data: {
                cart: populatedCart
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 🎁 حذف باقة من العربة - DELETE /api/cart/bundles/:bundleId
router.delete('/bundles/:bundleId', async (req, res) => {
    try {
        const { bundleId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ status: 'fail', message: 'عربة التسوق غير موجودة!' });
        }

        if (!cart.items.some(item => isBundleItem(item, bundleId))) {
            return res.status(404).json({
                status: 'fail',
                message: 'الباقة غير موجودة في عربة التسوق لحذفها!'
            });
        }

        cart.items = cart.items.filter(item => !isBundleItem(item, bundleId));
        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

        res.status(200).json({
            status: 'success',
            message: '🗑️ تم إزالة الباقة من العربة بنجاح!',
            data: {
                cart: populatedCart
            }
        });
    } catch (error) {
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
        const itemExists = cart.items.some(item => isProductItem(item, productId));
        if (!itemExists) {
            return res.status(404).json({
                status: 'fail',
                message: 'المنتج غير موجود في عربة التسوق لحذفه!'
            });
        }

        // تصفية المنتج وحفظ العربة
        cart.items = cart.items.filter(item => !isProductItem(item, productId));
        await cart.save();
        const populatedCart = await cart.populate(cartPopulate);

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
