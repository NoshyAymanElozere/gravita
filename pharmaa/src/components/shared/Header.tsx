"use client";

import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { ShoppingBag, Heart, User, Search, Globe, X, Plus, Minus, Trash2, Menu } from 'lucide-react';
import { CATEGORIES } from '../../constants/data';

const BrandLogo = () => (
  <img
    src="/assets/images/Logo.png"
    alt="AURA Laboratories"
    className="h-16 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
  />
);

export default function Header() {
  const {
    language,
    setLanguage,
    activePage,
    setActivePage,
    cart,
    wishlist,
    updateCartQuantity,
    removeFromCart,
    user,
    searchQuery,
    setSearchQuery,
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    setSelectedProduct,
    appliedCoupon
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // Translations
  const t = {
    freeShipping: language === 'en' ? 'Free shipping on orders above 200 AED/SAR' : 'شحن مجاني على الطلبات بأكثر من 200 ريال/درهم',
    brandName: language === 'en' ? 'AURA' : 'أورا',
    brandSub: language === 'en' ? 'LABORATORIES' : 'مختبرات',
    navHome: language === 'en' ? 'Home' : 'الرئيسية',
    navShop: language === 'en' ? 'Shop' : 'المتجر',
    navSpecs: language === 'en' ? 'Design Guide & Project Specs' : 'دليل التصميم والمواصفات',
    searchPlaceholder: language === 'en' ? 'Search elixirs, ingredients, skin concern...' : 'ابحثي عن الإكسير، المكونات، مشاكل البشرة...',
    recentSearches: language === 'en' ? 'Recent Searches' : 'عمليات البحث الأخيرة',
    clear: language === 'en' ? 'Clear' : 'مسح',
    noHistory: language === 'en' ? 'No recent searches' : 'لا توجد عمليات بحث أخيرة',
    cartTitle: language === 'en' ? 'Your Routine Bag' : 'حقيبة الروتين الخاصة بكِ',
    cartEmpty: language === 'en' ? 'Your cosmetic bag is empty.' : 'حقيبة مستحضرات التجميل الخاصة بكِ فارغة.',
    startRoutine: language === 'en' ? 'Start Your Routine' : 'ابدئي روتينكِ الآن',
    checkout: language === 'en' ? 'Secure Checkout' : 'الدفع الآمن',
    viewCart: language === 'en' ? 'View Cart Details' : 'عرض تفاصيل الحقيبة',
    subtotal: language === 'en' ? 'Subtotal' : 'المجموع الفرعي',
    discount: language === 'en' ? 'Discount' : 'الخصم',
    total: language === 'en' ? 'Grand Total' : 'الإجمالي الكلي',
    aed: language === 'en' ? 'AED/SAR' : 'ريال/درهم',
    welcome: language === 'en' ? 'Hello' : 'مرحباً'
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const grandTotal = cartSubtotal - discountAmount;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch);
      addToSearchHistory(localSearch);
      setIsSearchOpen(false);
      setActivePage('shop');
    }
  };

  const selectSuggestedSearch = (q: string) => {
    setLocalSearch(q);
    setSearchQuery(q);
    addToSearchHistory(q);
    setIsSearchOpen(false);
    setActivePage('shop');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-brand-cream/95 backdrop-blur-md border-b border-brand-primary/10 shadow-sm transition-all duration-300">
        {/* Desktop view header row */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 sm:px-8 h-24 items-center justify-between w-full">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer" onClick={() => setActivePage('home')}>
            <BrandLogo />
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 rtl:space-x-reverse text-brand-primary font-medium">
            <button
              onClick={() => setActivePage('home')}
              className={`relative py-1.5 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-brand-primary/70 hover:text-brand-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center ${activePage === 'home' ? 'text-brand-primary after:scale-x-100' : ''
                }`}
            >
              {language === 'en' ? 'Home' : 'الرئيسية'}
            </button>

            <button
              onClick={() => setActivePage('shop')}
              className={`relative py-1.5 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-brand-primary/70 hover:text-brand-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center ${activePage === 'shop' ? 'text-brand-primary after:scale-x-100' : ''
                }`}
            >
              {language === 'en' ? 'Shop' : 'المتجر'}
            </button>

            <button
              onClick={() => setActivePage('bundles')}
              className={`relative py-1.5 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-brand-primary/70 hover:text-brand-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center ${activePage === 'bundles' ? 'text-brand-primary after:scale-x-100' : ''
                }`}
            >
              {language === 'en' ? 'Bundles' : 'الباقات'}
            </button>


            <button
              onClick={() => setActivePage('developer-specs')}
              className={`relative py-1.5 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-brand-primary/70 hover:text-brand-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center ${activePage === 'developer-specs' ? 'text-brand-primary after:scale-x-100' : ''
                }`}
            >
              {language === 'en' ? 'Specs' : 'المواصفات'}
            </button>
          </div>

          {/* Right Side: Circular utility buttons */}
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            {/* User Profile Circular Button */}
            <button
              onClick={() => setActivePage(user ? 'profile' : 'auth')}
              className="w-10 h-10 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center transition-all duration-300 cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
              aria-label="User Account"
            >
              <User size={18} className="transition-colors duration-300" />
            </button>

            {/* Cart Circular Button */}
            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="w-10 h-10 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center transition-all duration-300 cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={18} className="transition-colors duration-300" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-brand-secondary text-brand-cream text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold font-sans animate-pulse">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Wishlist Circular Button */}
            <button
              onClick={() => setActivePage('wishlist')}
              className="w-10 h-10 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center transition-all duration-300 cursor-pointer relative shadow-sm hover:scale-105 active:scale-95"
              aria-label="Wishlist"
            >
              <Heart size={18} className={`transition-colors duration-300 ${activePage === 'wishlist' ? 'fill-brand-secondary text-brand-secondary' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-brand-secondary text-brand-cream text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-semibold font-sans">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Search Circular Button */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setLocalSearch(searchQuery);
              }}
              className="w-10 h-10 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <Search size={18} className="transition-colors duration-300" />
            </button>

            {/* Universal Language Toggler */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3.5 h-10 rounded-full border border-brand-primary/10 hover:border-brand-primary hover:bg-brand-primary hover:text-brand-cream text-brand-primary flex items-center space-x-1.5 rtl:space-x-reverse transition-all duration-300 cursor-pointer text-xs font-semibold shadow-sm hover:scale-105 active:scale-95"
              title="Switch Language"
            >
              <Globe size={14} className="transition-colors duration-300" />
              <span className="text-[10px] font-bold font-sans">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile view header row */}
        <div className="md:hidden flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Hamburger Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300"
              aria-label="Toggle Mobile Menu"
            >
              <Menu size={18} />
            </button>

            {/* Brand Logo */}
            <div className="cursor-pointer flex items-center animate-fade-in" onClick={() => setActivePage('home')}>
              <BrandLogo />
            </div>
          </div>

          {/* Right Side: Cart & Search */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center cursor-pointer relative shadow-sm transition-all duration-300"
            >
              <ShoppingBag size={16} className="transition-colors duration-300" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-secondary text-brand-cream text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-brand-primary text-brand-primary hover:text-brand-cream flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300"
            >
              <Search size={16} className="transition-colors duration-300" />
            </button>

            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-2.5 h-9 rounded-full border border-brand-primary/10 hover:border-brand-primary hover:bg-brand-primary hover:text-brand-cream text-brand-primary flex items-center space-x-1 transition-all duration-300 text-[8px] font-bold shadow-sm"
            >
              <Globe size={10} className="transition-colors duration-300" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ADVANCED FULL-SCREEN SEARCH MODAL OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-brand-primary/50 backdrop-blur-md flex items-start justify-center pt-20 md:pt-28 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-brand-sage-light/15 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sage-light/20">
              <span className="font-serif text-lg font-bold text-brand-primary">
                {language === 'en' ? 'Interactive Search Center' : 'مركز البحث التفاعلي'}
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-brand-sage-light/20 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-6 relative">
              <input
                type="text"
                autoFocus
                placeholder={t.searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="input-field pl-11 pr-4 rtl:pr-11 rtl:pl-4 !py-3.5 !text-sm !rounded-xl"
              />
              <Search className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Recent Search Histories */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {t.recentSearches}
                </span>
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => clearSearchHistory()}
                    className="text-[10px] text-zinc-400 hover:text-red-500 font-semibold uppercase cursor-pointer"
                  >
                    {t.clear}
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {searchHistory.length > 0 ? (
                  searchHistory.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestedSearch(q)}
                      className="bg-zinc-100 hover:bg-brand-sage-light/20 border border-zinc-200/50 hover:border-brand-sage-muted text-zinc-700 hover:text-brand-primary text-xs py-1.5 px-3 rounded-full transition-all cursor-pointer font-sans"
                    >
                      {q}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 italic">{t.noHistory}</span>
                )}
              </div>
            </div>

            {/* Category Quick jump links */}
            <div className="mt-6 pt-4 border-t border-brand-sage-light/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {language === 'en' ? 'Suggested Collections' : 'التشكيلات المقترحة'}
              </span>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      selectSuggestedSearch(language === 'en' ? cat.nameEn : cat.nameAr);
                    }}
                    className="flex items-center text-left rtl:text-right p-2.5 rounded-lg border border-zinc-100 hover:bg-white hover:border-brand-sage-light/60 transition-all cursor-pointer group"
                  >
                    <img src={cat.image} alt="" className="w-8 h-8 rounded object-cover mr-2.5 rtl:ml-2.5 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-semibold tracking-wide text-zinc-800 hover:text-brand-primary font-sans">
                      {language === 'en' ? cat.nameEn : cat.nameAr}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM SLIDING SIDEBAR MINI-CART DRAWER */}
      {isMiniCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMiniCartOpen(false)}
          />

          <div
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 border-l border-brand-sage-light/15 animate-in slide-in-from-right duration-300"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-sage-light/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <ShoppingBag className="text-brand-primary" size={20} />
                <span className="font-serif text-lg font-bold text-brand-primary">
                  {t.cartTitle}
                </span>
              </div>
              <button
                onClick={() => setIsMiniCartOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-brand-sage-light/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 rtl:space-x-reverse pb-4 border-b border-brand-sage-light/10 animate-fade-in"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.nameEn}
                      className="w-16 h-20 rounded-xl object-cover bg-brand-cream/50 border border-brand-sage-light/15 p-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-bold text-zinc-900 truncate">
                        {language === 'en' ? item.product.nameEn : item.product.nameAr}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                        {item.selectedSize === 'Complete Set'
                          ? (language === 'en' ? 'Complete Set' : 'المجموعة الكاملة')
                          : `${language === 'en' ? 'Size' : 'الحجم'}: ${item.selectedSize}`}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Stepper qty controls */}
                        <div className="flex items-center border border-brand-sage-light/40 rounded-lg bg-zinc-50">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-zinc-500 hover:text-brand-primary cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-semibold text-zinc-800 font-sans">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-zinc-500 hover:text-brand-primary cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-xs font-bold text-brand-primary font-sans">
                            {(item.product.discountPrice ?? item.product.price) * item.quantity} {t.aed}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-16">
                  <div className="w-16 h-16 rounded-full bg-brand-sage-light/10 flex items-center justify-center text-brand-sage-muted">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="text-sm font-medium text-zinc-600 font-serif">
                    {t.cartEmpty}
                  </p>
                  <button
                    onClick={() => {
                      setIsMiniCartOpen(false);
                      setSearchQuery('');
                      setActivePage('shop');
                    }}
                    className="bg-brand-primary text-brand-cream py-2.5 px-6 rounded-xl text-xs tracking-wider uppercase font-semibold hover:bg-brand-secondary transition-all cursor-pointer"
                  >
                    {t.startRoutine}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary (if products added) */}
            {cart.length > 0 && (
              <div
                className="p-6 border-t border-brand-sage-light/20 space-y-4"
                style={{ backgroundColor: '#F4F2E4' }}
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-500 font-sans">
                    <span>{t.subtotal}</span>
                    <span>{cartSubtotal} {t.aed}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs text-red-600 font-sans">
                      <span>{t.discount} ({appliedCoupon.code})</span>
                      <span>-{discountAmount} {t.aed}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1.5 border-t border-zinc-200 font-sans">
                    <span>{t.total}</span>
                    <span className="text-brand-primary text-base">{grandTotal} {t.aed}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsMiniCartOpen(false);
                      setActivePage('cart');
                    }}
                    className="btn-secondary !py-3 !text-[10px] w-full !rounded-xl"
                  >
                    {t.viewCart}
                  </button>
                  <button
                    onClick={() => {
                      setIsMiniCartOpen(false);
                      setActivePage('checkout');
                    }}
                    className="btn-primary !py-3 !text-[10px] w-full !rounded-xl"
                  >
                    {t.checkout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE NAVIGATION MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className="relative w-full max-w-[280px] h-full bg-white shadow-2xl flex flex-col z-10 border-r rtl:border-r-0 rtl:border-l border-brand-sage-light/15 animate-in slide-in-from-left rtl:slide-in-from-right duration-300"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-brand-sage-light/20 flex items-center justify-between">
              <span className="font-serif text-base font-bold text-brand-primary">
                {language === 'en' ? 'AURA Navigation' : 'قائمة أورا'}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-brand-sage-light/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <button
                onClick={() => {
                  setActivePage('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${activePage === 'home'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? 'Home' : 'الرئيسية'}
              </button>

              <button
                onClick={() => {
                  setActivePage('shop');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${activePage === 'shop'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? 'Shop' : 'المتجر'}
              </button>

              <button
                onClick={() => {
                  setActivePage('bundles');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${activePage === 'bundles'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? 'Bundles' : 'الباقات'}
              </button>


              <button
                onClick={() => {
                  setActivePage('developer-specs');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${activePage === 'developer-specs'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? 'Specs' : 'المواصفات'}
              </button>

              <div className="h-[1px] bg-brand-sage-light/10 my-4" />

              <button
                onClick={() => {
                  setActivePage('wishlist');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-between ${activePage === 'wishlist'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                <span>{language === 'en' ? 'Wishlist' : 'المفضلة'}</span>
                {wishlist.length > 0 && (
                  <span className="bg-brand-secondary text-brand-cream text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActivePage(user ? 'profile' : 'auth');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${activePage === 'profile' || activePage === 'auth'
                    ? 'bg-brand-primary text-brand-cream'
                    : 'text-brand-primary/75 hover:bg-brand-cream/40 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? 'My Account' : 'حسابي'}
              </button>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-brand-sage-light/10 text-center text-[10px] text-zinc-400 font-sans">
              <p>© {new Date().getFullYear()} AURA Laboratories.</p>
              <p className="mt-1">{language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
