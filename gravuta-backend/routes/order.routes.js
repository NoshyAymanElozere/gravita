const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { OFFLINE_PAYMENT_METHODS } = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const validate = require('../middlewares/validate.middleware');
const {
    createOrderSchema,
    cancelOrderSchema,
    returnOrderSchema,
    orderQuerySchema
} = require('../validations/order.validation');
const { protect } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/helpers');
const { cartPopulate, priceCart, bundleMaxQuantity } = require('../utils/pricing');
const { collectProductQuantities, reserveStock, releaseStock } = require('../utils/inventory');
const {
    RETURN_WINDOW_DAYS,
    ESTIMATED_DELIVERY_DAYS,
    generateOrderNumber,
    buildOrderLines,
    consumeCoupon,
    releaseCoupon,
    cancelOrder,
    canRequestReturn
} = require('../utils/orders');

// الحالات التي يستطيع العميل فيها إلغاء طلبه بنفسه
const USER_CANCELLABLE = ['pending', 'confirmed'];

const orderPopulate = [
    { path: 'items.product', select: 'slug image isActive' },
    { path: 'items.bundle', select: 'slug image isActive' }
];

// جلب طلب يخص المستخدم الحالي (أو أي طلب للأدمن)
const findOwnOrder = async (req) => {
    if (!isObjectId(req.params.id)) {
        throw new AppError('معرف الطلب غير صحيح (Invalid Order ID format)', 400);
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError('الطلب غير موجود!', 404);
    }
    // التأكد من أن الطلب يخص المستخدم الحالي (أو يسمح للأدمن برؤيته كصلاحية إضافية)
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
        throw new AppError('عذراً، ليس لديك الصلاحية لعرض هذا الطلب!', 403);
    }
    return order;
};

// حماية جميع مسارات الطلبات للمستخدمين المسجلين - GET/POST /api/orders
router.use(protect);

// 1️⃣ إنشاء طلب جديد من عناصر العربة - POST /api/orders
// { addressId | address, saveAddress?, contact?, paymentMethod?, notes? }
router.post('/', validate(createOrderSchema), asyncHandler(async (req, res) => {
    const { addressId, address, saveAddress, contact, paymentMethod, notes } = req.body;

    // الدفع الإلكتروني يحتاج ربط بوابة دفع أولاً (لا نستقبل بيانات البطاقات في السيرفر)
    // الدفع عند الاستلام والتحويل البنكي على الآيبان متاحان دائماً
    if (!OFFLINE_PAYMENT_METHODS.includes(paymentMethod) && process.env.ONLINE_PAYMENTS_ENABLED !== 'true') {
        throw new AppError('الدفع الإلكتروني غير متاح حالياً، يرجى اختيار الدفع عند الاستلام (cod) أو التحويل البنكي (bank_transfer)', 400);
    }

    // 1. تحديد عنوان الشحن (محفوظ أو جديد)
    const user = await User.findById(req.user._id);
    let shippingAddress;
    if (addressId) {
        const saved = user.addresses.id(addressId);
        if (!saved) {
            throw new AppError('العنوان المحدد غير موجود في حسابك', 404);
        }
        const { isDefault, _id, ...fields } = saved.toObject();
        shippingAddress = fields;
    } else {
        shippingAddress = address;
    }

    // 2. جلب العربة وحساب الأسعار في السيرفر (المصدر الوحيد للأسعار)
    const cart = await Cart.findOne({ user: user._id }).populate(cartPopulate);
    if (!cart || cart.items.length === 0) {
        throw new AppError('عربة التسوق فارغة! لا يمكنك إرسال طلب فارغ.', 400);
    }
    if (cart.items.some(item => (item.itemType === 'bundle' ? !item.bundle : !item.product))) {
        throw new AppError('أحد العناصر في العربة لم يعد موجوداً، يرجى مراجعة العربة', 409);
    }

    const priced = await priceCart(cart, { paymentMethod, userId: user._id });

    if (!priced.allAvailable) {
        throw new AppError(
            'بعض العناصر في العربة غير متوفرة بالكمية المطلوبة، يرجى مراجعة العربة',
            409,
            priced.items.filter(line => !line.available).map(line => ({
                itemType: line.itemType,
                id: line.itemType === 'bundle' ? line.bundle?._id : line.product?._id,
                requested: line.quantity,
                available: line.maxQuantity
            }))
        );
    }
    if (priced.coupon && !priced.coupon.valid) {
        throw new AppError(`كود الخصم لم يعد صالحاً: ${priced.coupon.message}`, 400);
    }

    // 3. حجز المخزون (المنتجات + مكونات الباقات)
    const items = buildOrderLines(priced);
    const reserved = await reserveStock(collectProductQuantities(items));

    // 4. حجز استخدام الكوبون
    let couponConsumed = false;
    if (priced.coupon) {
        couponConsumed = await consumeCoupon(cart.coupon._id);
        if (!couponConsumed) {
            await releaseStock(reserved);
            throw new AppError('كود الخصم وصل للحد الأقصى من الاستخدام', 409);
        }
    }

    // 5. إنشاء الطلب (مع التراجع عن الحجز إذا فشل الحفظ)
    let order;
    try {
        order = new Order({
            orderNumber: await generateOrderNumber(),
            user: user._id,
            items,
            contact: {
                name: contact?.name || user.name,
                email: contact?.email || user.email,
                phone: contact?.phone || user.phone || shippingAddress.phone
            },
            shippingAddress,
            notes: notes || '',
            paymentMethod,
            coupon: priced.coupon
                ? { code: priced.coupon.code, discountType: priced.coupon.discountType, value: priced.coupon.value }
                : undefined,
            subtotal: priced.subtotal,
            discount: priced.discount,
            shippingFee: priced.shippingFee,
            codFee: priced.codFee,
            total: priced.total,
            estimatedDelivery: new Date(Date.now() + ESTIMATED_DELIVERY_DAYS * 24 * 60 * 60 * 1000)
        });
        order.setStatus('pending', { note: 'Order placed', by: user._id });
        await order.save();
    } catch (error) {
        await releaseStock(reserved);
        if (couponConsumed) await releaseCoupon(priced.coupon.code);
        throw error;
    }

    // 6. تفريغ العربة وحفظ العنوان الجديد إذا طلب المستخدم ذلك
    cart.items = [];
    cart.coupon = null;
    await cart.save();

    if (address && saveAddress && user.addresses.length < 10) {
        const isDefault = user.addresses.length === 0;
        user.addresses.push({ ...address, isDefault });
        await user.save();
    }

    res.status(201).json({
        status: 'success',
        message: '🎉 تم تسجيل طلبك بنجاح وجاري تجهيزه!',
        data: {
            order
        }
    });
}));

