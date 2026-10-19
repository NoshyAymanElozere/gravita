// API Configuration
const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;

// Application State
let state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    activeTab: 'store-tab',
    activeAdminSub: 'admin-products',
    cart: { items: [], totalPrice: 0 },
    productsPage: 1,
    categoriesPage: 1,
    adminProductsPage: 1,
    adminCategoriesPage: 1,
    adminUsersPage: 1,
    adminOrdersPage: 1
};

// Toast Notifications Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Automatically remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Check Authentication Status and Update UI
function checkAuth() {
    state.token = localStorage.getItem('token');
    state.user = JSON.parse(localStorage.getItem('user'));

    const navOrdersBtn = document.getElementById('nav-orders-btn');
    const navProfileBtn = document.getElementById('nav-profile-btn');
    const navAdminBtn = document.getElementById('nav-admin-btn');
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const userStatusBar = document.getElementById('user-status-bar');
    const statusUsername = document.getElementById('status-username');
    const statusRole = document.getElementById('status-role');
    const statusAvatar = document.getElementById('status-avatar');

    if (state.token && state.user) {
        // Logged in
        navOrdersBtn.style.display = 'flex';
        navProfileBtn.style.display = 'flex';
        navAuthBtn.style.display = 'none';
        userStatusBar.style.display = 'flex';

        statusUsername.textContent = state.user.name;
        statusAvatar.textContent = state.user.name.charAt(0).toUpperCase();

        if (state.user.role === 'admin') {
            navAdminBtn.style.display = 'flex';
            statusRole.textContent = 'مسؤول (Admin)';
        } else {
            navAdminBtn.style.display = 'none';
            statusRole.textContent = 'عميل';
            // If user is currently on admin tab but is no longer admin, redirect
            if (state.activeTab === 'admin-tab') {
                switchTab('store-tab');
            }
        }

        fetchCart();
    } else {
        // Logged out
        navOrdersBtn.style.display = 'none';
        navProfileBtn.style.display = 'none';
        navAdminBtn.style.display = 'none';
        navAuthBtn.style.display = 'flex';
        userStatusBar.style.display = 'none';

        document.getElementById('cart-count').textContent = '0';

        if (['orders-tab', 'profile-tab', 'admin-tab'].includes(state.activeTab)) {
            switchTab('store-tab');
        }
    }
}

