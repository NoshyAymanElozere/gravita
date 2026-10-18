require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Bundle = require('../models/Bundle');
const { buildBundlePricing } = require('../utils/bundlePricing');

// الفئات المطلوبة (من واجهة pharmaa)
const CATEGORIES = {
    cleansers: { name: 'Cleansers', description: 'Purify, refresh and prepare your skin canvas without stripping moisture.' },
    serums: { name: 'Serums & Elixirs', description: 'Potent concentrations of active ingredients focused on deep renewal.' },
    moisturizers: { name: 'Moisturizers & Creams', description: 'Rich infusions to lock in deep hydration, rebuilding the lipid barrier.' },
    sunscreens: { name: 'Sunscreens & UV Protection', description: 'Invisible shields guarding against aging UVB/UVA rays.' },
    masks: { name: 'Face Masks & Peels', description: 'Weekly spa-grade treatments targeting intense nourishment and purification.' },
    eye_care: { name: 'Eye & Micro-Zone Care', description: 'Ultra-gentle balms and serums to firm and awaken the delicate eye contour.' }
};

// المنتجات المستخدمة داخل الباقات (الأسعار الأساسية من واجهة pharmaa)
const PRODUCTS = {
    ocean_glow: {
        name: 'Ocean Glow Hydra-Renewal Serum',
        description: 'Intense hydration complex with seaweed extract and dual-weight hyaluronic acid',
        price: 320, category: 'serums',
        image: '/assets/images/hero_skincare_banner_1781217525355.jpg'
    },
    velvet_cloud: {
        name: 'Velvet Cloud Lipid-Barrier Moisturizer',
        description: 'Rich replenishing emulsion packed with ceramides, squalane, and shea butter',
        price: 380, category: 'moisturizers',
        image: '/assets/images/product_cream_jar_1781217540516.jpg'
    },
    botanical_gel: {
        name: 'Botanical Harmony Pure Prebiotic Cleanser',
        description: 'pH-balanced foaming gel clearing environmental debris and makeup without tightness',
        price: 195, category: 'cleansers',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
    },
    solar_shield: {
        name: 'Solar Shield Invisible SPF50+ Defense',
        description: 'Broad-spectrum mineral protectant with non-greasy cashmere finishing',
        price: 250, category: 'sunscreens',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'
    },
    glacial_clay: {
        name: 'Glacial Marine Clay Detox Mask',
        description: 'British Columbian glacial clay enriched with salicylic acid and Canadian willowherb',
        price: 280, category: 'masks',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
    },
    caffeine_eye: {
        name: 'Caffeine & Peptide Micro-Sculpt Eye Balm',
        description: 'Targeted cooling balm to reduce puffiness, brighten dark circles, and lift fine wrinkles',
        price: 310, category: 'eye_care',
        image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80'
    }
};

