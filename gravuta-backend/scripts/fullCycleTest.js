/**
 * اختبار الدورة الكاملة للمتجر (Full e-commerce cycle test)
 *
 * يُشغّل ضد سيرفر يعمل بالفعل: `npm run dev` ثم في نافذة أخرى `npm run test:cycle`
 * يحتاج بيانات seed (منتجات وباقات): `npm run seed`
 *
 * الدورة المُختبرة:
 *   health → config (IBAN) → تسجيل عميل جديد → عربة (منتج + باقة) → كوبون
 *   → طلب بتحويل بنكي → خصم المخزون → الأدمن: تأكيد الدفع → confirmed → shipped → delivered
 *   → طلب ثاني COD → إلغاؤه من الأدمن → إعادة المخزون
 *   → إحصائيات + تقرير JSON + تصدير CSV
 *   → الأدمن يغيّر كلمة مرور العميل → القديمة ترفض والجديدة تعمل
 *
 * ملاحظة: يُنشئ بيانات حقيقية في قاعدة البيانات (عميل + طلبان). مخصص لبيئة التطوير.
 */

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin';

let passed = 0;
let failed = 0;
const failures = [];

const ok = (name, cond, detail = '') => {
    if (cond) {
        passed++;
        console.log(`  ✅ ${name}`);
    } else {
        failed++;
        failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
        console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    }
};

const section = (title) => console.log(`\n▶ ${title}`);

async function call(method, path, { token, body, raw } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            ...(body !== undefined && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
    });
    if (raw) return { status: res.status, text: await res.text() };
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
}