// Tab Switching
function switchTab(tabId) {
    state.activeTab = tabId;

    // Update active class on nav buttons
    document.querySelectorAll('.nav-links .nav-btn').forEach(btn => {
        if (btn.getAttribute('data-target') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active class on tab panels
    document.querySelectorAll('.tab-content').forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Fetch tab-specific data
    if (tabId === 'store-tab') {
        fetchProducts(state.productsPage);
    } else if (tabId === 'categories-tab') {
        fetchCategories(state.categoriesPage);
    } else if (tabId === 'cart-tab') {
        fetchCart();
    } else if (tabId === 'orders-tab') {
        fetchMyOrders();
    } else if (tabId === 'profile-tab') {
        loadProfileInfo();
    } else if (tabId === 'admin-tab') {
        switchAdminSub(state.activeAdminSub);
    }
}

// Admin Sub-tabs
function switchAdminSub(subId) {
    state.activeAdminSub = subId;

    // Update subnav buttons active class
    document.querySelectorAll('.admin-subnav button').forEach(btn => {
        if (btn.getAttribute('data-sub') === subId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update admin content panels active class
    document.querySelectorAll('.admin-subcontent').forEach(panel => {
        if (panel.id === subId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Fetch data based on selected panel
    if (subId === 'admin-products') {
        fetchAdminProducts(state.adminProductsPage);
    } else if (subId === 'admin-categories') {
        fetchAdminCategories(state.adminCategoriesPage);
    } else if (subId === 'admin-users') {
        fetchAdminUsers(state.adminUsersPage);
    } else if (subId === 'admin-orders') {
        fetchAdminOrders(state.adminOrdersPage);
    }
}

// ==========================================
// 🛒 STOREFRONT & CART LOGIC
// ==========================================

// Fetch Public Products (Paginated)
async function fetchProducts(page = 1) {
    state.productsPage = page;
    const grid = document.getElementById('store-products-grid');
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>جاري تحميل المنتجات...</p></div>';

    try {
        const response = await fetch(`${API_URL}/api/products?page=${page}&limit=8`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            grid.innerHTML = result.data.map(product => `
                <div class="product-card">
                    <div class="product-img-wrapper">
                        ${product.image ?
                    `<img src="${API_URL}${product.image}" alt="${product.name}" class="product-img">` :
                    `<i class="fa-solid fa-box product-placeholder-icon"></i>`
                }
                        <span class="product-category-tag">${product.category ? product.category.name : 'عام'}</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-desc">${product.description}</p>
                        <div class="product-footer">
                            <span class="product-price">$${product.price}</span>
                            <button class="add-to-cart-btn" onclick="addToCart('${product._id}')">
                                <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            renderPagination('products-pagination', result.pagination, fetchProducts);
        } else {
            grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>لا يوجد منتجات متاحة حالياً</p></div>';
            document.getElementById('products-pagination').innerHTML = '';
        }
    } catch (err) {
        grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>حدث خطأ أثناء الاتصال بالسيرفر: ${err.message}</p></div>`;
    }
}

// Fetch Public Categories (Paginated)
async function fetchCategories(page = 1) {
    state.categoriesPage = page;
    const grid = document.getElementById('store-categories-grid');
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>جاري تحميل الفئات...</p></div>';

    try {
        const response = await fetch(`${API_URL}/api/categories?page=${page}&limit=6`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            grid.innerHTML = result.data.map(cat => `
                <div class="category-card">
                    <div class="category-text">
                        <h3>${cat.name}</h3>
                        <p>${cat.description}</p>
                    </div>
                    <div class="category-img-container">
                        ${cat.image ?
                    `<img src="${API_URL}${cat.image}" alt="${cat.name}" class="category-img">` :
                    `<i class="fa-solid fa-tags product-placeholder-icon"></i>`
                }
                        <div class="category-img-overlay"></div>
                    </div>
                </div>
            `).join('');

            renderPagination('categories-pagination', result.pagination, fetchCategories);
        } else {
            grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-tags"></i><p>لا يوجد أقسام مضافة</p></div>';
            document.getElementById('categories-pagination').innerHTML = '';
        }
    } catch (err) {
        grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>حدث خطأ: ${err.message}</p></div>`;
    }
}

// Fetch User's Cart
async function fetchCart() {
    if (!state.token) return;

    try {
        const response = await fetch(`${API_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        const countBadge = document.getElementById('cart-count');
        const itemsList = document.getElementById('cart-items-list');
        const summaryQty = document.getElementById('cart-summary-qty');
        const summaryTotal = document.getElementById('cart-summary-total');

        if (result.status === 'success' && result.data && result.data.items.length > 0) {
            state.cart = result.data;

            // Calculate total quantity
            const totalQty = state.cart.items.reduce((acc, item) => acc + item.quantity, 0);
            countBadge.textContent = totalQty;
            summaryQty.textContent = totalQty;
            summaryTotal.textContent = state.cart.total ?? 0;

            itemsList.innerHTML = state.cart.items.map(item => `
                <div class="cart-item">
                    <img src="${item.product && item.product.image ? API_URL + item.product.image : 'https://placehold.co/60x60?text=Product'}" class="cart-item-img" alt="">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.product ? item.product.name : (item.bundle ? '🎁 ' + item.bundle.nameAr : 'منتج غير معروف')}</h4>
                        <div class="cart-item-price">$${item.unitPrice ?? 0}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateCartItemQty('${item.product ? item.product._id : ''}', ${item.quantity - 1})">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartItemQty('${item.product ? item.product._id : ''}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-cart-item" onclick="removeCartItem('${item.product ? item.product._id : ''}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join('');
        } else {
            state.cart = { items: [], totalPrice: 0 };
            countBadge.textContent = '0';
            summaryQty.textContent = '0';
            summaryTotal.textContent = '0';
            itemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-cart-arrow-down"></i>
                    <p>عربة التسوق فارغة حالياً</p>
                </div>
            `;
        }
    } catch (err) {
        console.error('Error fetching cart:', err);
    }
}

// Add Item to Cart
async function addToCart(productId) {
    if (!state.token) {
        showToast('يرجى تسجيل الدخول أولاً لتتمكن من إضافة عناصر للسلة', 'warning');
        switchTab('auth-tab');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('تمت إضافة المنتج إلى عربة التسوق بنجاح!');
            fetchCart();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء الإضافة للسلة', 'error');
    }
}

// Update Cart Item Quantity
async function updateCartItemQty(productId, quantity) {
    if (quantity <= 0) {
        removeCartItem(productId);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        const result = await response.json();
        if (result.status === 'success') {
            fetchCart();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ في تحديث الكمية', 'error');
    }
}

// Remove Item from Cart
async function removeCartItem(productId) {
    try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();
        if (result.status === 'success') {
            showToast('تم حذف العنصر من السلة');
            fetchCart();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

// Checkout / Place Order
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return;

    if (state.cart.items.length === 0) {
        showToast('العربة فارغة! لا يمكنك تأكيد طلب فارغ.', 'warning');
        return;
    }

    const shippingAddress = document.getElementById('checkout-address').value;
    const phone = document.getElementById('checkout-phone').value;
    const paymentMethod = document.getElementById('checkout-payment').value;

    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            // عنوان الشحن أصبح كائناً منظماً، والمدينة تؤخذ من آخر جزء في العنوان النصي
            body: JSON.stringify({
                address: {
                    fullName: state.user.name,
                    phone,
                    addressLine1: shippingAddress,
                    city: cityFromAddress(shippingAddress)
                },
                paymentMethod: paymentMethod === 'COD' ? 'cod' : 'credit_card'
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showToast('🎉 تم تسجيل طلبك بنجاح وجاري تجهيزه!', 'success');
            document.getElementById('checkout-form').reset();
            fetchCart();
            switchTab('orders-tab');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء معالجة الطلب', 'error');
    }
});

// ==========================================
// 📦 ORDERS LOGIC
// ==========================================

// Fetch User's Personal Orders
async function fetchMyOrders() {
    if (!state.token) return;
    const container = document.getElementById('my-orders-list');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>جاري تحميل طلباتك...</p></div>';

    try {
        const response = await fetch(`${API_URL}/api/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success' && result.data.orders.length > 0) {
            container.innerHTML = result.data.orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id-label">رقم الطلب: #${order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}</span>
                            <div class="order-date">${new Date(order.createdAt).toLocaleString('ar-EG')}</div>
                        </div>
                        <span class="order-status ${order.status}">${getOrderStatusArabic(order.status)}</span>
                    </div>
                    <div class="order-details-body">
                        <div class="order-items-summary">
                            ${order.items.map(item => `• ${item.nameAr || item.nameEn || 'منتج محذوف'} (x${item.quantity})`).join('<br>')}
                        </div>
                        <div class="order-price-label">$${order.totalPrice}</div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>لم تقم بأي عمليات شراء سابقة بعد</p></div>';
        }
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>خطأ: ${err.message}</p></div>`;
    }
}

// عرض عنوان الشحن (كائن في الطلبات الجديدة أو نص في الطلبات القديمة)
function formatAddress(address) {
    if (!address) return '';
    if (typeof address === 'string') return address;
    return [address.addressLine1, address.city, address.phone].filter(Boolean).join(' - ');
}

// استخراج المدينة من آخر جزء في العنوان النصي (e.g. "Olaya St 5, Riyadh")
function cityFromAddress(text) {
    const last = (text.split(/[,،]/).pop() || '').trim();
    return last.length >= 2 ? last : 'N/A';
}

function getOrderStatusArabic(status) {
    const statuses = {
        'pending': '⏳ معلق',
        'processing': '⚙️ قيد المعالجة',
        'shipped': '🚚 تم الشحن',
        'delivered': '✅ تم التوصيل',
        'cancelled': '❌ ملغي',
        'confirmed': '👍 مؤكد',
        'return_requested': '↩ طلب استرجاع',
        'returned': '📦 مُسترجع'
    };
    return statuses[status] || status;
}

// ==========================================
// 👤 AUTHENTICATION & PROFILE LOGIC
// ==========================================

// Toggle between Login & Register forms
document.getElementById('toggle-login').addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('toggle-register').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
});

document.getElementById('toggle-register').addEventListener('click', function () {
    this.classList.add('active');
    document.getElementById('toggle-login').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
});

// Handle Login Form Submit
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            showToast('👋 مرحباً بك! تم تسجيل الدخول بنجاح');
            document.getElementById('login-form').reset();
            checkAuth();
            switchTab('store-tab');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('فشل الاتصال بالسيرفر لتسجيل الدخول', 'error');
    }
});

// Handle Register Form Submit
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            showToast('🎉 تم تسجيل حسابك الجديد وتفعيله بنجاح!');
            document.getElementById('register-form').reset();
            checkAuth();
            switchTab('store-tab');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('فشل الاتصال بالسيرفر أثناء إنشاء الحساب', 'error');
    }
});

// Handle Logout
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('تم تسجيل الخروج بنجاح. نراك قريباً!');
    checkAuth();
});

// Load User Profile Info (Self Profile Read)
async function loadProfileInfo() {
    if (!state.token) return;

    try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.data.user;

            document.getElementById('profile-avatar-char').textContent = user.name.charAt(0).toUpperCase();
            document.getElementById('profile-display-name').textContent = user.name;
            document.getElementById('profile-display-role').textContent = user.role === 'admin' ? 'مدير النظام' : 'مستشار تسوق';
            document.getElementById('profile-display-email').textContent = user.email;
            document.getElementById('profile-display-date').textContent = new Date(user.createdAt).toLocaleDateString('ar-EG');

            // Populate inputs for editing
            document.getElementById('edit-profile-name').value = user.name;
            document.getElementById('edit-profile-email').value = user.email;
            document.getElementById('edit-profile-password').value = '';
        }
    } catch (err) {
        showToast('خطأ في جلب بيانات الملف الشخصي', 'error');
    }
}

// Update User Profile (Self Profile Update)
document.getElementById('profile-update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return;

    const name = document.getElementById('edit-profile-name').value;
    const email = document.getElementById('edit-profile-email').value;
    const password = document.getElementById('edit-profile-password').value;

    const updateData = { name, email };
    if (password) {
        // تغيير كلمة المرور يتطلب كلمة المرور الحالية
        const currentPassword = window.prompt('أدخل كلمة المرور الحالية لتأكيد التغيير');
        if (!currentPassword) return;
        updateData.password = password;
        updateData.currentPassword = currentPassword;
    }

    try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(updateData)
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('✨ تم تحديث بياناتك بنجاح!');
            localStorage.setItem('user', JSON.stringify(result.data.user));
            checkAuth();
            loadProfileInfo();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء حفظ التعديلات', 'error');
    }
});

// Delete Self Profile (Account Delete)
document.getElementById('delete-profile-button').addEventListener('click', async () => {
    if (!state.token) return;

    const confirmDelete = confirm('⚠️ هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ هذا الإجراء سيقوم بمسح كافة بياناتك وطلباتك ولا يمكن استرجاعها!');
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('🗑️ تم حذف حسابك الشخصي بنجاح.', 'success');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            checkAuth();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء إرسال طلب الحذف', 'error');
    }
});

// ==========================================
// 🛠️ ADMIN CONTROL PANEL LOGIC
// ==========================================

// Global Modal handlers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('open');
}

