import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { Language, Product, CartItem, Coupon, Order, Address, UserProfile, Category, Bundle, Review } from '../types';
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from '../lib/api';
import {
    mapProduct,
    mapBundle,
    mapCategory,
    mapReview,
    mapCartLine,
    mapCoupon,
    mapAddress,
    mapUser,
    mapOrder,
    bundleToProduct,
    isBundleProduct,
    cartItemId
} from '../lib/mappers';

interface OrderContact {
    name: string;
    email: string;
    phone: string;
}

interface AppState {
    language: Language;
    activePage: string;
    selectedProduct: Product | null;
    selectedBundle: Bundle | null;
    cart: CartItem[];
    wishlist: string[];
    appliedCoupon: Coupon | null;
    user: UserProfile | null;
    orders: Order[];
    searchQuery: string;
    searchHistory: string[];
    activeCategory: string | null;
    activeSkinType: string | null;
    priceRange: [number, number];
    sortBy: string;

    // Backend data & session
    token: string | null;
    authReady: boolean;
    catalogLoaded: boolean;
    products: Product[];
    bundles: Bundle[];
    categories: Category[];
    reviews: Review[];

    setLanguage: (lang: Language) => void;
    setActivePage: (page: string) => void;
    setSelectedProduct: (product: Product | null) => void;
    setSelectedBundle: (bundle: Bundle | null) => void;
    addToCart: (product: Product, size: string, qty?: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateCartQuantity: (cartItemId: string, qty: number) => void;
    clearCart: () => void;
    toggleWishlist: (productId: string) => void;
    applyCoupon: (code: string) => Promise<string | null>;
    removeCoupon: () => void;
    loginUser: (email: string, password: string) => Promise<string | null>;
    registerUser: (name: string, email: string, phone: string, password: string) => Promise<string | null>;
    logoutUser: () => void;
    updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<string | null>;
    addNewAddress: (address: Omit<Address, 'id'>) => Promise<string | null>;
    deleteAddress: (id: string) => void;
    placeOrder: (shippingAddress: Address, paymentMethod: Order['paymentMethod'], contact?: OrderContact) => Promise<Order>;
    cancelOrder: (orderId: string, reason?: string) => Promise<string | null>;
    reorder: (orderId: string) => Promise<string | null>;
    setSearchQuery: (query: string) => void;
    addToSearchHistory: (query: string) => void;
    clearSearchHistory: () => void;
    setActiveCategory: (slug: string | null) => void;
    setActiveSkinType: (type: string | null) => void;
    setPriceRange: (range: [number, number]) => void;
    setSortBy: (sort: string) => void;

    loadCatalog: () => Promise<void>;
    initSession: () => Promise<void>;
    loadAccount: () => Promise<void>;
    loadOrders: () => Promise<void>;
}

// Backend messages are Arabic with an English hint in parentheses; pick the right one for the UI language
export const errorMessage = (error: unknown, language: Language): string => {
    const message = error instanceof Error ? error.message : String(error);
    if (language === 'ar') return message;
    const english = message.match(/\(([^()]*[A-Za-z][^()]*)\)/);
    if (english) return english[1];
    if (!/[؀-ۿ]/.test(message)) return message;
    return 'Something went wrong. Please try again.';
};

// Kept for existing imports: a bundle displayed and stored in the cart as a product
export const convertBundleToProduct = bundleToProduct;

export const useAppStore = create<AppState>()(persist((set, get) => {
    const notifyError = (error: unknown) => toast.error(errorMessage(error, get().language));

    // Replace the local cart with the server's priced cart
    const applyServerCart = (cart: any) => {
        const items = (cart.items || []).map(mapCartLine).filter(Boolean) as CartItem[];
        const current = get().appliedCoupon;
        const coupon = cart.coupon && cart.coupon.valid
            ? (current && current.code === cart.coupon.code ? current : mapCoupon(cart.coupon))
            : null;
        set({ cart: items, appliedCoupon: coupon });
    };

    const refreshCart = async () => {
        try {
            const res = await api.get('/cart');
            applyServerCart(res.data.cart);
        } catch (error) {
            notifyError(error);
        }
    };

    // Push the guest cart / wishlist / coupon into the account after signing in
    const mergeGuestData = async () => {
        const { cart, wishlist, appliedCoupon } = get();
        if (cart.length) {
            const items = cart.map(item => ({
                itemType: isBundleProduct(item.product) ? 'bundle' : 'product',
                id: item.product.id,
                quantity: item.quantity
            }));
            await api.post('/cart/merge', { items }).catch(() => undefined);
        }
        await Promise.all(wishlist.map(id => api.post(`/users/me/wishlist/${id}`).catch(() => undefined)));
        if (appliedCoupon) {
            await api.post('/cart/coupon', { code: appliedCoupon.code }).catch(() => undefined);
        }
    };

    const startSession = async (token: string) => {
        setAuthToken(token);
        set({ token });
        await mergeGuestData();
        await get().loadAccount();
    };

    return {
        language: 'en',
        activePage: 'home',
        selectedProduct: null,
        selectedBundle: null,
        cart: [],
        wishlist: [],
        appliedCoupon: null,
        user: null,
        orders: [],
        searchQuery: '',
        searchHistory: ['Serum', 'Moisturizer', 'Cleanser'],
        activeCategory: null,
        activeSkinType: null,
        priceRange: [0, 500],
        sortBy: 'best-selling',

        token: null,
        authReady: false,
        catalogLoaded: false,
        products: [],
        bundles: [],
        categories: [],
        reviews: [],

        setLanguage: (lang) => {
            set({ language: lang });
            if (typeof window !== 'undefined') {
                document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
                document.documentElement.setAttribute('lang', lang);
            }
        },
        setActivePage: (page) => set({ activePage: page }),
        setSelectedProduct: (product) => set({ selectedProduct: product, selectedBundle: product ? null : get().selectedBundle }),
        setSelectedBundle: (bundle) => set({ selectedBundle: bundle, selectedProduct: bundle ? null : get().selectedProduct }),

        // ---------- Catalog ----------
        loadCatalog: async () => {
            try {
                const [products, bundles, categories, reviews] = await Promise.all([
                    api.get('/products?limit=100'),
                    api.get('/bundles?limit=50'),
                    api.get('/categories?limit=50'),
                    api.get('/reviews/featured?limit=12')
                ]);
                set({
                    products: products.data.map(mapProduct),
                    bundles: bundles.data.map(mapBundle),
                    categories: categories.data.map(mapCategory),
                    reviews: reviews.data.map(mapReview),
                    catalogLoaded: true
                });
            } catch (error) {
                notifyError(error);
            }
        },

        // ---------- Session ----------
        initSession: async () => {
            setUnauthorizedHandler(() => {
                get().logoutUser();
                toast.error(get().language === 'en' ? 'Your session has expired. Please sign in again.' : 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
            });
            const { token } = get();
            if (token) {
                setAuthToken(token);
                try {
                    await get().loadAccount();
                } catch {
                    get().logoutUser();
                }
            }
            set({ authReady: true });
        },

        loadAccount: async () => {
            const [profile, wishlist, cart, orders] = await Promise.all([
                api.get('/users/me'),
                api.get('/users/me/wishlist'),
                api.get('/cart'),
                api.get('/orders/my-orders?limit=100')
            ]);
            const ids: string[] = wishlist.data.ids.map(String);
            set({
                user: mapUser(profile.data.user, ids),
                wishlist: ids,
                orders: orders.data.orders.map(mapOrder)
            });
            applyServerCart(cart.data.cart);
        },

        loadOrders: async () => {
            if (!get().token) return;
            try {
                const res = await api.get('/orders/my-orders?limit=100');
                set({ orders: res.data.orders.map(mapOrder) });
            } catch (error) {
                notifyError(error);
            }
        },

        loginUser: async (email, password) => {
            try {
                const res = await api.post('/auth/login', { email, password });
                await startSession(res.token);
                return null;
            } catch (error) {
                return errorMessage(error, get().language);
            }
        },

        registerUser: async (name, email, phone, password) => {
            try {
                const res = await api.post('/auth/register', { name, email, phone, password });
                await startSession(res.token);
                return null;
            } catch (error) {
                if (error instanceof ApiError && error.errors?.length) {
                    return (error.errors as string[]).join(' • ');
                }
                return errorMessage(error, get().language);
            }
        },

        logoutUser: () => {
            setAuthToken(null);
            set({ token: null, user: null, wishlist: [], orders: [], cart: [], appliedCoupon: null });
        },

        updateProfile: async (data) => {
            try {
                const res = await api.put('/users/me', data);
                set({ user: mapUser(res.data.user, get().wishlist) });
                return null;
            } catch (error) {
                return errorMessage(error, get().language);
            }
        },

        // ---------- Cart ----------
        addToCart: (product, size, qty = 1) => {
            const itemId = cartItemId(product, size);
            const prevCart = get().cart;
            const matchIndex = prevCart.findIndex((item) => item.id === itemId);
            if (matchIndex > -1) {
                const newCart = [...prevCart];
                newCart[matchIndex] = { ...newCart[matchIndex], quantity: newCart[matchIndex].quantity + qty };
                set({ cart: newCart });
            } else {
                set({ cart: [...prevCart, { id: itemId, product, quantity: qty, selectedSize: size }] });
            }

            if (!get().token) return;
            const request = isBundleProduct(product)
                ? api.post('/cart/bundles', { bundleId: product.id, quantity: qty })
                : api.post('/cart', { productId: product.id, quantity: qty });
            request.then(res => applyServerCart(res.data.cart)).catch(error => {
                notifyError(error);
                refreshCart();
            });
        },

        removeFromCart: (cartItemId) => {
            const item = get().cart.find((i) => i.id === cartItemId);
            set({ cart: get().cart.filter((i) => i.id !== cartItemId) });

            if (!get().token || !item) return;
            const request = isBundleProduct(item.product)
                ? api.delete(`/cart/bundles/${item.product.id}`)
                : api.delete(`/cart/${item.product.id}`);
            request.then(res => applyServerCart(res.data.cart)).catch(error => {
                notifyError(error);
                refreshCart();
            });
        },

        updateCartQuantity: (cartItemId, qty) => {
            if (qty <= 0) {
                get().removeFromCart(cartItemId);
                return;
            }
            const item = get().cart.find((i) => i.id === cartItemId);
            set({
                cart: get().cart.map((i) => (i.id === cartItemId ? { ...i, quantity: qty } : i))
            });

            if (!get().token || !item) return;
            const request = isBundleProduct(item.product)
                ? api.put('/cart/bundles', { bundleId: item.product.id, quantity: qty })
                : api.put('/cart', { productId: item.product.id, quantity: qty });
            request.then(res => applyServerCart(res.data.cart)).catch(error => {
                notifyError(error);
                refreshCart();
            });
        },

        clearCart: () => {
            set({ cart: [], appliedCoupon: null });
            if (get().token) {
                api.delete('/cart').catch(notifyError);
            }
        },

        // ---------- Wishlist ----------
        toggleWishlist: (productId) => {
            const prevWish = get().wishlist;
            const isExist = prevWish.includes(productId);
            const next = isExist ? prevWish.filter((id) => id !== productId) : [...prevWish, productId];
            set({ wishlist: next });

            if (!get().token) return;
            const request = isExist
                ? api.delete(`/users/me/wishlist/${productId}`)
                : api.post(`/users/me/wishlist/${productId}`);
            request.catch(error => {
                set({ wishlist: prevWish });
                notifyError(error);
            });
        },

        // ---------- Coupons ----------
        applyCoupon: async (code) => {
            const codeClean = code.toUpperCase().trim();
            const subtotal = get().cart.reduce(
                (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
                0
            );

            try {
                const res = await api.post('/coupons/validate', { code: codeClean, subtotal });
                const coupon = mapCoupon(res.data.coupon);
                if (get().token) {
                    const cartRes = await api.post('/cart/coupon', { code: codeClean });
                    set({ appliedCoupon: coupon });
                    applyServerCart(cartRes.data.cart);
                } else {
                    set({ appliedCoupon: coupon });
                }
                return null;
            } catch (error) {
                return errorMessage(error, get().language);
            }
        },

        removeCoupon: () => {
            set({ appliedCoupon: null });
            if (get().token) {
                api.delete('/cart/coupon').catch(notifyError);
            }
        },

        // ---------- Addresses ----------
        addNewAddress: async (addr) => {
            const user = get().user;
            if (!user) return null;
            try {
                const { isDefault, ...fields } = addr;
                const res = await api.post('/users/me/addresses', {
                    ...fields,
                    addressLine2: fields.addressLine2 || '',
                    isDefault: user.addresses.length === 0 ? true : isDefault
                });
                set({ user: { ...user, addresses: res.data.addresses.map(mapAddress) } });
                return null;
            } catch (error) {
                const message = error instanceof ApiError && error.errors?.length
                    ? (error.errors as string[]).join(' • ')
                    : errorMessage(error, get().language);
                toast.error(message);
                return message;
            }
        },

        deleteAddress: (id) => {
            const user = get().user;
            if (!user) return;
            set({ user: { ...user, addresses: user.addresses.filter((a) => a.id !== id) } });
            api.delete(`/users/me/addresses/${id}`)
                .then(res => {
                    const latest = get().user;
                    if (latest) set({ user: { ...latest, addresses: res.data.addresses.map(mapAddress) } });
                })
                .catch(error => {
                    set({ user });
                    notifyError(error);
                });
        },

        // ---------- Orders ----------
        placeOrder: async (addr, payment, contact) => {
            const res = await api.post('/orders', {
                address: {
                    fullName: addr.fullName,
                    phone: addr.phone,
                    addressLine1: addr.addressLine1,
                    addressLine2: addr.addressLine2 || '',
                    city: addr.city,
                    state: addr.state || '',
                    postalCode: addr.postalCode || '',
                    country: addr.country || 'Saudi Arabia'
                },
                ...(contact && { contact }),
                paymentMethod: payment
            });
            const newOrder = mapOrder(res.data.order);
            set((state) => ({ orders: [newOrder, ...state.orders], cart: [], appliedCoupon: null }));
            return newOrder;
        },

        cancelOrder: async (orderId, reason) => {
            try {
                const res = await api.patch(`/orders/${orderId}/cancel`, { reason: reason || '' });
                const updated = mapOrder(res.data.order);
                set({ orders: get().orders.map(o => (o.id === orderId ? updated : o)) });
                // Stock went back to the shelves - refresh product availability
                get().loadCatalog();
                return null;
            } catch (error) {
                return errorMessage(error, get().language);
            }
        },

        reorder: async (orderId) => {
            try {
                const res = await api.post(`/orders/${orderId}/reorder`);
                applyServerCart(res.data.cart);
                return null;
            } catch (error) {
                return errorMessage(error, get().language);
            }
        },

        setSearchQuery: (query) => set({ searchQuery: query }),

        addToSearchHistory: (query) => {
            if (!query.trim()) return;
            const prev = get().searchHistory;
            const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
            set({ searchHistory: [query, ...filtered].slice(0, 5) });
        },

        clearSearchHistory: () => set({ searchHistory: [] }),
        setActiveCategory: (slug) => set({ activeCategory: slug }),
        setActiveSkinType: (type) => set({ activeSkinType: type }),
        setPriceRange: (range) => set({ priceRange: range }),
        setSortBy: (sort) => set({ sortBy: sort })
    };
}, {
    name: 'aura-store',
    storage: createJSONStorage(() => localStorage),
    // Rehydrated manually in AppProvider (after mount) to avoid SSR hydration mismatches
    skipHydration: true,
    // Session token + guest cart/wishlist/coupon survive reloads; everything else comes from the API
    partialize: (state) => ({
        token: state.token,
        cart: state.cart,
        wishlist: state.wishlist,
        appliedCoupon: state.appliedCoupon,
        searchHistory: state.searchHistory
    })
}));
