require('dotenv').config();
const dns = require('dns');

// ضبط خوادم الـ DNS لتفادي مشاكل الاتصال بـ MongoDB Atlas على الويندوز
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * ترحيل البيانات الموجودة إلى المخطط الجديد (مرة واحدة):
 * - الفئات والمنتجات: name/description => nameEn/nameAr/descriptionEn/descriptionAr + slug
 * - المنتجات: finalPrice + stock (افتراضياً --stock=100 للمنتجات التي لا تملك مخزوناً)
 * - الطلبات القديمة: عنوان نصي => كائن عنوان، totalPrice => subtotal/total، أسماء المنتجات، رقم الطلب...
 * - مزامنة الفهارس (حذف الفهرس القديم name_1 من الفئات)
 *
 * الاستخدام:
 *   npm run migrate -- --dry-run     (عرض ما سيتم تعديله فقط)
 *   npm run migrate -- --stock=50
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const { slugify } = require('../utils/helpers');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DEFAULT_STOCK = Number((args.find(a => a.startsWith('--stock=')) || '--stock=100').split('=')[1]);

const PAYMENT_MAP = { COD: 'cod', Card: 'credit_card' };

const uniqueSlug = async (collection, base, id) => {
    let slug = base || `item-${String(id).slice(-6)}`;
    let n = 1;
    while (await collection.findOne({ slug, _id: { $ne: id } })) {
        slug = `${base}-${++n}`;
    }
    return slug;
};

const migrateNamed = async (collection, label, extra = () => ({})) => {
    const docs = await collection.find({ nameEn: { $exists: false } }).toArray();
    console.log(`\n${label}: ${docs.length} document(s) to migrate`);

    for (const doc of docs) {
        const name = doc.name || `Untitled ${label}`;
        const description = doc.description || '';
        const update = {
            $set: {
                nameEn: name,
                nameAr: name,
                descriptionEn: description,
                descriptionAr: description,
                slug: doc.slug || await uniqueSlug(collection, slugify(name), doc._id),
                isActive: doc.isActive ?? true,
                ...extra(doc)
            },
            $unset: { name: '', description: '' }
        };
        console.log(`  • ${name} → ${update.$set.slug}`);
        if (!DRY_RUN) await collection.updateOne({ _id: doc._id }, update);
    }
};

const migrateOrders = async (db) => {
    const orders = db.collection('orders');
    const products = db.collection('products');
    const users = db.collection('users');
    const docs = await orders.find({ orderNumber: { $exists: false } }).toArray();
    console.log(`\nOrders: ${docs.length} document(s) to migrate`);

    for (const order of docs) {
        const user = await users.findOne({ _id: order.user });
        const items = [];
        for (const item of order.items || []) {
            const unitPrice = item.unitPrice ?? item.price ?? 0;
            const line = { ...item, unitPrice, lineTotal: unitPrice * item.quantity };
            delete line.price;

            if (item.itemType === 'bundle') {
                line.nameEn = item.bundleSnapshot?.nameEn || 'Bundle';
                line.nameAr = item.bundleSnapshot?.nameAr || line.nameEn;
                if (line.bundleSnapshot) {
                    line.bundleSnapshot = {
                        originalPrice: item.bundleSnapshot.originalPrice,
                        discountPercentage: item.bundleSnapshot.discountPercentage,
                        items: (item.bundleSnapshot.items || []).map(bi => ({
                            product: bi.product,
                            nameEn: bi.nameEn || bi.name,
                            nameAr: bi.nameAr || bi.name,
                            quantity: bi.quantity,
                            stepEn: bi.stepEn,
                            stepAr: bi.stepAr
                        }))
                    };
                }
            } else {
                const product = await products.findOne({ _id: item.product });
                line.nameEn = product?.nameEn || product?.name || 'Product';
                line.nameAr = product?.nameAr || line.nameEn;
                line.image = product?.image || '';
            }
            items.push(line);
        }

        const total = order.totalPrice ?? items.reduce((sum, i) => sum + i.lineTotal, 0);
        const address = typeof order.shippingAddress === 'string'
            ? {
                fullName: user?.name || 'Customer',
                phone: order.phone || '',
                addressLine1: order.shippingAddress,
                addressLine2: '',
                city: '-',
                state: '',
                postalCode: '',
                country: 'Saudi Arabia'
            }
            : order.shippingAddress;

        const update = {
            $set: {
                orderNumber: `AURA-${crypto.randomInt(100000, 1000000)}`,
                items,
                shippingAddress: address,
                contact: { name: user?.name || '', email: user?.email || '', phone: order.phone || '' },
                paymentMethod: PAYMENT_MAP[order.paymentMethod] || order.paymentMethod || 'cod',
                paymentStatus: order.status === 'delivered' ? 'paid' : 'pending',
                subtotal: total,
                discount: 0,
                shippingFee: 0,
                codFee: 0,
                total,
                statusHistory: [{ status: order.status, at: order.updatedAt || order.createdAt, note: 'Migrated' }],
                stockRestored: order.status === 'cancelled'
            },
            $unset: { totalPrice: '', phone: '' }
        };
        console.log(`  • ${order._id} → ${update.$set.orderNumber} (${total})`);
        if (!DRY_RUN) await orders.updateOne({ _id: order._id }, update);
    }
};

(async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('لم يتم العثور على MONGO_URI في ملف الـ .env!');
        }
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        console.log(DRY_RUN ? '🔍 DRY RUN - لن يتم حفظ أي تغيير' : '✍️ جاري ترحيل البيانات...');

        await migrateNamed(db.collection('categories'), 'Categories', () => ({ sortOrder: 0 }));
        await migrateNamed(db.collection('products'), 'Products', (doc) => ({
            finalPrice: doc.discountPrice ?? doc.price,
            stock: doc.stock ?? DEFAULT_STOCK
        }));
        await migrateOrders(db);

        if (!DRY_RUN) {
            // حذف الفهارس القديمة (مثل name_1 في الفئات) وإنشاء الفهارس الجديدة
            for (const name of ['Category', 'Product', 'User', 'Cart', 'Bundle', 'Order', 'Coupon', 'Review', 'NewsletterSubscriber']) {
                const model = require(`../models/${name}`);
                const dropped = await model.syncIndexes();
                console.log(`🗂️ ${name}: indexes synced${dropped.length ? ` (dropped: ${dropped.join(', ')})` : ''}`);
            }
        }

        console.log('\n🎉 تم الانتهاء من الترحيل');
        process.exit(0);
    } catch (error) {
        console.error('❌ فشل الترحيل:', error.message);
        process.exit(1);
    }
})();