// 7.1 PRODUCTS ADMIN CRUD
async function fetchAdminProducts(page = 1) {
    state.adminProductsPage = page;
    const tbody = document.getElementById('admin-products-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/products?page=${page}&limit=6`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            tbody.innerHTML = result.data.map(prod => `
                <tr>
                    <td>
                        <img src="${prod.image ? API_URL + prod.image : 'https://placehold.co/44x44?text=Prod'}" class="table-img" alt="">
                    </td>
                    <td style="font-weight:700;color:var(--text-white)">${prod.name}</td>
                    <td>${prod.category ? prod.category.name : 'غير محدد'}</td>
                    <td style="font-family:var(--font-en);font-weight:700">$${prod.price}</td>
                    <td>${new Date(prod.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-icon-btn edit" onclick="editProductPrompt('${prod._id}')" title="تعديل">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-icon-btn delete" onclick="deleteProduct('${prod._id}')" title="حذف">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            renderPagination('admin-products-pagination', result.pagination, fetchAdminProducts);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">لا يوجد منتجات لعرضها.</td></tr>';
            document.getElementById('admin-products-pagination').innerHTML = '';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger-color)">خطأ: ${err.message}</td></tr>`;
    }
}

// Prepare Category Select Options in Modal
async function loadCategoriesIntoSelect(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        // Fetch all categories (without limit to load them all for select option)
        const response = await fetch(`${API_URL}/api/categories?limit=100`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            select.innerHTML = result.data.map(cat => `
                <option value="${cat._id}" ${selectedId === cat._id ? 'selected' : ''}>${cat.name}</option>
            `).join('');
        } else {
            select.innerHTML = '<option value="">لا يوجد أقسام، يرجى إضافة قسم أولاً</option>';
        }
    } catch (err) {
        select.innerHTML = '<option value="">خطأ في تحميل الفئات</option>';
    }
}

