/**
 * توليد مجموعة Postman كاملة لكل مسارات الـ API (لا يحتاج اتصالاً بقاعدة البيانات).
 * الاستخدام: npm run postman
 *
 * - تسجيل الدخول يحفظ الـ token تلقائياً في المتغير {{token}} (و {{admin_token}} للأدمن)
 * - طلبات الإنشاء تحفظ المعرفات تلقائياً (product_id, bundle_id, order_id, address_id ...)
 * - طلبات جلب المنتجات والباقات تحفظ أول معرف في القائمة لاستخدامه في باقي الطلبات
 */
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../postman/pharmaa_gravuta.postman_collection.json');

const VARIABLES = {
    base_url: 'http://localhost:5000',
    token: '',
    admin_token: '',
    product_id: '',
    product_slug: 'ocean-glow-hydra-serum',
    category_id: '',
    category_slug: 'serums',
    bundle_id: '',
    bundle_slug: 'dewy-hydration-duo',
    address_id: '',
    order_id: '',
    review_id: '',
    coupon_id: '',
    user_id: ''
};

// سكريبت يحفظ قيمة من الرد في متغير المجموعة
const saveVar = (name, expression) =>
    `const json = pm.response.json();\ntry { const v = ${expression}; if (v) pm.collectionVariables.set('${name}', v); } catch (e) {}`;

const userAuth = { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] };
const adminAuth = { type: 'bearer', bearer: [{ key: 'token', value: '{{admin_token}}', type: 'string' }] };

/**
 * تعريف طلب واحد
 * [name, method, url, { body, auth: 'user' | 'admin', test, description }]
 */
const r = (name, method, url, opts = {}) => ({ name, method, url, ...opts });

