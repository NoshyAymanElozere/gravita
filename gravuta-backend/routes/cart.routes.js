const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const Coupon = require('../models/Coupon');
const validate = require('../middlewares/validate.middleware');
const {
    addToCartSchema,
    updateCartItemSchema,
    applyCouponSchema,
    mergeCartSchema,
    cartQuerySchema
} = require('../validations/cart.validation');
const { addBundleToCartSchema, updateCartBundleSchema } = require('../validations/bundle.validation');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/helpers');
const { cartPopulate, priceCart, bundleMaxQuantity, evaluateCoupon } = require('../utils/pricing');

const MAX_CART_LINES = 50;

// هل هذا العنصر منتج منفرد بهذا المعرف؟ (عناصر الباقات لا تحتوي على product)
const isProductItem = (item, productId) =>
    item.itemType !== 'bundle' && item.product && String(item.product._id || item.product) === String(productId);

// هل هذا العنصر باقة بهذا المعرف؟
const isBundleItem = (item, bundleId) =>
    item.itemType === 'bundle' && item.bundle && String(item.bundle._id || item.bundle) === String(bundleId);

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

// إرجاع العربة بعد حساب أسعارها بالكامل في السيرفر
const sendCart = async (req, res, cart, message, statusCode = 200) => {
    await cart.populate(cartPopulate);

    // تنظيف العناصر التي حُذفت منتجاتها أو باقاتها نهائياً من قاعدة البيانات
    const before = cart.items.length;
    cart.items = cart.items.filter(item => (item.itemType === 'bundle' ? item.bundle : item.product));
    if (cart.items.length !== before) {
        await cart.save();
    }

    const priced = await priceCart(cart, {
        paymentMethod: req.validatedQuery?.paymentMethod || req.query.paymentMethod,
        userId: req.user._id
    });

    res.status(statusCode).json({
        status: 'success',
        ...(message && { message }),
        data: {
            cart: priced
        }
    });
};

// التحقق من أن المنتج متاح بالكمية المطلوبة
const assertProductAvailable = (product, quantity) => {
    if (!product || product.isActive === false) {
        throw new AppError('المنتج غير موجود أو غير متاح!', 404);
    }
    if (product.stock < quantity) {
        throw new AppError(`الكمية المتاحة من هذا المنتج هي ${product.stock} فقط`, 409, [
            { product: product._id, requested: quantity, available: product.stock }
        ]);
    }
};

// التحقق من أن الباقة متاحة بالكمية المطلوبة (كل منتجاتها متوفرة)
const loadAvailableBundle = async (bundleId, quantity) => {
    const bundle = await Bundle.findOne({ _id: bundleId, isActive: true }).populate('items.product');
    if (!bundle) {
        throw new AppError('الباقة غير موجودة أو غير متاحة!', 404);
    }
    const max = bundleMaxQuantity(bundle);
    if (max < quantity) {
        throw new AppError(
            max === 0 ? 'هذه الباقة غير متوفرة حالياً (أحد منتجاتها نفد من المخزون)' : `الكمية المتاحة من هذه الباقة هي ${max} فقط`,
            409,
            [{ bundle: bundle._id, requested: quantity, available: max }]
        );
    }
    return bundle;
};

const assertCartCapacity = (cart) => {
    if (cart.items.length >= MAX_CART_LINES) {
        throw new AppError(`لا يمكن إضافة أكثر من ${MAX_CART_LINES} عنصراً مختلفاً للعربة`, 400);
    }
};

// حماية جميع مسارات العربة - يجب تسجيل الدخول (Require authentication for all cart routes)
router.use(protect);

// 1️⃣ الحصول على عربة التسوق الخاصة بالمستخدم الحالي مع الحساب الكامل - GET /api/cart?paymentMethod=cod
router.get('/', validate(cartQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    await sendCart(req, res, cart);
}));

// 2️⃣ إضافة منتج إلى عربة التسوق - POST /api/cart
router.post('/', validate(addToCartSchema), asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(item => isProductItem(item, productId));
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    assertProductAvailable(product, newQuantity);

    if (existing) {
        existing.quantity = newQuantity;
    } else {
        assertCartCapacity(cart);
        cart.items.push({ itemType: 'product', product: productId, quantity });
    }

    await cart.save();
    await sendCart(req, res, cart, '📥 تم إضافة المنتج إلى العربة بنجاح!');
}));

// 3️⃣ تحديث كمية منتج معين في العربة - PUT /api/cart
router.put('/', validate(updateCartItemSchema), asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(item => isProductItem(item, productId));
    if (!existing) {
        throw new AppError('هذا المنتج غير موجود في عربة التسوق لتعديل كميته!', 404);
    }

    assertProductAvailable(await Product.findById(productId), quantity);

    existing.quantity = quantity;
    await cart.save();
    await sendCart(req, res, cart, '✏️ تم تحديث كمية المنتج في العربة بنجاح!');
}));

// 🎁 إضافة باقة إلى العربة - POST /api/cart/bundles
router.post('/bundles', validate(addBundleToCartSchema), asyncHandler(async (req, res) => {
    const { bundleId, quantity } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(item => isBundleItem(item, bundleId));
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    await loadAvailableBundle(bundleId, newQuantity);

    if (existing) {
        existing.quantity = newQuantity;
    } else {
        assertCartCapacity(cart);
        cart.items.push({ itemType: 'bundle', bundle: bundleId, quantity });
    }

    await cart.save();
    await sendCart(req, res, cart, '🎁 تم إضافة الباقة إلى العربة بنجاح!');
}));