// Open modal for adding a new product
document.getElementById('open-product-modal-btn').addEventListener('click', () => {
    document.getElementById('product-form').reset();
    document.getElementById('product-id-hidden').value = '';
    document.getElementById('product-modal-title').textContent = 'إضافة منتج جديد';
    loadCategoriesIntoSelect('product-category');
    openModal('product-modal');
});

document.getElementById('close-product-modal').addEventListener('click', () => closeModal('product-modal'));

// Edit Product Form Pre-fill
async function editProductPrompt(id) {
    try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const result = await response.json();

        if (result.status === 'success') {
            const prod = result.data;
            document.getElementById('product-id-hidden').value = prod._id;
            document.getElementById('product-name').value = prod.name;
            document.getElementById('product-price').value = prod.price;
            document.getElementById('product-description').value = prod.description;
            document.getElementById('product-modal-title').textContent = 'تعديل بيانات المنتج';

            await loadCategoriesIntoSelect('product-category', prod.category ? prod.category._id : null);
            openModal('product-modal');
        }
    } catch (err) {
        showToast('خطأ في جلب بيانات المنتج', 'error');
    }
}

// Handle Submit Product (Add/Edit CRUD)
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return;

    const id = document.getElementById('product-id-hidden').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const imageInput = document.getElementById('product-image');

    // We must use FormData because we support file upload!
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    const url = id ? `${API_URL}/api/admin/products/${id}` : `${API_URL}/api/admin/products`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${state.token}` },
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success' || response.status === 201 || response.status === 200) {
            showToast(id ? '✨ تم تعديل المنتج بنجاح!' : '🎉 تم إضافة المنتج الجديد بنجاح!');
            closeModal('product-modal');
            fetchAdminProducts(state.adminProductsPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء حفظ المنتج', 'error');
    }
});

// Delete Product CRUD
async function deleteProduct(id) {
    if (!confirm('⚠️ هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('🗑️ تم حذف المنتج بنجاح من قاعدة البيانات.');
            fetchAdminProducts(state.adminProductsPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء حذف المنتج', 'error');
    }
}

// 7.2 CATEGORIES ADMIN CRUD
async function fetchAdminCategories(page = 1) {
    state.adminCategoriesPage = page;
    const tbody = document.getElementById('admin-categories-table-body');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/categories?page=${page}&limit=6`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            tbody.innerHTML = result.data.map(cat => `
                <tr>
                    <td>
                        <img src="${cat.image ? API_URL + cat.image : 'https://placehold.co/44x44?text=Category'}" class="table-img" alt="">
                    </td>
                    <td style="font-weight:700;color:var(--text-white)">${cat.name}</td>
                    <td>${cat.description}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-icon-btn edit" onclick="editCategoryPrompt('${cat._id}')" title="تعديل">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-icon-btn delete" onclick="deleteCategory('${cat._id}')" title="حذف">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            renderPagination('admin-categories-pagination', result.pagination, fetchAdminCategories);
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">لا يوجد أقسام لعرضها.</td></tr>';
            document.getElementById('admin-categories-pagination').innerHTML = '';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger-color)">خطأ: ${err.message}</td></tr>`;
    }
}