const FOLDERS = [
    {
        name: '🔐 Auth',
        items: [
            r('Register', 'POST', '/api/auth/register', {
                body: { name: 'Sara Ahmed', email: 'sara@example.com', password: 'secret12', phone: '+966 50 111 2222' },
                test: saveVar('token', 'json.token')
            }),
            r('Login (user)', 'POST', '/api/auth/login', {
                body: { email: 'user@test.com', password: 'password123' },
                test: saveVar('token', 'json.token')
            }),
            r('Login (admin)', 'POST', '/api/auth/login', {
                body: { email: 'admin@gmail.com', password: 'Admin' },
                test: saveVar('admin_token', 'json.token')
            }),
            r('Current user (restore session)', 'GET', '/api/auth/me', { auth: 'user' })
        ]
    },
    {
        name: '🛍️ Catalog',
        items: [
            r('Store config (payments, bank IBAN, shipping)', 'GET', '/api/config'),
            r('Categories (with productCount)', 'GET', '/api/categories', {
                test: saveVar('category_id', 'json.data[0]._id')
            }),
            r('Category by slug', 'GET', '/api/categories/{{category_slug}}'),
            r('Products (shop filters)', 'GET', '/api/products?category=serums&skinType=dry&minPrice=0&maxPrice=500&sort=best-selling&page=1&limit=12', {
                description: 'sort: best-selling | price-low-high | price-high-low | newest | rating. Also: q, bestSeller, isNew, inStock',
                test: saveVar('product_id', 'json.data[0]._id')
            }),
            r('Search products', 'GET', '/api/products?q=serum'),
            r('Best sellers (home)', 'GET', '/api/products?bestSeller=true&limit=8'),
            r('New arrivals (home)', 'GET', '/api/products?isNew=true&sort=newest&limit=8'),
            r('Product by slug', 'GET', '/api/products/{{product_slug}}', {
                test: saveVar('product_id', 'json.data._id')
            }),
            r('Related products', 'GET', '/api/products/{{product_id}}/related?limit=4'),
            r('Product reviews', 'GET', '/api/products/{{product_id}}/reviews?page=1&limit=10'),
            r('Bundles', 'GET', '/api/bundles', {
                test: saveVar('bundle_id', 'json.data[0]._id')
            }),
            r('Bundle by slug', 'GET', '/api/bundles/{{bundle_slug}}'),
            r('Bundles containing product (upsell)', 'GET', '/api/bundles/by-product/{{product_id}}'),
            r('Featured reviews (home)', 'GET', '/api/reviews/featured?limit=6'),
            r('Newsletter subscribe', 'POST', '/api/newsletter', { body: { email: 'news@example.com', lang: 'en' } })
        ]
    },
    {
        name: '👤 Profile',
        items: [
            r('Get profile', 'GET', '/api/users/me', { auth: 'user' }),
            r('Update profile', 'PUT', '/api/users/me', { auth: 'user', body: { name: 'Sara A.', phone: '+966 50 111 3333' } }),
            r('Change password', 'PUT', '/api/users/me/password', {
                auth: 'user',
                body: { currentPassword: 'password123', newPassword: 'password456' },
                test: saveVar('token', 'json.token')
            }),
            r('List addresses', 'GET', '/api/users/me/addresses', { auth: 'user' }),
            r('Add address', 'POST', '/api/users/me/addresses', {
                auth: 'user',
                body: { fullName: 'Sara Ahmed', phone: '+966501112222', addressLine1: '7821 Al Reem Blvd', addressLine2: 'Floor 14', city: 'Riyadh', state: 'Central', postalCode: '12282', country: 'Saudi Arabia', isDefault: true },
                test: saveVar('address_id', 'json.data.address._id')
            }),
            r('Update address', 'PUT', '/api/users/me/addresses/{{address_id}}', { auth: 'user', body: { city: 'Jeddah' } }),
            r('Set default address', 'PATCH', '/api/users/me/addresses/{{address_id}}/default', { auth: 'user' }),
            r('Delete address', 'DELETE', '/api/users/me/addresses/{{address_id}}', { auth: 'user' }),
            r('Wishlist', 'GET', '/api/users/me/wishlist', { auth: 'user' }),
            r('Add to wishlist', 'POST', '/api/users/me/wishlist/{{product_id}}', { auth: 'user' }),
            r('Remove from wishlist', 'DELETE', '/api/users/me/wishlist/{{product_id}}', { auth: 'user' }),
            r('Delete my account', 'DELETE', '/api/users/me', { auth: 'user' })
        ]
    },
    {
        name: '🛒 Cart',
        items: [
            r('Get cart (priced)', 'GET', '/api/cart?paymentMethod=cod', { auth: 'user' }),
            r('Add product', 'POST', '/api/cart', { auth: 'user', body: { productId: '{{product_id}}', quantity: 1 } }),
            r('Update product quantity', 'PUT', '/api/cart', { auth: 'user', body: { productId: '{{product_id}}', quantity: 2 } }),
            r('Remove product', 'DELETE', '/api/cart/{{product_id}}', { auth: 'user' }),
            r('Add bundle', 'POST', '/api/cart/bundles', { auth: 'user', body: { bundleId: '{{bundle_id}}', quantity: 1 } }),
            r('Update bundle quantity', 'PUT', '/api/cart/bundles', { auth: 'user', body: { bundleId: '{{bundle_id}}', quantity: 2 } }),
            r('Remove bundle', 'DELETE', '/api/cart/bundles/{{bundle_id}}', { auth: 'user' }),
            r('Apply coupon', 'POST', '/api/cart/coupon', { auth: 'user', body: { code: 'AURA20' } }),
            r('Remove coupon', 'DELETE', '/api/cart/coupon', { auth: 'user' }),
            r('Merge guest cart', 'POST', '/api/cart/merge', {
                auth: 'user',
                body: { items: [{ itemType: 'product', id: '{{product_id}}', quantity: 1 }, { itemType: 'bundle', id: '{{bundle_id}}', quantity: 1 }] }
            }),
            r('Clear cart', 'DELETE', '/api/cart', { auth: 'user' })
        ]
    },
    {
        name: '📦 Orders',
        items: [
            r('Place order (saved address)', 'POST', '/api/orders', {
                auth: 'user',
                body: { addressId: '{{address_id}}', paymentMethod: 'bank_transfer', notes: 'Please call before delivery' },
                test: saveVar('order_id', 'json.data.order._id')
            }),
            r('Place order (new address)', 'POST', '/api/orders', {
                auth: 'user',
                body: {
                    address: { fullName: 'Sara Ahmed', phone: '+966501112222', addressLine1: 'Tahlia St 42A', city: 'Jeddah', postalCode: '21563' },
                    saveAddress: true,
                    contact: { name: 'Sara Ahmed', email: 'sara@example.com', phone: '+966501112222' },
                    paymentMethod: 'cod'
                },
                test: saveVar('order_id', 'json.data.order._id')
            }),
            r('My orders', 'GET', '/api/orders/my-orders?status=&page=1&limit=10', {
                auth: 'user',
                description: 'status: pending | confirmed | processing | shipped (or in-transit) | delivered | cancelled | return_requested | returned'
            }),
            r('Order details', 'GET', '/api/orders/{{order_id}}', { auth: 'user' }),
            r('Cancel order', 'PATCH', '/api/orders/{{order_id}}/cancel', { auth: 'user', body: { reason: 'Changed my mind' } }),
            r('Request return', 'POST', '/api/orders/{{order_id}}/return', { auth: 'user', body: { reason: 'The product arrived damaged' } }),
            r('Reorder (buy again)', 'POST', '/api/orders/{{order_id}}/reorder', { auth: 'user' })
        ]
    },
    {
        name: '⭐ Reviews',
        items: [
            r('Add / update my review', 'POST', '/api/products/{{product_id}}/reviews', {
                auth: 'user',
                body: { rating: 5, comment: 'My skin has never felt better!', lang: 'en' },
                test: saveVar('review_id', 'json.data._id')
            }),
            r('Delete my review', 'DELETE', '/api/products/{{product_id}}/reviews', { auth: 'user' }),
            r('Mark review helpful (toggle)', 'POST', '/api/reviews/{{review_id}}/helpful', { auth: 'user' })
        ]
    },
    {
        name: '🛠️ Admin',
        items: [
            r('Dashboard stats', 'GET', '/api/admin/stats?days=30', { auth: 'admin' }),
            r('Sales report (JSON)', 'GET', '/api/admin/stats/report?from=2026-01-01&to=2026-12-31', { auth: 'admin' }),
            r('Sales report (CSV export)', 'GET', '/api/admin/stats/report?from=2026-01-01&to=2026-12-31&format=csv', { auth: 'admin' }),

            r('Products (all, incl. inactive)', 'GET', '/api/admin/products?page=1&limit=20', { auth: 'admin' }),
            r('Product details (+ bundles)', 'GET', '/api/admin/products/{{product_id}}', { auth: 'admin' }),
            r('Create product', 'POST', '/api/admin/products', {
                auth: 'admin',
                description: 'Use form-data to upload image (field "image") and up to 6 gallery images ("galleryImages"). Arrays (benefitsEn...) as JSON strings in form-data.',
                body: {
                    slug: 'rose-water-toner', nameEn: 'Rose Water Toner', nameAr: 'تونر ماء الورد',
                    subtitleEn: 'Hydrating floral toner', subtitleAr: 'تونر مرطب بماء الورد',
                    descriptionEn: 'A gentle toner that balances and hydrates.', descriptionAr: 'تونر لطيف يوازن ويرطب البشرة.',
                    ingredientsEn: 'Rosa Damascena Water, Glycerin', ingredientsAr: 'ماء الورد الدمشقي، الجلسرين',
                    howToUseEn: 'Apply with a cotton pad.', howToUseAr: 'يوضع بقطنة على الوجه.',
                    skinTypeEn: 'All, Sensitive', skinTypeAr: 'جميع الأنواع، الحساسة',
                    benefitsEn: ['Balances pH'], benefitsAr: ['يوازن الحموضة'],
                    price: 150, discountPrice: 120, size: '200ml',
                    category: '{{category_id}}', stock: 50, isBestSeller: false, isNew: true
                },
                test: saveVar('product_id', 'json.data._id')
            }),
            r('Update product (price change re-prices bundles)', 'PUT', '/api/admin/products/{{product_id}}', {
                auth: 'admin', body: { price: 160, discountPrice: null }
            }),
            r('Set stock', 'PATCH', '/api/admin/products/{{product_id}}/stock', { auth: 'admin', body: { stock: 100 } }),
            r('Adjust stock', 'PATCH', '/api/admin/products/{{product_id}}/stock', { auth: 'admin', body: { adjust: -5 } }),
            r('Deactivate product (soft delete)', 'DELETE', '/api/admin/products/{{product_id}}', { auth: 'admin' }),
            r('Delete product permanently', 'DELETE', '/api/admin/products/{{product_id}}?hard=true', { auth: 'admin' }),

            r('Categories (all)', 'GET', '/api/admin/categories', { auth: 'admin' }),
            r('Create category', 'POST', '/api/admin/categories', {
                auth: 'admin',
                body: { slug: 'body-care', nameEn: 'Body Care', nameAr: 'العناية بالجسم', descriptionEn: 'Lotions and oils', descriptionAr: 'لوشن وزيوت', sortOrder: 7 },
                test: saveVar('category_id', 'json.data._id')
            }),
            r('Update category', 'PUT', '/api/admin/categories/{{category_id}}', { auth: 'admin', body: { isActive: true } }),
            r('Delete category', 'DELETE', '/api/admin/categories/{{category_id}}', { auth: 'admin' }),

            r('Bundles (all)', 'GET', '/api/admin/bundles', { auth: 'admin' }),
            r('Bundle details', 'GET', '/api/admin/bundles/{{bundle_id}}', { auth: 'admin' }),
            r('Create bundle', 'POST', '/api/admin/bundles', {
                auth: 'admin',
                body: {
                    slug: 'glow-starter-kit', nameEn: 'Glow Starter Kit', nameAr: 'مجموعة الإشراقة',
                    descriptionEn: 'Cleanse and hydrate.', descriptionAr: 'تنظيف وترطيب.',
                    discountPercentage: 10,
                    items: [
                        { product: '<PRODUCT_ID_1>', stepEn: 'Step 1: Cleanse', stepAr: 'الخطوة 1: التنظيف', benefitEn: 'Removes impurities', benefitAr: 'يزيل الشوائب', quantity: 1 },
                        { product: '<PRODUCT_ID_2>', stepEn: 'Step 2: Hydrate', stepAr: 'الخطوة 2: الترطيب', benefitEn: 'Deep hydration', benefitAr: 'ترطيب عميق', quantity: 1 }
                    ],
                    benefitsEn: ['Glowing skin'], benefitsAr: ['بشرة مشرقة']
                },
                test: saveVar('bundle_id', 'json.data._id')
            }),
            r('Update bundle', 'PUT', '/api/admin/bundles/{{bundle_id}}', { auth: 'admin', body: { discountPercentage: 20 } }),
            r('Recalculate bundle price', 'PATCH', '/api/admin/bundles/{{bundle_id}}/recalculate', { auth: 'admin' }),
            r('Delete bundle', 'DELETE', '/api/admin/bundles/{{bundle_id}}', { auth: 'admin' }),

            r('Orders', 'GET', '/api/admin/orders?status=pending&q=&page=1&limit=20', { auth: 'admin' }),
            r('Order details (+ allowed transitions)', 'GET', '/api/admin/orders/{{order_id}}', { auth: 'admin' }),
            r('Update order status', 'PUT', '/api/admin/orders/{{order_id}}/status', {
                auth: 'admin',
                description: 'pending → confirmed/processing/shipped/cancelled; shipped → delivered; delivered → returned; return_requested → returned/delivered',
                body: { status: 'shipped', note: 'Handed to courier', trackingNumber: '' }
            }),
            r('Update payment status (confirm bank transfer)', 'PATCH', '/api/admin/orders/{{order_id}}/payment', {
                auth: 'admin',
                body: { paymentStatus: 'paid', paymentRef: 'TRX-123456' }
            }),

            r('Users', 'GET', '/api/admin/users?q=&role=user', { auth: 'admin', test: saveVar('user_id', 'json.data[0]._id') }),
            r('User details (+ stats)', 'GET', '/api/admin/users/{{user_id}}', { auth: 'admin' }),
            r('Create user', 'POST', '/api/admin/users', { auth: 'admin', body: { name: 'New Staff', email: 'staff@example.com', password: 'secret12', role: 'admin' } }),
            r('Update user', 'PUT', '/api/admin/users/{{user_id}}', { auth: 'admin', body: { isActive: false } }),
            r('Delete user', 'DELETE', '/api/admin/users/{{user_id}}', { auth: 'admin' }),

            r('Coupons', 'GET', '/api/admin/coupons', { auth: 'admin' }),
            r('Create coupon', 'POST', '/api/admin/coupons', {
                auth: 'admin',
                body: { code: 'EID30', discountType: 'percentage', value: 30, maxDiscount: 150, minOrderAmount: 200, usageLimit: 500, perUserLimit: 1, expiresAt: '2026-12-31T23:59:59.000Z', descriptionEn: 'Eid offer', descriptionAr: 'عرض العيد' },
                test: saveVar('coupon_id', 'json.data._id')
            }),
            r('Update coupon', 'PUT', '/api/admin/coupons/{{coupon_id}}', { auth: 'admin', body: { isActive: false } }),
            r('Delete coupon', 'DELETE', '/api/admin/coupons/{{coupon_id}}', { auth: 'admin' }),

            r('Reviews (moderation)', 'GET', '/api/admin/reviews?isApproved=true', { auth: 'admin' }),
            r('Hide / show review', 'PATCH', '/api/admin/reviews/{{review_id}}', { auth: 'admin', body: { isApproved: false } }),
            r('Delete review', 'DELETE', '/api/admin/reviews/{{review_id}}', { auth: 'admin' }),
            r('Newsletter subscribers', 'GET', '/api/admin/newsletter', { auth: 'admin' })
        ]
    }
];

