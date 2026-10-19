const Joi = require('joi');
const { objectId, slugRule } = require('./common.validation');

// الحقول المشتركة بين الإضافة والتعديل
// ملاحظة: name و description مقبولة كأسماء بديلة لـ nameEn و descriptionEn (للتوافق مع الواجهات القديمة)
const productKeys = {
    slug: slugRule,
    nameEn: Joi.string().trim().min(3).max(150).messages({
        'string.min': 'اسم المنتج يجب أن يحتوي على 3 حروف على الأقل',
        'string.max': 'اسم المنتج لا يمكن أن يتجاوز 150 حرفاً'
    }),
    nameAr: Joi.string().trim().min(2).max(150),
    subtitleEn: Joi.string().trim().max(300).allow(''),
    subtitleAr: Joi.string().trim().max(300).allow(''),
    descriptionEn: Joi.string().trim().min(5).max(3000).messages({
        'string.min': 'وصف المنتج يجب أن يحتوي على 5 حروف على الأقل'
    }),
    descriptionAr: Joi.string().trim().max(3000).allow(''),
    ingredientsEn: Joi.string().trim().max(3000).allow(''),
    ingredientsAr: Joi.string().trim().max(3000).allow(''),
    howToUseEn: Joi.string().trim().max(3000).allow(''),
    howToUseAr: Joi.string().trim().max(3000).allow(''),
    skinTypeEn: Joi.string().trim().max(200).allow(''),
    skinTypeAr: Joi.string().trim().max(200).allow(''),
    benefitsEn: Joi.array().items(Joi.string().trim()),
    benefitsAr: Joi.array().items(Joi.string().trim()),
    price: Joi.number().min(0).messages({
        'number.base': 'السعر يجب أن يكون رقماً',
        'number.min': 'السعر لا يمكن أن يكون أقل من 0'
    }),
    // null أو '' لإلغاء التخفيض
    discountPrice: Joi.number().min(0).allow(null, '').empty(''),
    size: Joi.string().trim().max(50).allow(''),
    image: Joi.string().allow('').optional(),
    galleryImages: Joi.array().items(Joi.string()),
    category: objectId('معرف الفئة'),
    stock: Joi.number().integer().min(0),
    lowStockThreshold: Joi.number().integer().min(0),
    isBestSeller: Joi.boolean(),
    isNewArrival: Joi.boolean(),
    isActive: Joi.boolean()
};

const aliases = (schema) => schema
    .rename('name', 'nameEn', { ignoreUndefined: true })
    .rename('description', 'descriptionEn', { ignoreUndefined: true })
    .rename('isNew', 'isNewArrival', { ignoreUndefined: true });

// مخطط التحقق لإضافة منتج جديد (Create Product Validation Schema)
const createProductSchema = aliases(Joi.object({
    ...productKeys,
    nameEn: productKeys.nameEn.required().messages({ 'any.required': 'اسم المنتج (nameEn) حقل إجباري' }),
    descriptionEn: productKeys.descriptionEn.required().messages({ 'any.required': 'وصف المنتج (descriptionEn) حقل إجباري' }),
    price: productKeys.price.required().messages({ 'any.required': 'سعر المنتج حقل إجباري' }),
    category: productKeys.category.required(),
    discountPrice: Joi.number().min(0).allow(null, '').empty('')
}));

// مخطط التحقق لتعديل منتج (Update Product Validation Schema)
const updateProductSchema = aliases(Joi.object({
    ...productKeys,
    discountPrice: Joi.number().min(0).allow(null, '').empty('')
})).min(1).messages({
    'object.min': 'يجب تقديم حقل واحد على الأقل للتحديث'
});

// تعديل المخزون: إما قيمة مطلقة (stock) أو إضافة/خصم (adjust)
const updateStockSchema = Joi.object({
    stock: Joi.number().integer().min(0),
    adjust: Joi.number().integer()
}).xor('stock', 'adjust').messages({
    'object.xor': 'أرسل stock (قيمة جديدة) أو adjust (زيادة/نقص) فقط'
});

// فلاتر قائمة المنتجات العامة - GET /api/products
const productQuerySchema = Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    category: Joi.string().trim(),
    skinType: Joi.string().trim(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    q: Joi.string().trim().max(100).allow(''),
    bestSeller: Joi.boolean(),
    isNew: Joi.boolean(),
    inStock: Joi.boolean(),
    sort: Joi.string().valid(
        'best-selling', 'price-low-high', 'price-high-low', 'price-asc', 'price-desc', 'newest', 'rating'
    ),
    // للأدمن فقط
    isActive: Joi.boolean()
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    productQuerySchema
};
