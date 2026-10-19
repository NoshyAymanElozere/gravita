require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const { buildBundlePricing } = require('../utils/bundlePricing');

// بيانات المتجر المستخرجة من pharmaa/src/constants/data.ts (الفئات، المنتجات، الباقات، الكوبونات، التقييمات)
const catalog = require(path.join(__dirname, 'data', 'catalog.json'));

const log = (...args) => {
    if (process.env.SEED_SILENT !== 'true') console.log(...args);
};

// إنشاء أو تحديث كل بيانات المتجر (آمن للتشغيل أكثر من مرة - يعتمد على slug و code)
const seedCatalog = async () => {
    // 0. حساب الأدمن والمستخدم التجريبي
    await User.findOneAndUpdate(
        { email: 'admin@gmail.com' },
        { $setOnInsert: { name: 'الأدمن الرئيسي', email: 'admin@gmail.com', password: await bcrypt.hash('Admin', 10), role: 'admin' } },
        { upsert: true, setDefaultsOnInsert: true }
    );
    await User.findOneAndUpdate(
        { email: 'user@test.com' },
        { $setOnInsert: { name: 'مستخدم تجريبي', email: 'user@test.com', password: await bcrypt.hash('password123', 10), role: 'user' } },
        { upsert: true, setDefaultsOnInsert: true }
    );
    log('👤 admin@gmail.com (Admin) | user@test.com (password123)');

    // 1. الفئات
    const categoryIds = {};
    for (const data of catalog.categories) {
        // البحث بالـ slug أو بالاسم (للفئات القديمة التي تم ترحيلها بـ slug مختلف)
        const category = await Category.findOneAndUpdate(
            { $or: [{ slug: data.slug }, { nameEn: data.nameEn }] },
            data,
            { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
        );
        categoryIds[data.slug] = category._id;
    }
    log(`📁 ${catalog.categories.length} categories`);

    // 2. المنتجات (save() لحساب finalPrice)
    const productIds = {};
    for (const { categorySlug, isNew, stock, ratingAvg, ratingCount, ...data } of catalog.products) {
        const existing = await Product.findOne({ $or: [{ slug: data.slug }, { nameEn: data.nameEn }] });
        const product = existing || new Product({ stock, ratingAvg, ratingCount });
        // المخزون والتقييمات لا تُستبدل للمنتجات الموجودة (حتى لا يعيد تشغيل السكريبت ضبط المخزون الحقيقي)
        product.set({ ...data, isNewArrival: isNew, category: categoryIds[categorySlug], isActive: true });
        await product.save();
        productIds[data.slug] = product._id;
    }
    log(`🧴 ${catalog.products.length} products`);

    // 3. الباقات (الأسعار تُحسب من أسعار المنتجات)
    for (const data of catalog.bundles) {
        const items = data.items.map(item => ({ ...item, product: productIds[item.product] }));
        const pricing = await buildBundlePricing(items, data.discountPercentage);
        if (pricing.error) {
            throw new Error(`${data.slug}: ${pricing.error}`);
        }
        await Bundle.findOneAndUpdate(
            { slug: data.slug },
            {
                ...data,
                items: pricing.items,
                originalPrice: pricing.originalPrice,
                bundlePrice: pricing.bundlePrice,
                discountPercentage: pricing.discountPercentage,
                isActive: true
            },
            { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
        );
        log(`🎁 ${data.nameEn}: ${pricing.originalPrice} → ${pricing.bundlePrice} (-${pricing.discountPercentage}%)`);
    }

    // 4. الكوبونات
    for (const data of catalog.coupons) {
        await Coupon.findOneAndUpdate(
            { code: data.code },
            { ...data, usageLimit: null, perUserLimit: 1, isActive: true },
            { upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
    }
    log(`🏷️ ${catalog.coupons.length} coupons: ${catalog.coupons.map(c => c.code).join(', ')}`);

    // 5. التقييمات (مرتبطة بالمنتج عن طريق الاسم الإنجليزي)
    const products = await Product.find({}).select('nameEn');
    let reviewCount = 0;
    for (const data of catalog.reviews) {
        const name = data.productNameEn.toLowerCase();
        const product = products.find(p => p.nameEn.toLowerCase() === name)
            || products.find(p => name.includes(p.nameEn.toLowerCase().split(' ')[0]));
        if (!product) continue;

        await Review.findOneAndUpdate(
            { product: product._id, authorName: data.author },
            {
                product: product._id,
                authorName: data.author,
                avatar: data.avatar || '',
                rating: data.rating,
                comment: data.commentEn,
                lang: 'en',
                commentTranslation: data.commentAr,
                photo: data.userPhoto || '',
                verified: data.verified,
                helpfulCount: data.helpfulCount,
                isApproved: true
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
        reviewCount++;
    }
    log(`⭐ ${reviewCount} reviews`);

    return { categoryIds, productIds };
};

// التشغيل المباشر: npm run seed
if (require.main === module) {
    (async () => {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error('لم يتم العثور على MONGO_URI في ملف الـ .env!');
            }
            console.log('⏳ جاري الاتصال بقاعدة البيانات...');
            await mongoose.connect(process.env.MONGO_URI);
            await seedCatalog();
            console.log('\n🎉 تم تجهيز بيانات المتجر بنجاح!');
            process.exit(0);
        } catch (error) {
            console.error('❌ حدث خطأ أثناء تشغيل السكريبت:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = { seedCatalog };
