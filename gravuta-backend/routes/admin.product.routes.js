const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Bundle = require('../models/Bundle');
const validate = require('../middlewares/validate.middleware');
const {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    productQuerySchema
} = require('../validations/product.validation');
const upload = require('../middlewares/upload.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const paginate = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { parseJsonFields, attachUploadedImages } = require('../utils/helpers');
const { productSort, buildProductFilter } = require('../utils/productQuery');
const { syncBundlesForProduct } = require('../utils/bundlePricing');

// رفع الصورة الرئيسية (image) وحتى 6 صور للمعرض (galleryImages) عبر form-data
const uploadImages = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 6 }
]);
const parseProductFields = parseJsonFields('benefitsEn', 'benefitsAr', 'galleryImages');

const categoryPopulate = { path: 'category', select: 'slug nameEn nameAr' };

const assertCategoryExists = async (categoryId) => {
    if (!(await Category.exists({ _id: categoryId }))) {
        throw new AppError('الفئة المحددة غير موجودة في قاعدة البيانات!', 400);
    }
};

const findProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError('المنتج غير موجود', 404);
    }
    return product;
};

// حماية جميع المسارات التالية للأدمن فقط (Apply protection globally for this router)
router.use(protect, restrictTo('admin'));

// 1️⃣ جلب كل المنتجات (بما فيها غير المفعلة) مع نفس فلاتر المتجر - GET /api/admin/products
router.get('/', validate(productQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const query = req.validatedQuery;
    const filter = await buildProductFilter(query, { admin: true });
    if (!filter) {
        return res.status(200).json({ status: 'success', count: 0, data: [] });
    }

    const { results, pagination } = await paginate(
        Product, filter, req.query, categoryPopulate, '', query.sort ? productSort(query.sort) : { createdAt: -1 }
    );

    res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
    });
}));

// 2️⃣ جلب منتج واحد مع الباقات التي تحتويه - GET /api/admin/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await findProduct(req.params.id);
    await product.populate(categoryPopulate);
    const bundles = await Bundle.find({ 'items.product': product._id }).select('slug nameEn nameAr isActive bundlePrice');

    res.status(200).json({
        status: 'success',
        data: { product, bundles }
    });
}));

// 3️⃣ إضافة منتج جديد مع دعم رفع الصور - POST /api/admin/products
router.post('/', uploadImages, parseProductFields, attachUploadedImages, validate(createProductSchema), asyncHandler(async (req, res) => {
    // التحقق من وجود الفئة في قاعدة البيانات قبل حفظ المنتج
    await assertCategoryExists(req.body.category);

    const savedProduct = await Product.create(req.body);
    await savedProduct.populate(categoryPopulate);

    res.status(201).json({
        status: 'success',
        message: '🎉 تم إضافة المنتج بنجاح إلى قاعدة البيانات!',
        data: savedProduct
    });
}));

// 4️⃣ تعديل بيانات منتج مع دعم تحديث الصور - PUT /api/admin/products/:id
// إذا تغير السعر أو حالة التفعيل تتم مزامنة أسعار وحالة الباقات التي تحتوي المنتج تلقائياً
router.put('/:id', uploadImages, parseProductFields, attachUploadedImages, validate(updateProductSchema), asyncHandler(async (req, res) => {
    if (req.body.category) {
        await assertCategoryExists(req.body.category);
    }

    const product = await findProduct(req.params.id);
    const priceChanged = req.body.price !== undefined && req.body.price !== product.price;
    const activeChanged = req.body.isActive !== undefined && req.body.isActive !== product.isActive;

    product.set(req.body);
    await product.save();
    await product.populate(categoryPopulate);

    const bundleSync = priceChanged || activeChanged ? await syncBundlesForProduct(product._id) : undefined;

    res.status(200).json({
        status: 'success',
        message: '✨ تم تعديل المنتج بنجاح!',
        data: product,
        ...(bundleSync && { bundleSync })
    });
}));

// 5️⃣ تعديل المخزون - PATCH /api/admin/products/:id/stock
// { "stock": 50 } قيمة جديدة، أو { "adjust": -3 } زيادة/نقص
router.patch('/:id/stock', validate(updateStockSchema), asyncHandler(async (req, res) => {
    const { stock, adjust } = req.body;
    let product;

    if (stock !== undefined) {
        product = await Product.findByIdAndUpdate(req.params.id, { stock }, { returnDocument: 'after' });
    } else {
        // التعديل النسبي مشروط بعدم نزول المخزون تحت الصفر
        product = await Product.findOneAndUpdate(
            { _id: req.params.id, stock: { $gte: adjust < 0 ? -adjust : 0 } },
            { $inc: { stock: adjust } },
            { returnDocument: 'after' }
        );
        if (!product && (await Product.exists({ _id: req.params.id }))) {
            throw new AppError('لا يمكن أن يصبح المخزون أقل من صفر', 400);
        }
    }

    if (!product) {
        throw new AppError('المنتج غير موجود', 404);
    }

    res.status(200).json({
        status: 'success',
        message: `📦 المخزون الحالي: ${product.stock}`,
        data: { _id: product._id, stock: product.stock, stockStatus: product.stockStatus }
    });
}));

// 6️⃣ حذف منتج - DELETE /api/admin/products/:id
// افتراضياً: حذف ناعم (تعطيل المنتج وتعطيل الباقات التي تحتويه)
// ?hard=true: حذف نهائي - مرفوض إذا كان المنتج داخل أي باقة
router.delete('/:id', asyncHandler(async (req, res) => {
    const product = await findProduct(req.params.id);

    if (req.query.hard === 'true') {
        const bundles = await Bundle.find({ 'items.product': product._id }).select('slug');
        if (bundles.length) {
            throw new AppError(
                `لا يمكن حذف المنتج نهائياً لأنه موجود في باقات: ${bundles.map(b => b.slug).join(', ')} - قم بتعطيله بدلاً من ذلك`,
                409
            );
        }
        await product.deleteOne();
        return res.status(200).json({
            status: 'success',
            message: '🗑️ تم حذف المنتج نهائياً من قاعدة البيانات!'
        });
    }

    product.isActive = false;
    await product.save();
    const bundleSync = await syncBundlesForProduct(product._id);

    res.status(200).json({
        status: 'success',
        message: '🗑️ تم تعطيل المنتج (حذف ناعم) - لن يظهر في المتجر',
        bundleSync
    });
}));

module.exports = router;