// Add Category Modal Trigger
document.getElementById('open-category-modal-btn').addEventListener('click', () => {
    document.getElementById('category-form').reset();
    document.getElementById('category-id-hidden').value = '';
    document.getElementById('category-modal-title').textContent = 'إضافة فئة جديدة';
    openModal('category-modal');
});

document.getElementById('close-category-modal').addEventListener('click', () => closeModal('category-modal'));

// Pre-fill Edit Category Modal
async function editCategoryPrompt(id) {
    try {
        const response = await fetch(`${API_URL}/api/categories/${id}`);
        const result = await response.json();

        if (result.status === 'success') {
            const cat = result.data;
            document.getElementById('category-id-hidden').value = cat._id;
            document.getElementById('category-name').value = cat.name;
            document.getElementById('category-description').value = cat.description;
            document.getElementById('category-modal-title').textContent = 'تعديل بيانات الفئة';
            openModal('category-modal');
        }
    } catch (err) {
        showToast('خطأ في جلب بيانات الفئة', 'error');
    }
}

// Handle Submit Category Form (Add/Edit CRUD)
document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return;

    const id = document.getElementById('category-id-hidden').value;
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;
    const imageInput = document.getElementById('category-image');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    const url = id ? `${API_URL}/api/admin/categories/${id}` : `${API_URL}/api/admin/categories`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${state.token}` },
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success' || response.status === 201 || response.status === 200) {
            showToast(id ? '✨ تم تحديث الفئة بنجاح!' : '🎉 تم إضافة الفئة بنجاح!');
            closeModal('category-modal');
            fetchAdminCategories(state.adminCategoriesPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء حفظ الفئة', 'error');
    }
});

// Delete Category
async function deleteCategory(id) {
    if (!confirm('⚠️ هل أنت متأكد من حذف الفئة؟ سيؤثر هذا على المنتجات التابعة لها.')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('🗑️ تم حذف الفئة بنجاح.');
            fetchAdminCategories(state.adminCategoriesPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء حذف الفئة', 'error');
    }
}

// 7.3 USERS ADMIN CRUD
async function fetchAdminUsers(page = 1) {
    state.adminUsersPage = page;
    const tbody = document.getElementById('admin-users-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/admin/users?page=${page}&limit=6`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            tbody.innerHTML = result.data.map(usr => `
                <tr>
                    <td style="font-weight:700;color:var(--text-white)">${usr.name}</td>
                    <td>${usr.email}</td>
                    <td>
                        <span class="role-badge" style="background:${usr.role === 'admin' ? 'rgba(236,72,153,0.15)' : ''}; border-color:${usr.role === 'admin' ? '#ec4899' : ''}; color:${usr.role === 'admin' ? '#ec4899' : ''}">
                            ${usr.role === 'admin' ? 'مسؤول' : 'عميل'}
                        </span>
                    </td>
                    <td>
                        <span class="status-indicator ${usr.isActive ? 'active' : 'disabled'}">
                            <span class="status-dot"></span>
                            ${usr.isActive ? 'نشط' : 'معطل'}
                        </span>
                    </td>
                    <td>${new Date(usr.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="action-icon-btn edit" onclick="editUserPrompt('${usr._id}')" title="تعديل">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-icon-btn delete" onclick="deleteUser('${usr._id}')" title="حذف" ${state.user.id === usr._id ? 'disabled style="opacity:0.2;cursor:not-allowed"' : ''}>
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            renderPagination('admin-users-pagination', result.pagination, fetchAdminUsers);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">لا يوجد مستخدمين.</td></tr>';
            document.getElementById('admin-users-pagination').innerHTML = '';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger-color)">خطأ: ${err.message}</td></tr>`;
    }
}