// 2️⃣ جلب جميع طلبات المستخدم الحالي - GET /api/orders/my-orders?status=delivered&page=1
// status=in-transit يُعامل كـ shipped (نفس تسمية الواجهة)
router.get('/my-orders', validate(orderQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };
    const { status } = req.validatedQuery;
    if (status) {
        filter.status = status === 'in-transit' ? 'shipped' : status;
    }

    const { results, pagination } = await paginate(Order, filter, req.query, orderPopulate, '', { createdAt: -1 });

    // عدد الطلبات في كل حالة (لتبويبات صفحة "طلباتي")
    const counts = await Order.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        statusCounts: Object.fromEntries(counts.map(c => [c._id, c.count])),
        data: {
            orders: results
        }
    });
}));

// 3️⃣ جلب تفاصيل طلب معين بواسطة معرف الطلب - GET /api/orders/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const order = await findOwnOrder(req);
    await order.populate([...orderPopulate, { path: 'user', select: 'name email' }]);

    res.status(200).json({
        status: 'success',
        data: {
            order,
            canCancel: USER_CANCELLABLE.includes(order.status),
            canReturn: canRequestReturn(order),
            returnWindowDays: RETURN_WINDOW_DAYS
        }
    });
}));

// 4️⃣ إلغاء الطلب بواسطة العميل (قبل الشحن فقط) - PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', validate(cancelOrderSchema), asyncHandler(async (req, res) => {
    const order = await findOwnOrder(req);

    if (!USER_CANCELLABLE.includes(order.status)) {
        throw new AppError(`لا يمكن إلغاء الطلب في حالته الحالية (${order.status})`, 400);
    }

    await cancelOrder(order, { reason: req.body.reason || 'Cancelled by customer', by: req.user._id });

    res.status(200).json({
        status: 'success',
        message: '❌ تم إلغاء الطلب بنجاح',
        data: { order }
    });
}));

// 5️⃣ طلب استرجاع (بعد التوصيل وخلال فترة الاسترجاع) - POST /api/orders/:id/return
router.post('/:id/return', validate(returnOrderSchema), asyncHandler(async (req, res) => {
    const order = await findOwnOrder(req);

    if (!canRequestReturn(order)) {
        throw new AppError(`طلب الاسترجاع متاح فقط للطلبات المُسلمة خلال ${RETURN_WINDOW_DAYS} يوماً`, 400);
    }

    order.returnReason = req.body.reason;
    order.setStatus('return_requested', { note: req.body.reason, by: req.user._id });
    await order.save();

    res.status(200).json({
        status: 'success',
        message: '↩️ تم إرسال طلب الاسترجاع وسيتم مراجعته',
        data: { order }
    });
}));

// 6️⃣ إعادة الطلب (إضافة عناصر طلب سابق للعربة) - POST /api/orders/:id/reorder
router.post('/:id/reorder', asyncHandler(async (req, res) => {
    const order = await findOwnOrder(req);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const skipped = [];
    for (const line of order.items) {
        if (line.itemType === 'bundle') {
            const bundle = await Bundle.findOne({ _id: line.bundle, isActive: true }).populate('items.product');
            const existing = cart.items.find(i => i.itemType === 'bundle' && String(i.bundle) === String(line.bundle));
            const wanted = Math.min((existing ? existing.quantity : 0) + line.quantity, bundle ? bundleMaxQuantity(bundle) : 0);
            if (wanted <= 0) {
                skipped.push({ itemType: 'bundle', id: line.bundle, nameEn: line.nameEn, nameAr: line.nameAr });
                continue;
            }
            if (existing) existing.quantity = wanted;
            else cart.items.push({ itemType: 'bundle', bundle: line.bundle, quantity: wanted });
        } else {
            const product = await Product.findOne({ _id: line.product, isActive: { $ne: false } });
            const existing = cart.items.find(i => i.itemType !== 'bundle' && String(i.product) === String(line.product));
            const wanted = Math.min((existing ? existing.quantity : 0) + line.quantity, product ? product.stock : 0);
            if (wanted <= 0) {
                skipped.push({ itemType: 'product', id: line.product, nameEn: line.nameEn, nameAr: line.nameAr });
                continue;
            }
            if (existing) existing.quantity = wanted;
            else cart.items.push({ itemType: 'product', product: line.product, quantity: wanted });
        }
    }

    await cart.save();
    await cart.populate(cartPopulate);
    const priced = await priceCart(cart, { userId: req.user._id });

    res.status(200).json({
        status: 'success',
        message: skipped.length ? '🛒 تمت إضافة العناصر المتاحة إلى العربة' : '🛒 تمت إضافة عناصر الطلب إلى العربة',
        data: { cart: priced, skipped }
    });
}));

module.exports = router;
