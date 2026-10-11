import { create } from 'zustand';
import { Language, Product, CartItem, Coupon, Order, Address, UserProfile, Category, Bundle } from '../types';
import { PRODUCTS, CATEGORIES, COUPONS, BUNDLES } from '../constants/data';

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

    setLanguage: (lang: Language) => void;
    setActivePage: (page: string) => void;
    setSelectedProduct: (product: Product | null) => void;
    setSelectedBundle: (bundle: Bundle | null) => void;
    addToCart: (product: Product, size: string, qty?: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateCartQuantity: (cartItemId: string, qty: number) => void;
    clearCart: () => void;
    toggleWishlist: (productId: string) => void;
    applyCoupon: (code: string) => string | null;
    removeCoupon: () => void;
    loginUser: (email: string, name?: string) => void;
    registerUser: (name: string, email: string, phone: string) => void;
    logoutUser: () => void;
    addNewAddress: (address: Omit<Address, 'id'>) => void;
    deleteAddress: (id: string) => void;
    placeOrder: (shippingAddress: Address, paymentMethod: Order['paymentMethod']) => Order;
    setSearchQuery: (query: string) => void;
    addToSearchHistory: (query: string) => void;
    clearSearchHistory: () => void;
    setActiveCategory: (slug: string | null) => void;
    setActiveSkinType: (type: string | null) => void;
    setPriceRange: (range: [number, number]) => void;
    setSortBy: (sort: string) => void;
}

const DEFAULT_USER: UserProfile = {
    id: 'usr_premium_1',
    name: 'Serene Al-Ghamdi',
    email: 'serene@aura.com',
    phone: '+966 54 123 4567',
    addresses: [
        {
            id: 'addr_1',
            fullName: 'Serene Al-Ghamdi',
            addressLine1: '7821 Al Reem Boulevard, Floor 14',
            addressLine2: 'Al Murooj District',
            city: 'Riyadh',
            state: 'Central Province',
            postalCode: '12282',
            country: 'Saudi Arabia',
            phone: '+966 54 123 4567',
            isDefault: true
        }
    ],
    wishlist: ['prod_ocean_glow']
};

const DEFAULT_ORDERS: Order[] = [
    {
        id: 'ord_mock_1',
        orderNumber: 'NFD1234',
        date: '12/2/2024',
        status: 'delivered',
        items: [
            {
                productId: 'prod_ocean_glow',
                productNameEn: 'Coastal Ocean Glow Hyaluronic Elixir',
                productNameAr: 'سيروم الهيالورونيك الساحلي لإشراقة المحيط',
                price: 1240,
                quantity: 3,
                image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=150&q=80',
                selectedSize: '50ml'
            }
        ],
        shippingAddress: DEFAULT_USER.addresses[0],
        paymentMethod: 'credit_card',
        subtotal: 3720,
        discount: 0,
        shippingFee: 0,
        total: 3720,
        trackingNumber: 'TRK-98312019',
        estimatedDelivery: '2024-02-15'
    },
    {
        id: 'ord_mock_2',
        orderNumber: 'NFD1234',
        date: '12/2/2024',
        status: 'processing',
        items: [
            {
                productId: 'prod_ocean_glow',
                productNameEn: 'Coastal Ocean Glow Hyaluronic Elixir',
                productNameAr: 'سيروم الهيالورونيك الساحلي لإشراقة المحيط',
                price: 1240,
                quantity: 3,
                image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=150&q=80',
                selectedSize: '50ml'
            }
        ],
        shippingAddress: DEFAULT_USER.addresses[0],
        paymentMethod: 'credit_card',
        subtotal: 3720,
        discount: 0,
        shippingFee: 0,
        total: 3720,
        trackingNumber: 'TRK-98312020',
        estimatedDelivery: '2024-02-16'
    },
    {
        id: 'ord_mock_3',
        orderNumber: 'NFD1234',
        date: '12/2/2024',
        status: 'in-transit',
        items: [
            {
                productId: 'prod_ocean_glow',
                productNameEn: 'Coastal Ocean Glow Hyaluronic Elixir',
                productNameAr: 'سيروم الهيالورونيك الساحلي لإشراقة المحيط',
                price: 1240,
                quantity: 3,
                image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=150&q=80',
                selectedSize: '50ml'
            }
        ],
        shippingAddress: DEFAULT_USER.addresses[0],
        paymentMethod: 'credit_card',
        subtotal: 3720,
        discount: 0,
        shippingFee: 0,
        total: 3720,
        trackingNumber: 'TRK-98312021',
        estimatedDelivery: '2024-02-15'
    },
    {
        id: 'ord_mock_4',
        orderNumber: 'NFD1234',
        date: '12/2/2024',
        status: 'returned',
        items: [
            {
                productId: 'prod_botanical_gel',
                productNameEn: 'Prebiotic Botanical Gel Cleanser',
                productNameAr: 'غسول الجل النباتي الحيوي المقوي للبشرة',
                price: 1240,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80',
                selectedSize: '150ml'
            }
        ],
        shippingAddress: DEFAULT_USER.addresses[0],
        paymentMethod: 'credit_card',
        subtotal: 1240,
        discount: 0,
        shippingFee: 0,
        total: 1240,
        trackingNumber: 'TRK-98312022',
        estimatedDelivery: '2024-02-14'
    }
];