// 🎁 تحديث كمية باقة في العربة - PUT /api/cart/bundles
router.put('/bundles', validate(updateCartBundleSchema), asyncHandler(async (req, res) => {
    const { bundleId, quantity } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(item => isBundleItem(item, bundleId));
    if (!existing) {
        throw new AppError('هذه الباقة غير موجودة في عربة التسوق لتعديل كميتها!', 404);
    }

    await loadAvailableBundle(bundleId, quantity);

    existing.quantity = quantity;
    await cart.save();
    await sendCart(req, res, cart, '✏️ تم تحديث كمية الباقة في العربة بنجاح!');
}));

// 🎁 حذف باقة من العربة - DELETE /api/cart/bundles/:bundleId
router.delete('/bundles/:bundleId', asyncHandler(async (req, res) => {
    const { bundleId } = req.params;

    const cart = await getOrCreateCart(req.user._id);
    if (!cart.items.some(item => isBundleItem(item, bundleId))) {
        throw new AppError('الباقة غير موجودة في عربة التسوق لحذفها!', 404);
    }

    cart.items = cart.items.filter(item => !isBundleItem(item, bundleId));
    await cart.save();
    await sendCart(req, res, cart, '🗑️ تم إزالة الباقة من العربة بنجاح!');
}));

// 🏷️ تطبيق كوبون خصم - POST /api/cart/coupon
router.post('/coupon', validate(applyCouponSchema), asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    const coupon = await Coupon.findOne({ code: req.body.code });

    // التحقق من الكوبون مقابل قيمة العربة الحالية
    await cart.populate(cartPopulate);
    const { subtotal } = await priceCart(cart, { userId: req.user._id });
    const result = await evaluateCoupon(coupon, subtotal, req.user._id);
    if (!result.valid) {
        throw new AppError(result.message, 400);
    }

    cart.coupon = coupon._id;
    await cart.save();
    await sendCart(req, res, cart, `🏷️ تم تطبيق كود الخصم ${coupon.code} بنجاح!`);
}));

// 🏷️ إزالة كوبون الخصم - DELETE /api/cart/coupon
router.delete('/coupon', asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    cart.coupon = null;
    await cart.save();
    await sendCart(req, res, cart, 'تم إزالة كود الخصم');
}));

// 🔀 دمج عربة الزائر مع عربة الحساب بعد تسجيل الدخول - POST /api/cart/merge
// العناصر غير المتاحة يتم تخطيها، والكميات تُقص حسب المخزون المتاح
router.post('/merge', validate(mergeCartSchema), asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    const skipped = [];

    for (const { itemType, id, quantity } of req.body.items) {
        if (itemType === 'bundle') {
            const bundle = await Bundle.findOne({ _id: id, isActive: true }).populate('items.product');
            const existing = cart.items.find(item => isBundleItem(item, id));
            const max = bundle ? bundleMaxQuantity(bundle) : 0;
            const wanted = Math.min((existing ? existing.quantity : 0) + quantity, max);
            if (wanted <= 0) {
                skipped.push({ itemType, id, reason: 'unavailable' });
                continue;
            }
            if (existing) existing.quantity = wanted;
            else if (cart.items.length < MAX_CART_LINES) cart.items.push({ itemType: 'bundle', bundle: id, quantity: wanted });
            else skipped.push({ itemType, id, reason: 'cart_full' });
        } else {
            const product = await Product.findOne({ _id: id, isActive: { $ne: false } });
            const existing = cart.items.find(item => isProductItem(item, id));
            const max = product ? product.stock : 0;
            const wanted = Math.min((existing ? existing.quantity : 0) + quantity, max);
            if (wanted <= 0) {
                skipped.push({ itemType, id, reason: 'unavailable' });
                continue;
            }
            if (existing) existing.quantity = wanted;
            else if (cart.items.length < MAX_CART_LINES) cart.items.push({ itemType: 'product', product: id, quantity: wanted });
            else skipped.push({ itemType, id, reason: 'cart_full' });
        }
    }

    await cart.save();
    await cart.populate(cartPopulate);
    const priced = await priceCart(cart, { userId: req.user._id });

    res.status(200).json({
        status: 'success',
        message: '🔀 تم دمج العربة بنجاح',
        data: { cart: priced, skipped }
    });
}));

// 4️⃣ حذف منتج معين من العربة - DELETE /api/cart/:productId
router.delete('/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
        throw new AppError('معرف المنتج غير صحيح (Invalid Product ID format)', 400);
    }

    const cart = await getOrCreateCart(req.user._id);
    if (!cart.items.some(item => isProductItem(item, productId))) {
        throw new AppError('المنتج غير موجود في عربة التسوق لحذفه!', 404);
    }

    cart.items = cart.items.filter(item => !isProductItem(item, productId));
    await cart.save();
    await sendCart(req, res, cart, '🗑️ تم إزالة المنتج من العربة بنجاح!');
}));

// 5️⃣ تفريغ عربة التسوق بالكامل - DELETE /api/cart
router.delete('/', asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    await sendCart(req, res, cart, '🧹 تم تفريغ عربة التسوق بالكامل!');
}));

module.exports = router;