// Add User Modal Trigger
document.getElementById('open-user-modal-btn').addEventListener('click', () => {
    document.getElementById('user-form').reset();
    document.getElementById('user-id-hidden').value = '';
    document.getElementById('user-password-label').textContent = 'كلمة المرور';
    document.getElementById('user-password-tip').style.display = 'block';
    document.getElementById('user-status-group').style.display = 'none';
    document.getElementById('user-modal-title').textContent = 'إضافة مستخدم جديد';
    openModal('user-modal');
});

document.getElementById('close-user-modal').addEventListener('click', () => closeModal('user-modal'));

// Pre-fill Edit User Modal
async function editUserPrompt(id) {
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            const usr = result.data.find(u => u._id === id);
            if (usr) {
                document.getElementById('user-id-hidden').value = usr._id;
                document.getElementById('user-name').value = usr.name;
                document.getElementById('user-email').value = usr.email;
                document.getElementById('user-role').value = usr.role;
                document.getElementById('user-status').value = usr.isActive.toString();

                document.getElementById('user-password-label').textContent = 'تغيير كلمة المرور (اختياري)';
                document.getElementById('user-password-tip').style.display = 'block';
                document.getElementById('user-status-group').style.display = 'block';
                document.getElementById('user-modal-title').textContent = 'تعديل بيانات المستخدم';

                openModal('user-modal');
            }
        }
    } catch (err) {
        showToast('خطأ في جلب بيانات الحساب', 'error');
    }
}