// الباقات الثلاث من واجهة pharmaa (product = مفتاح من PRODUCTS بالأعلى)
const BUNDLES = [
    {
        slug: 'dewy-hydration-duo',
        nameEn: 'The Dewy Hydration Duo',
        nameAr: 'ثنائي الترطيب المتوهج',
        subtitleEn: 'Double-action moisture lock with Oceanic Serum & Barrier Cream',
        subtitleAr: 'قفل ترطيب مزدوج المفعول مع سيروم المحيط وكريم حاجز البشرة',
        descriptionEn: 'The ultimate skin-quenching couple. This duo works in tandem: the Hydra-Renewal Serum floods skin cells with moisture, while the Velvet Cloud Barrier Cream locks it in and seals the skin barrier for a plump, velvet finish.',
        descriptionAr: 'الثنائي المثالي لترطيب وتغذية الخلايا. يعمل هذا الزوج جنباً إلى جنب: سيروم تجديد البشرة يغمر خلايا الجلد بالرطوبة الفائقة، بينما يعمل كريم الحاجز المخملي على قفل الترطيب وترميم الطبقة الدهنية الواقية.',
        image: '/assets/images/hero_skincare_banner_1781217525355.jpg',
        discountPercentage: 15,
        benefitsEn: [
            'Boosts skin moisture levels by 85% in 3 days',
            'Provides a perfect glass-skin makeup canvas',
            'Repairs compromised lipid barriers overnight'
        ],
        benefitsAr: [
            'يرفع مستويات ترطيب البشرة بنسبة 85٪ في 3 أيام',
            'يمنحكِ بشرة زجاجية مثالية كقاعدة للمكياج',
            'يرمم حاجز الدهون المتضرر طوال فترة النوم ليلاً'
        ],
        items: [
            {
                product: 'ocean_glow',
                stepEn: 'Step 1: Deep Hydra-Renewal',
                stepAr: 'الخطوة 1: تجديد الترطيب العميق',
                benefitEn: 'Plumps skin with dual-weight hyaluronic acid molecules.',
                benefitAr: 'يملأ خلايا البشرة بجزيئات حمض الهيالورونيك ثنائية الوزن.'
            },
            {
                product: 'velvet_cloud',
                stepEn: 'Step 2: Seal & Protect Barrier',
                stepAr: 'الخطوة 2: قفل الترطيب وحماية الحاجز',
                benefitEn: 'Binds moisture and fills lipid voids with ceramides.',
                benefitAr: 'يربط جزيئات الماء داخل الخلايا ويسد الثغرات الدهنية بالسيراميد.'
            }
        ]
    },
    {
        slug: 'ultimate-restoration-routine',
        nameEn: 'The Ultimate Restoration Routine',
        nameAr: 'روتين الترميم الفائق المتكامل',
        subtitleEn: 'The full 4-step professional clinical routine for ultimate skin health',
        subtitleAr: 'الروتين السريري المهني المتكامل من 4 خطوات لصحّة البشرة الفائقة',
        descriptionEn: 'Transform your daily ritual with our flagship routine. Designed as a synergistic four-step process to cleanse, treat, hydrate, and shield your skin against aging elements and environmental pollutants.',
        descriptionAr: 'حوّلي روتينكِ اليومي مع مجموعتنا الرائدة. مصممة كعملية متكاملة تآزرية من أربع خطوات لتنظيف، علاج، ترطيب، وحماية بشرتكِ من علامات الشيخوخة والملوثات البيئية.',
        image: '/assets/images/product_cream_jar_1781217540516.jpg',
        discountPercentage: 20,
        benefitsEn: [
            'Comprehensive skincare from morning cleanse to night restoration',
            'Fades fine lines, redness, and sun damage within 14 days',
            'Reinforces natural microflora and blocks UV damage'
        ],
        benefitsAr: [
            'عناية شاملة بالبشرة تبدأ من غسول الصباح وحتى ترميم الليل',
            'يخفي الخطوط الدقيقة والاحمرار وبقع الشمس في 14 يوماً',
            'يقوي البكتيريا الحيوية النافعة ويحجب أضرار الأشعة فوق البنفسجية'
        ],
        items: [
            {
                product: 'botanical_gel',
                stepEn: 'Step 1: Cleanse',
                stepAr: 'الخطوة 1: التنظيف اللطيف',
                benefitEn: 'Purifies skin of pollutants without stripping natural moisture.',
                benefitAr: 'ينظف البشرة بلطف من الملوثات والأتربة مع الحفاظ على ترطيبها.'
            },
            {
                product: 'ocean_glow',
                stepEn: 'Step 2: Hydro-Infusion',
                stepAr: 'الخطوة 2: غمر الترطيب السيرومي',
                benefitEn: 'Provides rich oceanic seaweed nutrients and deep moisture.',
                benefitAr: 'يمنح البشرة عناصر الطحالب البحرية المغذية وترطيباً فائقاً.'
            },
            {
                product: 'velvet_cloud',
                stepEn: 'Step 3: Nourish & Rebuild',
                stepAr: 'الخطوة 3: التغذية وإعادة البناء',
                benefitEn: 'Delivers ceramides and squalane to repair skin lipids.',
                benefitAr: 'يغذي طبقات الجلد بالسيراميد والسكوالين لإعادة بناء الدهون.'
            },
            {
                product: 'solar_shield',
                stepEn: 'Step 4: Shield SPF 50+',
                stepAr: 'الخطوة 4: درع الحماية SPF 50+',
                benefitEn: 'Invisible mineral shield blocking UVA/UVB photo-aging.',
                benefitAr: 'درع معدني غير مرئي يحمي من أضرار الشمس والشيخوخة الضوئية.'
            }
        ]
    },
    {
        slug: 'clear-skin-clarifying-set',
        nameEn: 'The Clear Skin Clarifying Set',
        nameAr: 'مجموعة تنقية وتصفية البشرة',
        subtitleEn: 'Weekly detoxifying and balancing duo for clear, dynamic skin',
        subtitleAr: 'ثنائي أسبوعي لتنقية السموم وتصفية وتوازن إفراز دهون البشرة',
        descriptionEn: 'Perfect for skin prone to congestion or excessive oiliness. The prebiotic cleanser keeps daily sebum balanced, while the Glacial Marine Clay Mask acts as a weekly vacuum to clean pores and restore clarity.',
        descriptionAr: 'مثالي للبشرة المعرضة لانسداد المسام أو الإفرازات الدهنية الزائدة. يحافظ غسول البريبايوتك على توازن الدهون اليومي، بينما يعمل قناع الطين الكندي كمكنسة لتنقية المسام واستعادة إشراقة وجهكِ.',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        discountPercentage: 15,
        benefitsEn: [
            'Cleanses blackheads and reduces visible pore size',
            'Controls excessive midday oil production',
            'Provides weekly spa-grade colloidal mud purification'
        ],
        benefitsAr: [
            'ينظف الرؤوس السوداء ويقلل من القطر المرئي للمسامات الواسعة',
            'يتحكم في إفرازات الزيوت والدهون المزعجة في منتصف النهار',
            'يوفر تنقية أسبوعية احترافية بـقوة الطين الغرواني البحري'
        ],
        items: [
            {
                product: 'botanical_gel',
                stepEn: 'Daily Cleanse: Botanical Gel',
                stepAr: 'تنظيف يومي: جل نباتي متوازن',
                benefitEn: 'Maintains prebiotic defense skin flora and extracts debris.',
                benefitAr: 'يحافظ على البكتيريا الدفاعية المفيدة ويزيل الأتربة اليومية.'
            },
            {
                product: 'glacial_clay',
                stepEn: 'Weekly Detox: Marine Clay',
                stepAr: 'تقشير أسبوعي: قناع الطين البحري',
                benefitEn: 'Vacuums dead cells and tightens skin surfaces.',
                benefitAr: 'يسحب الخلايا الميتة والسموم ويشد المسامات المرتخية.'
            }
        ]
    }
];