const toPostmanItem = ({ name, method, url, body, auth, test, description }) => {
    const [pathPart, queryPart] = url.split('?');
    const item = {
        name,
        request: {
            method,
            header: body ? [{ key: 'Content-Type', value: 'application/json' }] : [],
            url: {
                raw: `{{base_url}}${url}`,
                host: ['{{base_url}}'],
                path: pathPart.split('/').filter(Boolean),
                ...(queryPart && {
                    query: queryPart.split('&').map(pair => {
                        const [key, value = ''] = pair.split('=');
                        return { key, value };
                    })
                })
            },
            ...(description && { description }),
            ...(auth === 'user' && { auth: userAuth }),
            ...(auth === 'admin' && { auth: adminAuth }),
            ...(body && { body: { mode: 'raw', raw: JSON.stringify(body, null, 4), options: { raw: { language: 'json' } } } })
        }
    };
    if (test) {
        item.event = [{ listen: 'test', script: { type: 'text/javascript', exec: test.split('\n') } }];
    }
    return item;
};

const collection = {
    info: {
        name: 'Pharmaa × Gravuta API',
        description: 'كل مسارات الـ API المطلوبة لواجهة pharmaa. ابدأ بـ Auth → Login (user) و Login (admin) ثم Catalog لحفظ المعرفات تلقائياً.',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: FOLDERS.map(folder => ({ name: folder.name, item: folder.items.map(toPostmanItem) })),
    variable: Object.entries(VARIABLES).map(([key, value]) => ({ key, value, type: 'string' }))
};

fs.writeFileSync(OUTPUT, JSON.stringify(collection, null, '\t'), 'utf8');
const total = FOLDERS.reduce((sum, f) => sum + f.items.length, 0);
console.log(`✅ ${total} requests → ${path.relative(process.cwd(), OUTPUT)}`);