async function main() {
    console.log(`Full cycle test against ${BASE}`);

    // ---------- 0. السيرفر والإعدادات ----------
    section('Server & public config');
    const health = await call('GET', '/health');
    ok('GET /health responds', health.status === 200);

    const config = await call('GET', '/config');
    ok('GET /config responds', config.status === 200);
    const payments = config.json?.data?.payments;
    ok('config lists cod + bank_transfer', Array.isArray(payments?.methods) && payments.methods.includes('cod') && payments.methods.includes('bank_transfer'));
    ok('config has bank IBAN for transfers', !!payments?.bankTransfer?.iban, JSON.stringify(payments?.bankTransfer));

    // ---------- 1. تسجيل دخول الأدمن ----------
    section('Admin sign-in');
    const adminLogin = await call('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    ok('admin login', adminLogin.status === 200 && !!adminLogin.json.token, adminLogin.json.message);
    if (!adminLogin.json.token) throw new Error('Cannot continue without admin token (set ADMIN_EMAIL / ADMIN_PASSWORD)');
    const admin = adminLogin.json.token;

    // ---------- 2. تسجيل عميل جديد ----------
    section('Customer registration & login');
    const stamp = Date.now();
    const email = `cycle-${stamp}@example.com`;
    const password = 'Cycle#12345';
    const reg = await call('POST', '/auth/register', {
        body: { name: 'Cycle Test Customer', email, password, phone: '+966500000001' }
    });
    ok('register new customer', reg.status === 201 && !!reg.json.token, reg.json.message);
    let user = reg.json.token;
    const userId = reg.json.data?.user?.id;

    // ---------- 3. الكتالوج ----------
    section('Catalog');
    const productsRes = await call('GET', '/products?limit=50');
    const products = productsRes.json?.data || [];
    ok('products listed', productsRes.status === 200 && products.length > 0, `count=${products.length}`);
    const product = products.find(p => (p.stock ?? 0) >= 3 && p.isActive !== false);
    ok('found an in-stock product', !!product, 'seed the database first: npm run seed');

    const bundlesRes = await call('GET', '/bundles');
    const bundles = bundlesRes.json?.data || [];
    const bundle = bundles.find(b => b.available && (b.maxQuantity ?? 0) >= 1);
    ok('bundles listed with availability', bundlesRes.status === 200 && bundles.length > 0, `count=${bundles.length}`);
    ok('found an available bundle', !!bundle);
    if (!product || !bundle) throw new Error('Catalog is missing sellable items — run: npm run seed');

    const productId = product._id || product.id;
    const bundleId = bundle._id || bundle.id;
    const stockBefore = product.stock;

    // ---------- 4. العربة ----------
    section('Cart (product + bundle + coupon)');
    const addP = await call('POST', '/cart', { token: user, body: { productId, quantity: 2 } });
    ok('add product to cart', addP.status === 200 || addP.status === 201, addP.json?.message);
    const addB = await call('POST', '/cart/bundles', { token: user, body: { bundleId, quantity: 1 } });
    ok('add bundle to cart', addB.status === 200 || addB.status === 201, addB.json?.message);

    const cart1 = await call('GET', '/cart?paymentMethod=bank_transfer', { token: user });
    const cartData = cart1.json?.data?.cart;
    ok('cart priced (2 lines)', cart1.status === 200 && cartData?.items?.length === 2, `items=${cartData?.items?.length}`);
    ok('bank transfer has no COD fee', cartData?.codFee === 0, `codFee=${cartData?.codFee}`);

    let couponApplied = false;
    if ((cartData?.subtotal ?? 0) >= 150) {
        const coupon = await call('POST', '/cart/coupon', { token: user, body: { code: 'AURA20' } });
        couponApplied = coupon.status === 200 && !!coupon.json?.data?.cart?.coupon?.valid;
        ok('apply coupon AURA20', couponApplied || coupon.status === 400, coupon.json?.message);
        if (!couponApplied) console.log('  (coupon not applied — continuing without it)');
    }

    // ---------- 5. الطلب الأول: تحويل بنكي ----------
    section('Order #1 — bank transfer to IBAN');
    const cartPriced = (await call('GET', '/cart?paymentMethod=bank_transfer', { token: user })).json?.data?.cart;
    const orderRes = await call('POST', '/orders', {
        token: user,
        body: {
            address: {
                fullName: 'Cycle Test Customer',
                phone: '+966500000001',
                addressLine1: '12 Test Street',
                city: 'Riyadh',
                state: 'Central',
                postalCode: '12282',
                country: 'Saudi Arabia'
            },
            contact: { name: 'Cycle Test Customer', email, phone: '+966500000001' },
            paymentMethod: 'bank_transfer',
            notes: 'Automated full-cycle test order'
        }
    });
    const order1 = orderRes.json?.data?.order;
    ok('place bank_transfer order', orderRes.status === 201 && !!order1, orderRes.json?.message);
    ok('order starts pending / payment pending', order1?.status === 'pending' && order1?.paymentStatus === 'pending');
    ok('order total matches cart total', order1?.total === cartPriced?.total, `order=${order1?.total} cart=${cartPriced?.total}`);
    ok('order has no COD fee', (order1?.codFee ?? 0) === 0);
    if (couponApplied) ok('coupon recorded on order', !!order1?.coupon?.code, JSON.stringify(order1?.coupon));

    const prodAfter = (await call('GET', `/products/${productId}`)).json?.data;
    const bundleUse = (bundle.items || []).find(i => String(i.product?._id || i.product) === String(productId));
    const expectedDrop = 2 + (bundleUse ? (bundleUse.quantity || 1) : 0);
    ok('stock decreased after order', prodAfter?.stock === stockBefore - expectedDrop, `before=${stockBefore} after=${prodAfter?.stock} expectedDrop=${expectedDrop}`);

    // ---------- 6. الأدمن يدير الطلب ----------
    section('Admin: confirm payment & fulfil');
    const found = await call('GET', `/admin/orders?q=${order1.orderNumber}`, { token: admin });
    ok('admin finds order by number', found.status === 200 && (found.json?.data?.orders || []).some(o => o.orderNumber === order1.orderNumber));

    const pay = await call('PATCH', `/admin/orders/${order1._id}/payment`, { token: admin, body: { paymentStatus: 'paid', paymentRef: `TRX-${stamp}` } });
    ok('mark bank transfer as paid', pay.status === 200 && pay.json?.data?.order?.paymentStatus === 'paid', pay.json?.message);
    ok('payment reference stored', pay.json?.data?.order?.paymentRef === `TRX-${stamp}`);

    let st = await call('PUT', `/admin/orders/${order1._id}/status`, { token: admin, body: { status: 'confirmed', note: 'Transfer received' } });
    ok('pending → confirmed', st.status === 200 && st.json?.data?.order?.status === 'confirmed', st.json?.message);
    st = await call('PUT', `/admin/orders/${order1._id}/status`, { token: admin, body: { status: 'shipped' } });
    const shippedOrder = st.json?.data?.order;
    ok('confirmed → shipped (tracking auto-generated)', st.status === 200 && shippedOrder?.status === 'shipped' && !!shippedOrder?.trackingNumber, st.json?.message);
    st = await call('PUT', `/admin/orders/${order1._id}/status`, { token: admin, body: { status: 'delivered' } });
    ok('shipped → delivered', st.status === 200 && st.json?.data?.order?.status === 'delivered', st.json?.message);

    const bad = await call('PUT', `/admin/orders/${order1._id}/status`, { token: admin, body: { status: 'pending' } });
    ok('invalid transition rejected', bad.status === 400);

    // ---------- 7. الطلب الثاني: COD ثم إلغاء ----------
    section('Order #2 — COD, then admin cancels (stock restored)');
    await call('POST', '/cart', { token: user, body: { productId, quantity: 1 } });
    const codCart = (await call('GET', '/cart?paymentMethod=cod', { token: user })).json?.data?.cart;
    ok('COD fee applied in cart', (codCart?.codFee ?? 0) > 0, `codFee=${codCart?.codFee}`);
    const order2Res = await call('POST', '/orders', {
        token: user,
        body: {
            address: {
                fullName: 'Cycle Test Customer',
                phone: '+966500000001',
                addressLine1: '12 Test Street',
                city: 'Riyadh',
                state: 'Central',
                postalCode: '12282',
                country: 'Saudi Arabia'
            },
            paymentMethod: 'cod'
        }
    });
    const order2 = order2Res.json?.data?.order;
    ok('place COD order', order2Res.status === 201 && !!order2, order2Res.json?.message);
    ok('COD fee on order', (order2?.codFee ?? 0) > 0);

    const stockMid = (await call('GET', `/products/${productId}`)).json?.data?.stock;
    const cancel = await call('PUT', `/admin/orders/${order2._id}/status`, { token: admin, body: { status: 'cancelled', note: 'Test cleanup' } });
    ok('admin cancels COD order', cancel.status === 200 && cancel.json?.data?.order?.status === 'cancelled', cancel.json?.message);
    const stockRestored = (await call('GET', `/products/${productId}`)).json?.data?.stock;
    ok('stock restored after cancel', stockRestored === stockMid + 1, `mid=${stockMid} restored=${stockRestored}`);

    // ---------- 8. العميل يرى طلباته ----------
    section('Customer order history');
    const myOrders = await call('GET', '/orders/my-orders', { token: user });
    const myList = myOrders.json?.data?.orders || [];
    ok('customer sees both orders', myOrders.status === 200 && myList.length === 2, `count=${myList.length}`);

    // ---------- 9. الإحصائيات والتقارير ----------
    section('Stats & reports');
    const stats = await call('GET', '/admin/stats?days=30', { token: admin });
    ok('admin stats respond', stats.status === 200 && !!stats.json?.data?.revenue);
    ok('stats count the delivered order', (stats.json?.data?.ordersByStatus?.delivered ?? 0) >= 1);

    const today = new Date().toISOString().slice(0, 10);
    const report = await call('GET', `/admin/stats/report?from=${today}&to=${today}`, { token: admin });
    const rep = report.json?.data;
    ok('report responds', report.status === 200 && !!rep?.summary);
    ok('report counts today\'s order', (rep?.summary?.orders ?? 0) >= 1, `orders=${rep?.summary?.orders}`);
    ok('report breaks down by payment method', !!rep?.byPaymentMethod?.bank_transfer, JSON.stringify(rep?.byPaymentMethod));
    ok('report lists top sellers', Array.isArray(rep?.topProducts) && rep.topProducts.length > 0);

    const csv = await call('GET', `/admin/stats/report?from=${today}&to=${today}&format=csv`, { token: admin, raw: true });
    ok('CSV export responds', csv.status === 200 && csv.text.includes('orderNumber'));
    ok('CSV contains the test order', csv.text.includes(order1.orderNumber));

    const statsAsUser = await call('GET', '/admin/stats', { token: user });
    ok('stats blocked for non-admin', statsAsUser.status === 403 || statsAsUser.status === 401);

    // ---------- 10. الأدمن يغيّر كلمة مرور العميل ----------
    section('Admin changes the customer password');
    const newPassword = 'NewPass#9876';
    const pwChange = await call('PUT', `/admin/users/${userId}`, { token: admin, body: { password: newPassword } });
    ok('admin sets new password', pwChange.status === 200, pwChange.json?.message);

    const oldLogin = await call('POST', '/auth/login', { body: { email, password } });
    ok('old password rejected', oldLogin.status === 401);
    const newLogin = await call('POST', '/auth/login', { body: { email, password: newPassword } });
    ok('new password works', newLogin.status === 200 && !!newLogin.json.token);
    user = newLogin.json.token;

    // ---------- 11. تنظيف ----------
    section('Cleanup');
    const del = await call('DELETE', `/admin/users/${userId}`, { token: admin });
    // العميل لديه طلبات، لذلك يتم تعطيل حسابه بدلاً من حذفه (سلوك مقصود)
    ok('test user deactivated (has orders)', del.status === 200, del.json?.message);

    // ---------- النتيجة ----------
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Result: ${passed} passed, ${failed} failed`);
    if (failures.length) {
        console.log('Failures:');
        failures.forEach(f => console.log(`  • ${f}`));
        process.exit(1);
    }
    console.log('🎉 Full e-commerce cycle verified.');
}

main().catch((err) => {
    console.error(`\n💥 Test run aborted: ${err.message}`);
    process.exit(1);
});