const seedBundles = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('لم يتم العثور على MONGO_URI في ملف الـ .env!');
        }

        console.log('⏳ جاري الاتصال بقاعدة البيانات...');
        await mongoose.connect(mongoUri);
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

        // 0. التأكد من وجود الأدمن والمستخدم التجريبي
        const adminHashedPassword = await bcrypt.hash('Admin', 10);
        await User.findOneAndUpdate(
            { email: 'admin@gmail.com' },
            { name: 'الأدمن الرئيسي', email: 'admin@gmail.com', password: adminHashedPassword, role: 'admin' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('👤 تم التأكد من حساب الأدمن: admin@gmail.com (Password: Admin)');

        const userHashedPassword = await bcrypt.hash('password123', 10);
        await User.findOneAndUpdate(
            { email: 'user@test.com' },
            { name: 'مستخدم تجريبي', email: 'user@test.com', password: userHashedPassword, role: 'user' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('👤 تم التأكد من المستخدم التجريبي: user@test.com (Password: password123)');

        // 1. التأكد من وجود الفئات (البحث بالاسم، وإنشاؤها إن لم توجد)
        const categoryIds = {};
        for (const [key, cat] of Object.entries(CATEGORIES)) {
            let doc = await Category.findOne({ name: cat.name });
            if (!doc) {
                doc = await Category.create(cat);
                console.log(`📁 تم إنشاء الفئة: ${cat.name}`);
            }
            categoryIds[key] = doc._id;
        }

        // 2. التأكد من وجود المنتجات (البحث بالاسم، وإنشاؤها إن لم توجد)
        const productIds = {};
        for (const [key, prod] of Object.entries(PRODUCTS)) {
            let doc = await Product.findOne({ name: prod.name });
            if (!doc) {
                doc = await Product.create({ ...prod, category: categoryIds[prod.category] });
                console.log(`🧴 تم إنشاء المنتج: ${prod.name}`);
            }
            productIds[key] = doc._id;
        }

        // 3. إنشاء أو تحديث الباقات (حسب الـ slug) مع حساب الأسعار من أسعار المنتجات
        for (const bundleData of BUNDLES) {
            const items = bundleData.items.map(item => ({ ...item, product: productIds[item.product] }));
            const pricing = await buildBundlePricing(items, bundleData.discountPercentage);
            if (pricing.error) {
                throw new Error(`${bundleData.slug}: ${pricing.error}`);
            }

            await Bundle.findOneAndUpdate(
                { slug: bundleData.slug },
                {
                    ...bundleData,
                    items: pricing.items,
                    originalPrice: pricing.originalPrice,
                    bundlePrice: pricing.bundlePrice,
                    discountPercentage: pricing.discountPercentage,
                    isActive: true
                },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );

            console.log(`🎁 ${bundleData.nameEn}: ${pricing.originalPrice} → ${pricing.bundlePrice} (-${pricing.discountPercentage}%)`);
        }

        console.log('\n🎉 تم تجهيز الباقات بنجاح!');
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء تشغيل السكريبت:', error.message);
        process.exit(1);
    }
};

seedBundles();