export function convertBundleToProduct(bundle: Bundle): Product {
    return {
        id: bundle.id,
        slug: bundle.slug,
        nameEn: bundle.nameEn,
        nameAr: bundle.nameAr,
        subtitleEn: bundle.subtitleEn,
        subtitleAr: bundle.subtitleAr,
        descriptionEn: bundle.descriptionEn,
        descriptionAr: bundle.descriptionAr,
        ingredientsEn: bundle.items.map(item => item.product.nameEn).join(', '),
        ingredientsAr: bundle.items.map(item => item.product.nameAr).join('، '),
        skinTypeEn: 'Various',
        skinTypeAr: 'مختلف',
        benefitsEn: bundle.benefitsEn,
        benefitsAr: bundle.benefitsAr,
        howToUseEn: bundle.items.map((item, idx) => `Step ${idx + 1}: ${item.stepEn}`).join('\n'),
        howToUseAr: bundle.items.map((item, idx) => `الخطوة ${idx + 1}: ${item.stepAr}`).join('\n'),
        price: bundle.originalPrice,
        discountPrice: bundle.bundlePrice,
        rating: 5.0,
        reviewCount: 1,
        size: 'Complete Set',
        image: bundle.image,
        galleryImages: [bundle.image],
        isBestSeller: true,
        isNew: false,
        stockStatus: 'in_stock',
        categorySlug: 'bundles'
    };
}