// Handle Submit User Form (Add/Edit CRUD)
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.token) return;

    const id = document.getElementById('user-id-hidden').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    const payload = { name, email, role };
    if (password) payload.password = password;

    if (id) {
        payload.isActive = document.getElementById('user-status').value === 'true';
    } else {
        if (!password) {
            showToast('كلمة المرور مطلوبة لإنشاء مستخدم جديد', 'warning');
            return;
        }
    }

    const url = id ? `${API_URL}/api/admin/users/${id}` : `${API_URL}/api/admin/users`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success' || response.status === 201 || response.status === 200) {
            showToast(id ? '✨ تم تحديث بيانات المستخدم بنجاح!' : '👤 تم إنشاء المستخدم الجديد بنجاح!');
            closeModal('user-modal');
            fetchAdminUsers(state.adminUsersPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء حفظ المستخدم', 'error');
    }
});

// Delete User CRUD
async function deleteUser(id) {
    if (state.user.id === id) {
        showToast('لا يمكنك حذف حسابك الشخصي من هنا!', 'warning');
        return;
    }
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast('🗑️ تم حذف المستخدم بنجاح من قاعدة البيانات.');
            fetchAdminUsers(state.adminUsersPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('خطأ أثناء حذف المستخدم', 'error');
    }
}

