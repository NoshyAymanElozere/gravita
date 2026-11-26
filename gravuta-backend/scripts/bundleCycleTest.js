/**
 * اختبار دورة المنتج ↔ الباقة (Product ↔ Bundle cycle test)
 *
 * يُشغّل ضد سيرفر يعمل بالفعل: `npm run test:bundles`
 * يضيف المنتجات والباقات من scripts/data/catalog-extra.json عبر واجهة الأدمن (إن لم تكن موجودة)
 * ثم يتحقق من:
 *   إنشاء منتج → ظهوره في المتجر → إنشاء باقة منه → صحة التسعير
 *   → bundles/by-product → تعديل سعر المنتج يُحدّث الباقة تلقائياً → إرجاع السعر
 *   → إضافة الباقة للعربة وتسعيرها → حذف منتج/باقة مؤقتين
 */
const path = require('path');
const extra = require(path.join(__dirname, 'data', 'catalog-extra.json'));

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin';

let passed = 0;
const failures = [];
const ok = (name, cond, detail = '') => {
    if (cond) { passed++; console.log(`  ✅ ${name}`); }
    else { failures.push(`${name}${detail ? ` — ${detail}` : ''}`); console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); }
};
const section = (t) => console.log(`\n▶ ${t}`);

async function call(method, p, { token, body } = {}) {
    const res = await fetch(`${BASE}${p}`, {
        method,
        headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
        body: body !== undefined ? JSON.stringify(body) : undefined
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
}
const unwrap = (j) => j?.data?.product || j?.data?.bundle || j?.data;

async function main() {
    console.log(`Product ↔ bundle cycle test against ${BASE}`);
    const login = await call('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    if (!login.json.token) throw new Error('admin login failed');
    const admin = login.json.token;

    const cats = (await call('GET', '/categories')).json.data;
    const catId = Object.fromEntries(cats.map(c => [c.slug, c._id]));

    // ---------- 1. المنتجات ----------
    section('Create catalog products via admin API');
    const productIds = {};
    for (const { categorySlug, ...data } of extra.products) {
        const existing = await call('GET', `/products/${data.slug}`);
        if (existing.status === 200 && existing.json?.data?._id) {
            productIds[data.slug] = existing.json.data._id;
            ok(`${data.slug} already exists`, true);
            continue;
        }
        const res = await call('POST', '/admin/products', { token: admin, body: { ...data, category: catId[categorySlug] } });
        const p = unwrap(res.json);
        ok(`create ${data.slug}`, res.status === 201 && !!p?._id, res.json?.message);
        if (p?._id) productIds[data.slug] = p._id;
    }

    const shop = (await call('GET', '/products?limit=100')).json.data || [];
    ok('new products visible in the storefront list', extra.products.every(p => shop.some(s => s.slug === p.slug)));
    const pub = (await call('GET', `/products/${extra.products[1].slug}`)).json.data;
    ok('product finalPrice computed', pub?.finalPrice === (pub?.discountPrice ?? pub?.price), `final=${pub?.finalPrice}`);

    // ---------- 2. الباقات ----------
    section('Create bundles from those products');
    for (const b of extra.bundles) {
        const body = { ...b, items: b.items.map(i => ({ ...i, product: productIds[i.product] })) };
        const existing = await call('GET', `/bundles/${b.slug}`);
        let bundle = existing.status === 200 ? existing.json.data : null;
        if (!bundle) {
            const res = await call('POST', '/admin/bundles', { token: admin, body });
            bundle = unwrap(res.json);
            ok(`create bundle ${b.slug}`, res.status === 201 && !!bundle?._id, res.json?.message);
        } else ok(`${b.slug} already exists`, true);

        const expectedOriginal = b.items.reduce((s, i) => s + extra.products.find(p => p.slug === i.product).price * (i.quantity || 1), 0);
        ok(`${b.slug}: originalPrice = sum of product prices (${expectedOriginal})`, bundle?.originalPrice === expectedOriginal, `got ${bundle?.originalPrice}`);
        ok(`${b.slug}: bundlePrice = ${b.discountPercentage}% off`, bundle?.bundlePrice === Math.round(expectedOriginal * (1 - b.discountPercentage / 100)), `got ${bundle?.bundlePrice}`);
        ok(`${b.slug}: ${b.items.length} items linked`, bundle?.items?.length === b.items.length);
    }
    const pubBundles = (await call('GET', '/bundles')).json.data || [];
    ok('new bundles visible in the storefront', extra.bundles.every(b => pubBundles.some(x => x.slug === b.slug && x.available)));

    const firstProductId = productIds[extra.bundles[0].items[0].product];
    const byProduct = (await call('GET', `/bundles/by-product/${firstProductId}`)).json.data || [];
    ok('bundles/by-product finds the bundle', byProduct.some(b => b.slug === extra.bundles[0].slug));
    const adminProduct = (await call('GET', `/admin/products/${firstProductId}`, { token: admin })).json.data;
    ok('admin product view lists its bundles', (adminProduct?.bundles || []).some(b => b.slug === extra.bundles[0].slug));

    // ---------- 3. تعديل السعر يحدّث الباقة ----------
    section('Price change syncs bundle pricing');
    const target = extra.products.find(p => p.slug === extra.bundles[0].items[0].product);
    const upd = await call('PUT', `/admin/products/${firstProductId}`, { token: admin, body: { price: target.price + 20 } });
    ok('update product price', upd.status === 200, upd.json?.message);
    let synced = (await call('GET', `/bundles/${extra.bundles[0].slug}`)).json.data;
    const orig0 = extra.bundles[0].items.reduce((s, i) => s + extra.products.find(p => p.slug === i.product).price, 0);
    ok('bundle originalPrice follows new price', synced?.originalPrice === orig0 + 20, `got ${synced?.originalPrice}`);
    await call('PUT', `/admin/products/${firstProductId}`, { token: admin, body: { price: target.price } });
    synced = (await call('GET', `/bundles/${extra.bundles[0].slug}`)).json.data;
    ok('price restored and bundle re-synced', synced?.originalPrice === orig0, `got ${synced?.originalPrice}`);

    // ---------- 4. العربة ----------
    section('Customer adds the bundle to cart');
    const stamp = Date.now();
    const reg = await call('POST', '/auth/register', { body: { name: 'Bundle Test', email: `bundle-${stamp}@example.com`, password: 'Bundle#12345', phone: '+966500000002' } });
    const user = reg.json.token;
    const userId = reg.json.data?.user?.id;
    const add = await call('POST', '/cart/bundles', { token: user, body: { bundleId: synced._id, quantity: 2 } });
    ok('add bundle ×2 to cart', add.status === 200 || add.status === 201, add.json?.message);
    const cart = (await call('GET', '/cart', { token: user })).json?.data?.cart;
    const line = cart?.items?.[0];
    ok('cart bundle line priced at bundlePrice × 2', cart?.subtotal === synced.bundlePrice * 2, `subtotal=${cart?.subtotal} bundlePrice=${synced.bundlePrice}`);
    ok('cart line is a bundle', !!line && (line.type === 'bundle' || !!line.bundle), JSON.stringify(line)?.slice(0, 120));

    // ---------- 5. منتج مؤقت: إنشاء ثم حذف ----------
    section('Temporary product lifecycle');
    const tmp = await call('POST', '/admin/products', {
        token: admin,
        body: { nameEn: `Temp Test Product ${stamp}`, descriptionEn: 'Temporary product for the automated test', price: 99, stock: 5, category: catId.serums }
    });
    const tmpP = unwrap(tmp.json);
    ok('create temp product', tmp.status === 201 && !!tmpP?._id, tmp.json?.message);
    const del = await call('DELETE', `/admin/products/${tmpP?._id}`, { token: admin });
    ok('delete temp product', del.status === 200, del.json?.message);
    ok('temp product gone from store', (await call('GET', `/products/${tmpP?._id}`)).status === 404);

    await call('DELETE', `/admin/users/${userId}`, { token: admin });

    console.log(`\n${'='.repeat(50)}\nResult: ${passed} passed, ${failures.length} failed`);
    if (failures.length) { failures.forEach(f => console.log(`  • ${f}`)); process.exit(1); }
    console.log('🎉 Product ↔ bundle cycle verified.');
}

main().catch((e) => { console.error(`\n💥 ${e.message}`); process.exit(1); });