export const useAppStore = create<AppState>((set, get) => ({
    language: 'en',
    activePage: 'home',
    selectedProduct: null,
    selectedBundle: null,
    cart: [],
    wishlist: ['prod_ocean_glow'],
    appliedCoupon: null,
    user: DEFAULT_USER,
    orders: DEFAULT_ORDERS,
    searchQuery: '',
    searchHistory: ['Serum', 'Moisturizer', 'Cleanser'],
    activeCategory: null,
    activeSkinType: null,
    priceRange: [0, 500],
    sortBy: 'best-selling',

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

    addToCart: (product, size, qty = 1) => {
        const itemId = `${product.id}_${size}`;
        const prevCart = get().cart;
        const matchIndex = prevCart.findIndex((item) => item.id === itemId);
        if (matchIndex > -1) {
            const newCart = [...prevCart];
            newCart[matchIndex].quantity += qty;
            set({ cart: newCart });
        } else {
            set({ cart: [...prevCart, { id: itemId, product, quantity: qty, selectedSize: size }] });
        }
    },

    removeFromCart: (cartItemId) => {
        set({ cart: get().cart.filter((item) => item.id !== cartItemId) });
    },

    updateCartQuantity: (cartItemId, qty) => {
        if (qty <= 0) {
            get().removeFromCart(cartItemId);
            return;
        }
        set({
            cart: get().cart.map((item) => (item.id === cartItemId ? { ...item, quantity: qty } : item))
        });
    },

    clearCart: () => set({ cart: [], appliedCoupon: null }),

    toggleWishlist: (productId) => {
        const prevWish = get().wishlist;
        const isExist = prevWish.includes(productId);
        if (isExist) {
            set({ wishlist: prevWish.filter((id) => id !== productId) });
        } else {
            set({ wishlist: [...prevWish, productId] });
        }
    },

    applyCoupon: (code) => {
        const codeClean = code.toUpperCase().trim();
        const coupon = COUPONS.find((c) => c.code === codeClean);
        if (!coupon) {
            return get().language === 'en' ? 'Invalid promotion code' : 'كود الخصم غير صالح';
        }

        const currentSubtotal = get().cart.reduce(
            (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
            0
        );

        if (currentSubtotal < coupon.minOrderAmount) {
            return get().language === 'en'
                ? `Minimum order amount for this coupon is ${coupon.minOrderAmount} AED/SAR`
                : `الحد الأدنى لتفعيل هذا الكوبون هو ${coupon.minOrderAmount} ريال/درهم`;
        }

        set({ appliedCoupon: coupon });
        return null;
    },

    removeCoupon: () => set({ appliedCoupon: null }),

    loginUser: (email, name = 'Valued Customer') => {
        set({
            user: {
                id: `usr_${Date.now()}`,
                name,
                email,
                phone: '+966 50 000 0000',
                addresses: [
                    {
                        id: 'addr_init',
                        fullName: name,
                        addressLine1: 'Tahlia Terrace Street, House 42A',
                        city: 'Jeddah',
                        state: 'Western Area',
                        postalCode: '21563',
                        country: 'Saudi Arabia',
                        phone: '+966 50 000 0000',
                        isDefault: true
                    }
                ],
                wishlist: []
            }
        });
    },

    registerUser: (name, email, phone) => {
        set({
            user: {
                id: `usr_${Date.now()}`,
                name,
                email,
                phone,
                addresses: [],
                wishlist: []
            }
        });
    },

    logoutUser: () => set({ user: null, wishlist: [] }),

    addNewAddress: (addr) => {
        const user = get().user;
        if (!user) return;
        const newAddr: Address = {
            ...addr,
            id: `addr_${Date.now()}`,
            isDefault: user.addresses.length === 0 ? true : addr.isDefault
        };

        const updatedAddresses = newAddr.isDefault
            ? user.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
            : user.addresses.concat(newAddr);

        set({
            user: { ...user, addresses: updatedAddresses }
        });
    },

    deleteAddress: (id) => {
        const user = get().user;
        if (!user) return;
        set({
            user: {
                ...user,
                addresses: user.addresses.filter((a) => a.id !== id)
            }
        });
    },

    placeOrder: (addr, payment) => {
        const subtotal = get().cart.reduce(
            (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
            0
        );

        let discount = 0;
        const appliedCoupon = get().appliedCoupon;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'percentage') {
                discount = Math.round((subtotal * appliedCoupon.value) / 100);
            } else {
                discount = appliedCoupon.value;
            }
        }

        const shippingFee = subtotal - discount > 200 ? 0 : 25;
        const total = subtotal - discount + shippingFee;

        const newOrder: Order = {
            id: `ord_${Date.now()}`,
            orderNumber: `AURA-${Math.floor(Math.random() * 900000 + 100000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'processing',
            items: get().cart.map((item) => ({
                productId: item.product.id,
                productNameEn: item.product.nameEn,
                productNameAr: item.product.nameAr,
                price: item.product.discountPrice ?? item.product.price,
                quantity: item.quantity,
                image: item.product.image,
                selectedSize: item.selectedSize
            })),
            shippingAddress: addr,
            paymentMethod: payment,
            couponApplied: appliedCoupon?.code,
            subtotal,
            discount,
            shippingFee,
            total,
            trackingNumber: `TRK-${Math.floor(Math.random() * 89000000 + 10000000)}`,
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        get().clearCart();
        return newOrder;
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
}));