// 7.4 ORDERS ADMIN CRUD
async function fetchAdminOrders(page = 1) {
    state.adminOrdersPage = page;
    const tbody = document.getElementById('admin-orders-table-body');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/admin/orders?page=${page}&limit=6`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const result = await response.json();

        if (result.status === 'success' && result.data.orders.length > 0) {
            tbody.innerHTML = result.data.orders.map(ord => `
                <tr>
                    <td style="font-family:var(--font-en)">#${ord.orderNumber || ord._id.substring(ord._id.length - 8).toUpperCase()}</td>
                    <td>
                        <div style="font-weight:700;color:var(--text-white)">${ord.user ? ord.user.name : 'عميل غير معروف'}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted)">${ord.user ? ord.user.email : ''}</div>
                    </td>
                    <td style="font-family:var(--font-en);font-weight:700">$${ord.totalPrice}</td>
                    <td style="font-size:0.8rem;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${formatAddress(ord.shippingAddress)}">${formatAddress(ord.shippingAddress)}</td>
                    <td>
                        <span class="order-status ${ord.status}">${getOrderStatusArabic(ord.status)}</span>
                    </td>
                    <td>${new Date(ord.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <select class="form-group admin-order-status-select" onchange="updateOrderStatus('${ord._id}', this.value)">
                            <option value="pending" ${ord.status === 'pending' ? 'selected' : ''}>⏳ معلق</option>
                            <option value="confirmed" ${ord.status === 'confirmed' ? 'selected' : ''}>👍 مؤكد</option>
                            <option value="processing" ${ord.status === 'processing' ? 'selected' : ''}>⚙️ معالجة</option>
                            <option value="shipped" ${ord.status === 'shipped' ? 'selected' : ''}>🚚 شحن</option>
                            <option value="delivered" ${ord.status === 'delivered' ? 'selected' : ''}>✅ توصيل</option>
                            <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>❌ إلغاء</option>
                            <option value="return_requested" ${ord.status === 'return_requested' ? 'selected' : ''}>↩ طلب استرجاع</option>
                            <option value="returned" ${ord.status === 'returned' ? 'selected' : ''}>📦 مُسترجع</option>
                        </select>
                    </td>
                </tr>
            `).join('');

            renderPagination('admin-orders-pagination', result.pagination, fetchAdminOrders);
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">لا يوجد طلبات حالياً.</td></tr>';
            document.getElementById('admin-orders-pagination').innerHTML = '';
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger-color)">خطأ: ${err.message}</td></tr>`;
    }
}

// Update Order Status (Admin action)
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json();

        if (result.status === 'success') {
            showToast(`🚚 تم تحديث حالة الطلب بنجاح إلى: ${getOrderStatusArabic(status)}`);
            fetchAdminOrders(state.adminOrdersPage);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('حدث خطأ أثناء تحديث حالة الطلب', 'error');
    }
}

// ==========================================
// 🎛️ PAGINATION RENDERER
// ==========================================
function renderPagination(containerId, pagination, callback) {
    const container = document.getElementById(containerId);
    if (!pagination) {
        container.innerHTML = '';
        return;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    let buttonsHTML = `
        <button class="page-btn" ${!hasPrevPage ? 'disabled' : ''} onclick="window.paginationCallback_${containerId}(${currentPage - 1})" title="الصفحة السابقة">
            <i class="fa-solid fa-angle-right"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.paginationCallback_${containerId}(${i})">
                ${i}
            </button>
        `;
    }

    buttonsHTML += `
        <button class="page-btn" ${!hasNextPage ? 'disabled' : ''} onclick="window.paginationCallback_${containerId}(${currentPage + 1})" title="الصفحة التالية">
            <i class="fa-solid fa-angle-left"></i>
        </button>
    `;

    // Attach dynamic callback to window object to be accessible inline
    window[`paginationCallback_${containerId}`] = callback;

    container.innerHTML = buttonsHTML;
}

// ==========================================
// 🚀 APPLICATION INITIALIZATION
// ==========================================

// Setup Tab Buttons Listeners
document.querySelectorAll('.nav-links .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchTab(target);
    });
});

// Setup Admin Subnav Buttons Listeners
document.querySelectorAll('.admin-subnav button').forEach(btn => {
    btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub');
        switchAdminSub(sub);
    });
});

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    // Default load products of store tab
    fetchProducts(1);
});
