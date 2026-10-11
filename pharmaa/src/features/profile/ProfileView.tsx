"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../store/AppContext';
import { PRODUCTS } from '../../constants/data';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Shield,
  Check,
  Trash2,
  ArrowRight,
  Truck,
  Info,
  Star,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  ChevronDown
} from 'lucide-react';

export default function ProfileView() {
  const {
    language,
    user,
    orders,
    wishlist,
    toggleWishlist,
    addToCart,
    addNewAddress,
    deleteAddress,
    logoutUser,
    setActivePage,
    setSelectedProduct
  } = useApp();

  // Guard if user not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-sage-light/20 flex items-center justify-center text-brand-sage-muted animate-float-slow">
          <User size={30} />
        </div>
        <div className="space-y-2">
          <p className="text-zinc-500 font-serif text-lg font-bold">
            {language === 'en' ? 'Please sign in to manage your premium account.' : 'يرجى تسجيل الدخول لإدارة حسابكِ الشخصي.'}
          </p>
        </div>
        <button
          onClick={() => setActivePage('auth')}
          className="btn-primary w-full sm:w-auto !px-10 !py-3.5 !rounded-xl"
        >
          {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
        </button>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [activeSegment, setActiveSegment] = useState<'info' | 'orders' | 'wishlist' | 'addresses' | 'balance' | 'cards'>('info');
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'in-transit' | 'delivered' | 'returned'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (tab && ['info', 'orders', 'wishlist', 'addresses', 'balance', 'cards'].includes(tab)) {
      setActiveSegment(tab as any);
      setSelectedOrderId(null);
    }
  }, [tab]);

  // Address form states
  const [addrName, setAddrName] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrSuccess, setAddrSuccess] = useState(false);

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrLine || !addrCity) return;

    addNewAddress({
      fullName: addrName,
      addressLine1: addrLine,
      city: addrCity,
      state: addrProvince || 'State',
      postalCode: addrZip || '0000',
      country: 'Saudi Arabia',
      phone: addrPhone || user.phone,
      isDefault: false
    });

    setAddrName('');
    setAddrLine('');
    setAddrCity('');
    setAddrProvince('');
    setAddrZip('');
    setAddrPhone('');
    setAddrSuccess(true);
    setTimeout(() => setAddrSuccess(false), 3000);
  };

  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach((item) => {
      const prod = PRODUCTS.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.selectedSize, item.quantity);
      }
    });
    setActivePage('cart');
  };

  const sidebarItems = [
    { id: 'info', label: language === 'en' ? 'Personal Information' : 'البيانات الشخصية', icon: <User size={16} /> },
    { id: 'orders', label: language === 'en' ? 'My Orders' : 'طلباتي', icon: <ShoppingBag size={16} /> },
    { id: 'addresses', label: language === 'en' ? 'My Addresses' : 'عناويني', icon: <MapPin size={16} /> },
    { id: 'balance', label: language === 'en' ? 'My Balance' : 'رصيدي', icon: <Wallet size={16} /> },
    { id: 'wishlist', label: language === 'en' ? 'My Favorites' : 'مفضلي', icon: <Heart size={16} /> },
    { id: 'cards', label: language === 'en' ? 'Bank Cards' : 'البطاقات البنكية', icon: <CreditCard size={16} /> },
  ];

  const orderTabs = [
    { id: 'all', label: language === 'en' ? 'All' : 'الكل' },
    { id: 'processing', label: language === 'en' ? 'Pending' : 'قيد الانتظار' },
    { id: 'in-transit', label: language === 'en' ? 'In Transit' : 'جاري التوصيل' },
    { id: 'delivered', label: language === 'en' ? 'Delivered' : 'تم التوصيل' },
    { id: 'returned', label: language === 'en' ? 'Return Requests' : 'طلبات الاسترجاع' },
    { id: 'my-file', label: language === 'en' ? 'My File' : 'ملفي' },
  ];

  // Filter orders by active sub-filter
  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === 'all') return true;
    return ord.status === orderFilter;
  });

  const selectedOrder = orders.find((ord) => ord.id === selectedOrderId);

  const currencySymbol = language === 'en' ? 'SAR' : 'ريال';

  return (
    <div className="w-full bg-[#fcfbfa] min-h-screen">

      {/* Centered Page Header Banner */}
      <div className="relative w-full bg-brand-cream/45 py-12 border-b border-brand-cream/80 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle decorative wave SVG line overlay to match screenshot */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none select-none hidden md:block">
          <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 C 150 150, 250 50, 400 100" stroke="#374037" strokeWidth="1" fill="none" />
            <path d="M0 120 C 150 170, 250 70, 400 120" stroke="#374037" strokeWidth="1" fill="none" />
            <path d="M0 140 C 150 190, 250 90, 400 140" stroke="#374037" strokeWidth="1" fill="none" />
            <path d="M0 160 C 150 210, 250 110, 400 160" stroke="#374037" strokeWidth="1" fill="none" />
            <path d="M0 180 C 150 230, 250 130, 400 180" stroke="#374037" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-bold text-brand-primary">
          {activeSegment === 'orders' && (language === 'en' ? 'My Orders' : 'طلباتي')}
          {activeSegment === 'wishlist' && (language === 'en' ? 'My Favorites' : 'مفضلي')}
          {activeSegment === 'addresses' && (language === 'en' ? 'My Addresses' : 'عناويني')}
          {activeSegment === 'info' && (language === 'en' ? 'Personal Information' : 'البيانات الشخصية')}
          {activeSegment === 'balance' && (language === 'en' ? 'My Balance' : 'رصيدي')}
          {activeSegment === 'cards' && (language === 'en' ? 'Bank Cards' : 'البطاقات البنكية')}
        </h1>

        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-zinc-500 mt-2 font-sans">
          <span className="hover:text-brand-primary cursor-pointer" onClick={() => setActivePage('home')}>
            {language === 'en' ? 'Home' : 'الرئيسية'}
          </span>
          <span>&gt;</span>
          <span className="text-brand-primary font-semibold">
            {activeSegment === 'orders' && (language === 'en' ? 'My Orders' : 'طلباتي')}
            {activeSegment === 'wishlist' && (language === 'en' ? 'My Favorites' : 'مفضلي')}
            {activeSegment === 'addresses' && (language === 'en' ? 'My Addresses' : 'عناويني')}
            {activeSegment === 'info' && (language === 'en' ? 'Personal Information' : 'البيانات الشخصية')}
            {activeSegment === 'balance' && (language === 'en' ? 'My Balance' : 'رصيدي')}
            {activeSegment === 'cards' && (language === 'en' ? 'Bank Cards' : 'البطاقات البنكية')}
          </span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="bg-[#F4F2E4]/40 rounded-3xl p-4 sm:p-8 border border-brand-cream/60 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SIDEBAR TABS BAR (Right side for RTL Arabic, Left side for LTR English) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-3xs space-y-1.5 border border-zinc-100/50 order-first lg:order-last">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSegment(item.id as any);
                  setSelectedOrderId(null);
                }}
                className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer ${activeSegment === item.id
                    ? 'bg-brand-cream/85 text-brand-primary shadow-3xs border-r-4 border-brand-primary rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0'
                    : 'text-zinc-650 hover:bg-brand-cream/25 hover:text-brand-primary'
                  }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className={activeSegment === item.id ? 'text-brand-primary' : 'text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>

                {language === 'ar' ? (
                  <ChevronLeft size={15} className={`text-zinc-400 ${activeSegment === item.id ? 'text-brand-primary' : ''}`} />
                ) : (
                  <ChevronRight size={15} className={`text-zinc-400 ${activeSegment === item.id ? 'text-brand-primary' : ''}`} />
                )}
              </button>
            ))}

            <button
              onClick={logoutUser}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse py-3.5 px-4 mt-4 text-red-650 hover:bg-red-50/60 rounded-xl font-semibold transition-all duration-300 cursor-pointer text-xs"
            >
              <Shield size={16} />
              <span>{language === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
            </button>
          </div>

          {/* MAIN PANEL CONTENT AREA (Left side for RTL Arabic, Right side for LTR English) */}
          <div className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-3xs border border-zinc-100/50 min-h-[500px]">

            {/* PERSONAL INFORMATION (البيانات الشخصية) */}
            {activeSegment === 'info' && (
              <form onSubmit={(e) => {
                e.preventDefault();
              }} className="space-y-8 font-sans text-xs">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-800">

                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="block text-zinc-650 font-bold text-sm text-right rtl:text-right ltr:text-left">
                      {language === 'en' ? 'Name' : 'الاسم'}
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name || "ادهم عصام"}
                      className="w-full bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 px-4 text-zinc-850 focus:outline-none focus:ring-1 focus:ring-brand-primary text-right rtl:text-right ltr:text-left text-xs font-semibold"
                    />
                  </div>

                  {/* Mobile field with Saudi flag dropdown */}
                  <div className="space-y-2">
                    <label className="block text-zinc-650 font-bold text-sm text-right rtl:text-right ltr:text-left">
                      {language === 'en' ? 'Mobile Number' : 'رقم الجوال'}
                    </label>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 px-3 text-zinc-800">
                        <img src="https://flagcdn.com/w20/sa.png" alt="SA" className="w-5 h-3.5 object-cover rounded-xs" />
                        <span className="text-[11px] font-mono font-bold">+966</span>
                      </div>
                      <input
                        type="text"
                        defaultValue="1025465325"
                        className="flex-1 bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 px-4 text-zinc-850 focus:outline-none focus:ring-1 focus:ring-brand-primary text-right rtl:text-right ltr:text-left text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="block text-zinc-650 font-bold text-sm text-right rtl:text-right ltr:text-left">
                      {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email || "Test@Gmail.Com"}
                      className="w-full bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 px-4 text-zinc-850 focus:outline-none focus:ring-1 focus:ring-brand-primary text-right rtl:text-right ltr:text-left text-xs font-semibold"
                    />
                  </div>

                  {/* Country dropdown */}
                  <div className="space-y-2">
                    <label className="block text-zinc-650 font-bold text-sm text-right rtl:text-right ltr:text-left">
                      {language === 'en' ? 'Country' : 'الدولة'}
                    </label>
                    <div className="relative">
                      <select
                        defaultValue="Saudi Arabia"
                        className="w-full bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 pl-10 pr-4 text-zinc-850 focus:outline-none focus:ring-1 focus:ring-brand-primary appearance-none cursor-pointer text-right rtl:text-right ltr:text-left text-xs font-semibold"
                      >
                        <option value="Saudi Arabia">{language === 'en' ? 'Saudi Arabia' : 'السعودية'}</option>
                        <option value="United Arab Emirates">{language === 'en' ? 'UAE' : 'الإمارات العربية المتحدة'}</option>
                        <option value="Kuwait">{language === 'en' ? 'Kuwait' : 'الكويت'}</option>
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* City dropdown */}
                  <div className="space-y-2">
                    <label className="block text-zinc-650 font-bold text-sm text-right rtl:text-right ltr:text-left">
                      {language === 'en' ? 'City' : 'المدينة'}
                    </label>
                    <div className="relative">
                      <select
                        defaultValue="Riyadh"
                        className="w-full bg-[#fcfbfa] border border-zinc-200/80 rounded-2xl py-3 pl-10 pr-4 text-zinc-850 focus:outline-none focus:ring-1 focus:ring-brand-primary appearance-none cursor-pointer text-right rtl:text-right ltr:text-left text-xs font-semibold"
                      >
                        <option value="Riyadh">{language === 'en' ? 'Riyadh' : 'الرياض'}</option>
                        <option value="Jeddah">{language === 'en' ? 'Jeddah' : 'جدة'}</option>
                        <option value="Dammam">{language === 'en' ? 'Dammam' : 'الدمام'}</option>
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* Save button - gold/yellow color matching screenshot but using AURA colors styled elegantly */}
                <div className="pt-6 flex justify-start rtl:justify-end ltr:justify-start">
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-secondary text-brand-cream font-bold text-xs py-3.5 px-10 rounded-full shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                  >
                    {language === 'en' ? 'Save Changes' : 'حفظ التعديلات'}
                  </button>
                </div>

              </form>
            )}

            {/* ORDERS MANIFEST TAB */}
            {activeSegment === 'orders' && (
              <div className="space-y-6">
                {selectedOrder ? (
                  // Creative and Modern Order Details View
                  <div className="space-y-8 animate-fade-in text-right rtl:text-right ltr:text-left">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-6">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <button
                          onClick={() => setSelectedOrderId(null)}
                          className="p-2 bg-brand-cream hover:bg-brand-cream/80 text-brand-primary rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center shadow-3xs"
                          title={language === 'en' ? 'Back' : 'العودة'}
                        >
                          {language === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif text-lg font-bold text-brand-primary leading-tight">
                              {language === 'en' ? `Order #${selectedOrder.orderNumber}` : `طلب رقم #${selectedOrder.orderNumber}`}
                            </h3>
                            <span className={`py-1 px-3 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                              selectedOrder.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : selectedOrder.status === 'processing'
                                  ? 'bg-sky-500/10 text-sky-700'
                                  : selectedOrder.status === 'in-transit'
                                    ? 'bg-amber-500/10 text-amber-700'
                                    : 'bg-red-500/10 text-red-700'
                            }`}>
                              {selectedOrder.status === 'delivered' && (language === 'en' ? 'Delivered' : 'تم التوصيل')}
                              {selectedOrder.status === 'processing' && (language === 'en' ? 'Pending' : 'قيد الانتظار')}
                              {selectedOrder.status === 'in-transit' && (language === 'en' ? 'In Transit' : 'جاري التوصيل')}
                              {selectedOrder.status === 'returned' && (language === 'en' ? 'Returned' : 'تم الاسترجاع')}
                              {selectedOrder.status === 'cancelled' && (language === 'en' ? 'Cancelled' : 'ملغي')}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                            {language === 'en' ? `Placed on ${selectedOrder.date}` : `تم الطلب في ${selectedOrder.date}`}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex gap-2 flex-wrap sm:justify-end">
                        {selectedOrder.status === 'processing' && (
                          <button
                            onClick={() => {
                              alert(language === 'en' ? 'Order cancellation request submitted. Our support team will process it shortly.' : 'تم تقديم طلب إلغاء الطلب بنجاح. سيقوم فريقنا بمعالجته قريباً.');
                            }}
                            className="border border-red-200 text-red-750 hover:bg-red-50/50 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer font-sans"
                          >
                            {language === 'en' ? 'Cancel Order' : 'إلغاء الطلب'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="bg-brand-cream text-brand-primary hover:bg-brand-cream/80 border border-brand-cream/40 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer font-sans"
                        >
                          {language === 'en' ? 'Print Invoice' : 'طباعة الفاتورة'}
                        </button>
                      </div>
                    </div>

                    {/* Premium Order Progress Tracker */}
                    <div className="bg-[#fcfbfa] border border-brand-cream/50 rounded-2xl p-6 shadow-3xs font-sans">
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-6">
                        {language === 'en' ? 'Order Status' : 'حالات الطلب'}
                      </h4>

                      {selectedOrder.status === 'cancelled' ? (
                        <div className="flex items-center space-x-3 rtl:space-x-reverse text-red-800 py-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-650 font-bold text-xs">✕</div>
                          <div>
                            <p className="text-xs font-bold">{language === 'en' ? 'Order Cancelled' : 'تم إلغاء الطلب'}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{language === 'en' ? 'Refund will be processed to your card.' : 'سيتم إرجاع المبلغ لبطاقتك البنكية.'}</p>
                          </div>
                        </div>
                      ) : selectedOrder.status === 'returned' ? (
                        <div className="flex items-center space-x-3 rtl:space-x-reverse text-amber-800 py-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-650 font-bold text-xs">↺</div>
                          <div>
                            <p className="text-xs font-bold">{language === 'en' ? 'Return Request Approved' : 'تمت الموافقة على طلب الاسترجاع'}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{language === 'en' ? 'The items have been returned and refunded.' : 'تم استلام المنتجات وإرجاع المبلغ.'}</p>
                          </div>
                        </div>
                      ) : (() => {
                        const steps = [
                          {
                            id: 'pending',
                            labelEn: 'Pending',
                            labelAr: 'قيد الانتظار',
                            isActive: true,
                          },
                          {
                            id: 'confirmed',
                            labelEn: 'Confirmed',
                            labelAr: 'تم التأكيد',
                            isActive: selectedOrder.status === 'in-transit' || selectedOrder.status === 'delivered',
                          },
                          {
                            id: 'shipped',
                            labelEn: 'Shipped',
                            labelAr: 'تم الشحن',
                            isActive: selectedOrder.status === 'in-transit' || selectedOrder.status === 'delivered',
                          },
                          {
                            id: 'delivered',
                            labelEn: 'Delivered',
                            labelAr: 'تم التوصيل',
                            isActive: selectedOrder.status === 'delivered',
                          }
                        ];
                        return (
                          <div className="flex items-center justify-between w-full pb-10 pt-4 px-2 select-none relative text-xs">
                            {steps.map((step, index) => (
                              <React.Fragment key={step.id}>
                                {/* Step Node */}
                                <div className="relative flex flex-col items-center">
                                  {/* Circle Node */}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border ${
                                    step.isActive 
                                      ? 'bg-[#b5832a] border-[#b5832a] text-white shadow-3xs' 
                                      : 'bg-zinc-300 border-zinc-300 text-white'
                                  }`}>
                                    <Check size={10} className="text-white" />
                                  </div>
                                  {/* Label text */}
                                  <div className="absolute top-8 text-center whitespace-nowrap">
                                    <p className={`font-semibold text-[10px] tracking-wide mt-1 transition-colors duration-300 ${
                                      step.isActive ? 'text-[#b5832a] font-bold' : 'text-zinc-400 font-medium'
                                    }`}>
                                      {language === 'en' ? step.labelEn : step.labelAr}
                                    </p>
                                  </div>
                                </div>

                                {/* Segmented connector line */}
                                {index < steps.length - 1 && (
                                  <div className={`flex-grow h-[1.5px] mx-2 transition-colors duration-300 ${
                                    steps[index + 1].isActive 
                                      ? 'bg-[#b5832a]' 
                                      : 'bg-zinc-200'
                                  }`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Ordered Items Manifest */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider font-sans">
                        {language === 'en' ? 'Ordered Items' : 'المنتجات المطلوبة'}
                      </h4>
                      
                      <div className="border border-brand-cream/50 rounded-2xl overflow-hidden divide-y divide-brand-cream/35">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                              <div className="w-16 h-20 rounded-xl bg-brand-cream/30 border border-brand-cream/60 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                                <img src={item.image} alt="" className="max-w-full max-h-full object-cover rounded-lg" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-serif font-bold text-brand-primary text-xs leading-snug">
                                  {language === 'en' ? item.productNameEn : item.productNameAr}
                                </h5>
                                <p className="text-[10px] text-zinc-400 font-medium">
                                  {language === 'en' ? 'Size' : 'الحجم'}: {item.selectedSize}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {language === 'en' ? 'Qty' : 'الكمية'}: <span className="font-bold text-zinc-800">{item.quantity}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                              <div className="text-right rtl:text-right ltr:text-left sm:text-right">
                                <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Price' : 'السعر'}</p>
                                <p className="font-bold text-brand-primary">{item.price} {currencySymbol}</p>
                              </div>
                              <div className="text-right rtl:text-right ltr:text-left sm:text-right">
                                <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Total' : 'المجموع'}</p>
                                <p className="font-bold text-brand-primary text-sm">{item.price * item.quantity} {currencySymbol}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const prod = PRODUCTS.find((p) => p.id === item.productId);
                                  if (prod) {
                                    addToCart(prod, item.selectedSize, item.quantity);
                                    alert(language === 'en' ? 'Item added to bag.' : 'تمت إضافة المنتج للحقيبة.');
                                  }
                                }}
                                className="bg-brand-primary hover:bg-brand-secondary text-brand-cream font-bold text-[10px] py-2 px-3 rounded-xl transition-all duration-300 cursor-pointer"
                              >
                                {language === 'en' ? 'Buy Again' : 'شراء مجدداً'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Shipping Address */}
                      <div className="bg-white border border-brand-cream/50 rounded-2xl p-5 space-y-4 shadow-3xs">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-zinc-100 pb-3">
                          <MapPin size={16} className="text-brand-sage-muted" />
                          <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider font-sans">
                            {language === 'en' ? 'Delivery Address' : 'عنوان التوصيل'}
                          </h4>
                        </div>
                        <div className="space-y-2 font-sans text-xs text-zinc-650">
                          <p className="font-serif font-bold text-brand-primary">{selectedOrder.shippingAddress.fullName}</p>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            {selectedOrder.shippingAddress.addressLine1}
                            {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                            <br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                            <br />
                            {selectedOrder.shippingAddress.country}, {selectedOrder.shippingAddress.postalCode}
                          </p>
                          <p className="text-[10px] font-semibold text-brand-sage-muted mt-2 uppercase">
                            {language === 'en' ? 'Phone' : 'الجوال'}: {selectedOrder.shippingAddress.phone}
                          </p>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-white border border-brand-cream/50 rounded-2xl p-5 space-y-4 shadow-3xs">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-zinc-100 pb-3">
                          <CreditCard size={16} className="text-brand-sage-muted" />
                          <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider font-sans">
                            {language === 'en' ? 'Payment Summary' : 'تفاصيل الدفع والمجموع'}
                          </h4>
                        </div>
                        
                        <div className="space-y-2.5 font-sans text-xs">
                          <div className="flex justify-between items-center text-zinc-550">
                            <span>{language === 'en' ? 'Payment Method' : 'طريقة الدفع'}</span>
                            <span className="font-semibold text-brand-primary capitalize">
                              {selectedOrder.paymentMethod === 'credit_card' 
                                ? (language === 'en' ? 'Credit Card' : 'بطاقة ائتمانية')
                                : selectedOrder.paymentMethod === 'cod'
                                  ? (language === 'en' ? 'Cash on Delivery' : 'الدفع عند الاستلام')
                                  : selectedOrder.paymentMethod === 'apple_pay'
                                    ? 'Apple Pay'
                                    : 'Google Pay'
                            }
                            </span>
                          </div>
                          
                          {selectedOrder.trackingNumber && (
                            <div className="flex justify-between items-center text-zinc-550">
                              <span>{language === 'en' ? 'Tracking Number' : 'رقم التتبع'}</span>
                              <span className="font-mono font-bold text-zinc-800 bg-[#F4F2E4] py-0.5 px-2 rounded-md select-all text-[11px] border border-brand-cream/35">
                                {selectedOrder.trackingNumber}
                              </span>
                            </div>
                          )}

                          <div className="border-t border-zinc-100 my-2 pt-2.5 space-y-1.5">
                            <div className="flex justify-between items-center text-zinc-500">
                              <span>{language === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                              <span className="font-semibold text-zinc-800">{selectedOrder.subtotal} {currencySymbol}</span>
                            </div>

                            {selectedOrder.discount > 0 && (
                              <div className="flex justify-between items-center text-emerald-700">
                                <span className="flex items-center gap-1">
                                  {language === 'en' ? 'Discount' : 'الخصم'}
                                  {selectedOrder.couponApplied && (
                                    <span className="text-[10px] bg-emerald-50 border border-emerald-200/60 py-0.5 px-1.5 rounded-sm font-bold font-mono">
                                      {selectedOrder.couponApplied}
                                    </span>
                                  )}
                                </span>
                                <span className="font-semibold">-{selectedOrder.discount} {currencySymbol}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-zinc-500">
                              <span>{language === 'en' ? 'Shipping Fee' : 'تكلفة الشحن'}</span>
                              <span className="font-semibold text-zinc-800">
                                {selectedOrder.shippingFee === 0 
                                  ? (language === 'en' ? 'Free' : 'مجاني') 
                                  : `${selectedOrder.shippingFee} ${currencySymbol}`
                                }
                              </span>
                            </div>
                          </div>

                          <div className="border-t-2 border-brand-cream border-double pt-2 flex justify-between items-center font-bold text-brand-primary text-sm">
                            <span>{language === 'en' ? 'Total Amount' : 'المجموع الكلي'}</span>
                            <span className="text-base font-serif">{selectedOrder.total} {currencySymbol}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  // Orders List View
                  <>
                    {/* Horizontal capsules for filtering orders */}
                    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin snap-x">
                      {orderTabs.map((tabItem) => (
                        <button
                          key={tabItem.id}
                          onClick={() => {
                            if (tabItem.id === 'my-file') {
                              setActiveSegment('info');
                            } else {
                              setOrderFilter(tabItem.id as any);
                            }
                          }}
                          className={`py-2.5 px-6 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${(tabItem.id === 'my-file' ? false : orderFilter === tabItem.id)
                              ? 'bg-brand-primary text-brand-cream shadow-sm'
                              : 'bg-zinc-100/70 hover:bg-brand-cream/40 text-zinc-650 border border-zinc-200/20'
                            }`}
                        >
                          {tabItem.label}
                        </button>
                      ))}
                    </div>

                    {filteredOrders.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {filteredOrders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => setSelectedOrderId(ord.id)}
                            className="bg-white border border-brand-cream/70 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between hover:shadow-xs hover:border-brand-primary transition-all duration-300 cursor-pointer group"
                          >
                            {/* Status Pill Header */}
                            <div className={`py-2.5 px-4 text-center font-semibold text-[10px] uppercase tracking-wider border-b ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/10'
                                : ord.status === 'processing'
                                  ? 'bg-sky-500/10 text-sky-700 border-sky-500/10'
                                  : ord.status === 'in-transit'
                                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/10'
                                    : 'bg-red-500/10 text-red-700 border-red-500/10'
                            }`}>
                              {ord.status === 'delivered' && (language === 'en' ? 'Delivered' : 'تم التوصيل')}
                              {ord.status === 'processing' && (language === 'en' ? 'Pending' : 'قيد الانتظار')}
                              {ord.status === 'in-transit' && (language === 'en' ? 'In Transit' : 'جاري التوصيل')}
                              {ord.status === 'returned' && (language === 'en' ? 'Returned' : 'جاري مراجعة طلب الاسترجاع')}
                              {ord.status === 'cancelled' && (language === 'en' ? 'Cancelled' : 'ملغي')}
                            </div>

                            {/* Card Content Grid */}
                            <div className="p-5 flex justify-between items-center space-x-4 rtl:space-x-reverse">
                              <div className="space-y-1.5 font-sans">
                                <div className="text-xs text-zinc-400 font-medium">
                                  {language === 'en' ? 'Order Number' : 'رقم الطلب'}: <span className="font-bold text-zinc-900 font-mono">{ord.orderNumber}</span>
                                </div>
                                <div className="text-xs text-zinc-550">
                                  {language === 'en' ? `Number of products (${ord.items.length})` : `عدد المنتجات ( ${ord.items.length} )`}
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                  {ord.date}
                                </div>
                              </div>

                              {/* Product Thumbnails Stack */}
                              <div className="flex -space-x-4 rtl:space-x-reverse overflow-hidden">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="w-12 h-12 rounded-full border-2 border-white bg-brand-cream/30 overflow-hidden shadow-sm flex-shrink-0">
                                    <img src={it.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Card Footer: Total Price & CTA */}
                            <div className="bg-zinc-50/50 p-4 border-t border-zinc-100 flex justify-between items-center text-xs group-hover:bg-brand-cream/10 transition-colors duration-300">
                              <div className="flex flex-col">
                                <span className="text-zinc-400 text-[10px] uppercase tracking-wider">{language === 'en' ? 'Total Price' : 'السعر الإجمالي'}</span>
                                <span className="font-bold text-brand-primary text-sm mt-0.5">{ord.total} {currencySymbol}</span>
                              </div>
                              <span className="text-brand-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1 font-semibold text-[11px] font-sans">
                                {language === 'en' ? 'View Details' : 'تفاصيل الطلب'}
                                <ArrowRight size={12} className="rtl:rotate-180" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-brand-cream/60 rounded-2xl py-16 text-center space-y-4 flex flex-col items-center">
                        <ShoppingBag size={48} className="text-brand-sage-light/50" />
                        <p className="text-zinc-500 italic font-serif">
                          {language === 'en' ? 'No orders under this category.' : 'لا توجد طلبيات تحت هذا التصنيف حالياً.'}
                        </p>
                        <button
                          onClick={() => setActivePage('shop')}
                          className="bg-brand-primary text-brand-cream hover:bg-brand-secondary font-bold text-xs py-2.5 px-6 rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Shop Our Products' : 'تسوق منتجاتنا'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* WISHLIST MANIFEST TAB */}
            {activeSegment === 'wishlist' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-cream pb-3">
                  {language === 'en' ? 'Wishlist Catalog' : 'مفضلي'}
                </h3>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                    {wishlist.map((id) => {
                      const prod = PRODUCTS.find((p) => p.id === id);
                      if (!prod) return null;
                      return (
                        <div
                          key={prod.id}
                          className="p-4 bg-white border border-brand-cream rounded-2xl flex space-x-3.5 rtl:space-x-reverse relative group hover:border-brand-sage-muted transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-red-500 cursor-pointer transition-colors"
                            aria-label="Remove"
                          >
                            <Trash2 size={13} />
                          </button>

                          <img src={prod.image} alt="" className="w-14 h-18 object-cover rounded-xl bg-brand-cream/20 p-0.5 border border-brand-sage-light/10" />

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="min-w-0">
                              <h4
                                onClick={() => setSelectedProduct(prod)}
                                className="font-serif font-bold text-brand-primary truncate m-0 group-hover:text-brand-secondary cursor-pointer leading-tight"
                              >
                                {language === 'en' ? prod.nameEn : prod.nameAr}
                              </h4>
                              <span className="text-[9px] text-brand-sage-muted font-medium block pt-0.5">{prod.size}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-brand-cream/40">
                              <span className="font-bold text-brand-primary font-sans">{prod.discountPrice ?? prod.price} {currencySymbol}</span>
                              <button
                                onClick={() => {
                                  addToCart(prod, prod.size, 1);
                                  toggleWishlist(prod.id);
                                }}
                                className="text-[9px] text-brand-primary hover:text-brand-secondary font-bold uppercase cursor-pointer flex items-center gap-0.5 leading-none font-sans"
                              >
                                <span>{language === 'en' ? 'Transfer to Bag' : 'نقل للحقيبة'}</span>
                                <ArrowRight size={10} className="rtl:rotate-180" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-zinc-550 italic space-y-3 font-serif">
                    <Heart size={36} className="text-brand-sage-light/40 mx-auto" />
                    <p>{language === 'en' ? 'Your wishlist is currently clean.' : 'قائمة أمنياتكِ فارغة من المستحضرات حالياً.'}</p>
                  </div>
                )}
              </div>
            )}

            {/* ADDRESS BOOK TAB */}
            {activeSegment === 'addresses' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-cream pb-3">
                  {language === 'en' ? 'Address Book' : 'دفتر العناوين'}
                </h3>

                {/* Render address cards lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs text-zinc-650">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 bg-white border border-brand-cream rounded-2xl relative space-y-2 shadow-3xs"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-bold text-brand-primary text-xs block">{addr.fullName}</span>

                        {addr.isDefault ? (
                          <span className="bg-emerald-500/10 text-emerald-700 py-0.5 px-2 rounded-full text-[9px] font-sans font-semibold">
                            {language === 'en' ? 'Default' : 'الرئيسي'}
                          </span>
                        ) : (
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors"
                            title="Delete Location"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] leading-relaxed font-sans text-zinc-500">{addr.addressLine1}, {addr.city}, {addr.state}, {addr.country}</p>
                      <p className="text-[10px] text-brand-sage-muted font-sans font-semibold uppercase">{language === 'en' ? 'Mobile' : 'الجوال'}: {addr.phone}</p>
                    </div>
                  ))}
                </div>

                {/* Form to append new address record */}
                <form onSubmit={handleCreateAddress} className="pt-6 border-t border-brand-cream/50 space-y-4 text-xs font-sans">
                  <h4 className="font-serif text-sm font-bold text-brand-primary uppercase">
                    {language === 'en' ? 'Register New Destination' : 'إضافة عنوان شحن جديد'}
                  </h4>

                  {addrSuccess && (
                    <p className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold font-sans p-3 rounded-xl">
                      Location record registered safely in directory!
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="input-label">{language === 'en' ? 'Full Recipient Name' : 'الاسم الكامل للمستلم'}</label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">{language === 'en' ? 'Mobile' : 'الجوال'}</label>
                      <input
                        type="text"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="+966"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="input-label">{language === 'en' ? 'Street & House Number' : 'اسم الشارع، رقم الفيلا والمنزل'}</label>
                    <input
                      type="text"
                      required
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="input-label">{language === 'en' ? 'City' : 'المدينة'}</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">{language === 'en' ? 'State / Region' : 'المنطقة أو المحافظة'}</label>
                      <input
                        type="text"
                        value={addrProvince}
                        onChange={(e) => setAddrProvince(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">{language === 'en' ? 'ZIP Code' : 'الرمز البريدي / صندوق البريد'}</label>
                      <input
                        type="text"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary !py-3 !px-6 !rounded-xl !text-[10px]"
                  >
                    {language === 'en' ? 'Save Location Info' : 'حفظ الموقِع الجغرافي'}
                  </button>
                </form>
              </div>
            )}

            {/* MY BALANCE TAB */}
            {activeSegment === 'balance' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-cream pb-3">
                  {language === 'en' ? 'My Balance' : 'رصيدي'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Premium Card */}
                  <div className="bg-brand-primary text-brand-cream rounded-3xl p-6 relative overflow-hidden shadow-md space-y-8">
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-15" style={{ backgroundImage: "url('/assets/images/Patterns-02.jpg')" }} />
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-sage-light font-bold block">{language === 'en' ? 'Available Balance' : 'الرصيد المتاح'}</span>
                        <span className="text-2xl font-bold font-sans block mt-1">1,250.00 {currencySymbol}</span>
                      </div>
                      <Wallet size={24} className="text-brand-sage-light" />
                    </div>

                    <div className="flex justify-between items-end z-10 relative">
                      <span className="text-[11px] font-mono tracking-wider">AURA PRESTIGE CARD</span>
                      <span className="text-xs bg-brand-cream text-brand-primary font-bold py-1 px-3.5 rounded-full">{language === 'en' ? 'Active' : 'نشط'}</span>
                    </div>
                  </div>

                  {/* Loyalty points card */}
                  <div className="bg-white border border-brand-cream rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-sage-muted font-bold block">{language === 'en' ? 'Aura Loyalty Points' : 'نقاط ولاء أورا'}</span>
                        <span className="text-xl font-bold font-sans text-brand-primary block mt-1">320 {language === 'en' ? 'Points' : 'نقطة'}</span>
                      </div>
                      <Star size={24} className="text-brand-sage-muted" />
                    </div>
                    <p className="text-zinc-550 text-[11px] font-sans mt-4 leading-relaxed">
                      {language === 'en' ? 'Earn points on every clinical purchase. 100 points = 50 SAR store coupon.' : 'اكتسبي نقاطاً مع كل طلب مستحضر. كل 100 نقطة تعادل كوبون خصم بقيمة 50 ريال.'}
                    </p>
                  </div>
                </div>

                {/* Transactions list */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-serif text-sm font-bold text-brand-primary">{language === 'en' ? 'Recent Transactions' : 'العمليات الأخيرة'}</h4>
                  <div className="bg-white border border-brand-cream rounded-2xl overflow-hidden divide-y divide-brand-cream/30 text-xs">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-semibold block text-zinc-800">{language === 'en' ? 'Cashback from Order #NFD1234' : 'استرجاع نقدي من الطلب #NFD1234'}</span>
                        <span className="text-[10px] text-zinc-400">2024-02-12</span>
                      </div>
                      <span className="text-emerald-600 font-bold font-sans">+120.00 {currencySymbol}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-semibold block text-zinc-800">{language === 'en' ? 'Welcome Reward Bonus' : 'هدية التسجيل والترحيب الماسية'}</span>
                        <span className="text-[10px] text-zinc-400">2024-01-20</span>
                      </div>
                      <span className="text-emerald-600 font-bold font-sans">+1,130.00 {currencySymbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BANK CARDS TAB */}
            {activeSegment === 'cards' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-primary border-b border-brand-cream pb-3">
                  {language === 'en' ? 'Saved Payment Cards' : 'البطاقات البنكية'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Simulated Credit Card */}
                  <div className="bg-gradient-to-br from-[#4A5948] to-[#374037] text-brand-cream rounded-2xl p-6 relative overflow-hidden shadow-md flex flex-col justify-between h-44">
                    <div className="flex justify-between items-start z-10 relative">
                      <span className="font-serif font-bold text-sm tracking-wide">AURA</span>
                      <span className="text-[10px] font-semibold text-brand-sage-light tracking-widest uppercase">MADA / VISA</span>
                    </div>

                    <div className="z-10 relative space-y-4">
                      <div className="text-lg font-mono tracking-widest text-center">
                        **** **** **** 4821
                      </div>
                      <div className="flex justify-between items-end text-[10px] font-sans">
                        <div>
                          <span className="text-zinc-400 block uppercase tracking-wider">Cardholder</span>
                          <span className="font-semibold mt-0.5 block">{user.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block uppercase tracking-wider">Expires</span>
                          <span className="font-semibold mt-0.5 block">08/28</span>
                        </div>
                      </div>
                    </div>
                    {/* Subtle card circle decorations */}
                    <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-brand-cream/5 rounded-full" />
                  </div>

                  {/* Add new card box */}
                  <div className="border border-dashed border-brand-cream hover:border-brand-sage-muted rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-colors group min-h-[176px]">
                    <div className="p-3 bg-brand-cream rounded-full group-hover:scale-110 transition-transform">
                      <CreditCard size={20} className="text-brand-primary" />
                    </div>
                    <div>
                      <h5 className="font-serif text-xs font-bold text-brand-primary">{language === 'en' ? 'Register New Payment Card' : 'إضافة بطاقة دفع جديدة'}</h5>
                      <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">{language === 'en' ? 'Securely save cards for swift premium checkouts.' : 'احفظي بطاقتكِ بأمان لتسهيل عمليات الدفع المستقبلية.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
