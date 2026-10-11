"use client";

import React, { useState, useEffect } from 'react';
import { useApp, convertBundleToProduct } from '../../store/AppContext';
import { PRODUCTS, BUNDLES } from '../../constants/data';
import { Star, Heart, Plus, Minus, ShieldCheck, HelpCircle, ArrowRight, CornerDownLeft, Sparkles, Check, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../../components/shared/ProductCard';
import SectionTitle from '../../components/shared/SectionTitle';

export default function ProductDetailsView() {
  const {
    language,
    selectedProduct,
    setSelectedProduct,
    selectedBundle,
    setSelectedBundle,
    addToCart,
    wishlist,
    toggleWishlist,
    setActivePage
  } = useApp();

  // Translations
  const t = {
    ratingLabelEn: 'Dermatologist Evaluated',
    ratingLabelAr: 'تم التقييم من أطباء جلدية',
    sizeLabelEn: 'Net Volume',
    sizeLabelAr: 'الحجم الصافي',
    stockInEn: 'In Stock • Ships Temperature Controlled',
    stockInAr: 'متوفر • شحن مبرد طبيعي آمن',
    buyNowEn: 'Instant Buy Now',
    buyNowAr: 'شراء فوري سريع',
    addToBagEn: 'Add Routine Bag',
    addToBagAr: 'أضيفي للحقيبة التجميلية',
    benefitsTitleEn: 'Clinical Benefits:',
    benefitsTitleAr: 'الفوائد السريرية المثبتة:',
    descriptionEn: 'Clinical Profile',
    descriptionAr: 'الملف الطبي المعتمد',
    ingredientsEn: 'Ingredients Spec',
    ingredientsAr: 'المكونات بالتفصيل',
    howToUseEn: 'Application Ritual',
    howToUseAr: 'طقوس الاستخدام والجرعة',
    shippingTabEn: 'Shipping & Returns',
    shippingTabAr: 'الشحن الفاخر والضمان',
    shippingDescEn: 'We dispatch all potions inside insulated white presentation boxes equipped with cooling cells. Hand-delivered across KSA and UAE doors within 3-4 working days. Aura offers free luxury exchanges on pristine items within 14 days.',
    shippingDescAr: 'نقوم بشحن جميع المنتجات والجرعات بداخل صناديق بيضاء فاخرة معزولة ومجهزة بخلايا تبريد لحماية المواد. يتم التوصيل والتسليم لباب منزلكِ في غضون 3-4 أيام عمل. نوفر ميزة الاستبدال أو الاسترجاع الفاخر خلال 14 يوماً من الاستلام.',
    bundleTitleEn: 'Frequently Bought Together',
    bundleTitleAr: 'مجموعة التآزر المقترحة (الترطيب المتكامل)',
    bundleSubEn: 'Activate maximum therapeutic skin repair with synergy. Save 10% on this complete selection.',
    bundleSubAr: 'نشطي روتين العلاج والترميم الأقصى بتوفير 10٪ على هذا المستحضر والمكملات المتناسقة معه.',
    addBundleBtnEn: 'Add Selection to Routine (Save 10%)',
    addBundleBtnAr: 'أضيفي المجموعة للحقيبة (توفير 10٪)',
    relatedTitleEn: 'You May Also Consult',
    relatedTitleAr: 'منتجات أخرى قد تهمكِ أيضاً',
    relatedSubtitleEn: 'Explore complementing elixirs in our pharmacy line.',
    relatedSubtitleAr: 'استكشفي تركيبات تكميلية دقيقة لبشرة ممتازة.',
    aed: language === 'en' ? 'AED/SAR' : 'ريال',
    saveEn: 'Save',
    saveAr: 'توفير'
  };

  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'how' | 'shipping'>('desc');
  const [activeBundleTab, setActiveBundleTab] = useState<'desc' | 'ingredients' | 'how' | 'shipping'>('desc');
  const [activeImage, setActiveImage] = useState(selectedProduct?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(selectedProduct ? wishlist.includes(selectedProduct.id) : false);

  const [buyMatch1, setBuyMatch1] = useState(true);
  const [buyMatch2, setBuyMatch2] = useState(false);

  // Scroll to top on navigation/state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedProduct?.id, selectedBundle?.id]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      setQuantity(1);
      setIsWished(wishlist.includes(selectedProduct.id));
    }
  }, [selectedProduct, wishlist]);

  // Frequently bought together states
  const bundleMatch1 = selectedProduct
    ? (PRODUCTS.find((p) => p.id !== selectedProduct.id && p.categorySlug === 'serums') || PRODUCTS[0])
    : PRODUCTS[0];
  const bundleMatch2 = selectedProduct
    ? (PRODUCTS.find((p) => p.id !== selectedProduct.id && p.id !== bundleMatch1.id && p.categorySlug === 'moisturizers') || PRODUCTS[1])
    : PRODUCTS[1];

  const matchingBundle = selectedProduct
    ? (BUNDLES.find(b => b.items.some(item => item.product.id === selectedProduct.id)) || BUNDLES[0])
    : BUNDLES[0];

  const productBundles = selectedProduct
    ? BUNDLES.filter(b => b.items.some(item => item.product.id === selectedProduct.id))
    : [];

  // If a bundle is selected, show the premium Bundle details section
  if (selectedBundle) {
    const b = selectedBundle;
    const isWished = wishlist.includes(b.id);

    const handleAddEntireBundle = () => {
      addToCart(convertBundleToProduct(b), 'Complete Set', 1);
      setActivePage('cart');
    };

    const savings = b.originalPrice - b.bundlePrice;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 animate-fade-in">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-[10px] tracking-widest font-semibold text-brand-sage-muted uppercase">
          <button onClick={() => setActivePage('home')} className="hover:text-brand-primary transition-colors cursor-pointer">
            {language === 'en' ? 'Home' : 'الرئيسية'}
          </button>
          <span className="text-brand-sage-light">/</span>
          <span className="text-brand-primary">{language === 'en' ? b.nameEn : b.nameAr}</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Bundle Banner Image */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-lg border border-brand-sage-light/20 bg-brand-cream/35 p-2 h-[320px] sm:h-[420px] lg:h-[480px]">
            <img
              src={b.image}
              alt={b.nameEn}
              className="w-full h-full object-cover rounded-2xl animate-fade-in"
            />
            <div className="absolute top-6 left-6 bg-red-650 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-md">
              {language === 'en' ? `${b.discountPercentage}% Bundle Saving` : `خصم باقة ${b.discountPercentage}%`}
            </div>
          </div>

          {/* Bundle Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="badge badge-primary">
                {language === 'en' ? 'Curated Skincare Routine' : 'روتين عناية متكامل'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary leading-tight tracking-tight">
                {language === 'en' ? b.nameEn : b.nameAr}
              </h1>
              <p className="text-zinc-650 text-sm font-sans italic leading-relaxed">
                {language === 'en' ? b.subtitleEn : b.subtitleAr}
              </p>
            </div>

            <p className="text-zinc-650 text-xs sm:text-sm font-sans leading-relaxed">
              {language === 'en' ? b.descriptionEn : b.descriptionAr}
            </p>

            {/* Pricing Summary Card */}
            <div className="bg-gradient-to-r from-brand-cream/80 to-brand-sage-light/10 p-6 rounded-2xl border border-brand-sage-light/20 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="input-label !mb-1">{language === 'en' ? 'Individual Value' : 'القيمة منفردة'}</span>
                  <span className="text-zinc-400 line-through text-sm font-semibold font-sans">{b.originalPrice} {language === 'en' ? 'AED/SAR' : 'ريال'}</span>
                </div>
                <div className="text-right">
                  <span className="input-label !mb-1 text-emerald-700 font-bold">{language === 'en' ? 'Bundle Price' : 'سعر الباقة الكلي'}</span>
                  <span className="text-brand-primary text-2xl font-bold font-sans">{b.bundlePrice} {language === 'en' ? 'AED/SAR' : 'ريال'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-brand-sage-light/20">
                <span className="text-xs font-semibold text-emerald-700">
                  {language === 'en' ? `You save ${savings} AED/SAR (${b.discountPercentage}% off)` : `توفير إضافي بقيمة ${savings} ريال (${b.discountPercentage}٪ خصم)`}
                </span>
                <span className="text-[10px] text-zinc-500 font-sans">
                  {language === 'en' ? 'Free Insulated Shipping' : 'شحن حراري مبرد مجاني'}
                </span>
              </div>
              <button
                onClick={handleAddEntireBundle}
                className="w-full btn-primary !py-4 !rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles size={16} className="animate-pulse" />
                <span>{language === 'en' ? 'Add Entire Routine Bundle' : 'أضيفي الباقة الكاملة للحقيبة'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section (Matching Product Details design system) */}
        <div className="card-base bg-white p-6 sm:p-10 !rounded-2xl">
          {/* Buttons header */}
          <div className="flex border-b border-brand-sage-light/10 pb-3 gap-6 sm:gap-10 overflow-x-auto scrollbar-none">
            {[
              { id: 'desc', labelEn: 'Description', labelAr: 'الوصف' },
              { id: 'ingredients', labelEn: 'Ingredients Spec', labelAr: 'المكونات بالتفصيل' },
              { id: 'how', labelEn: 'Application Ritual', labelAr: 'طقوس الاستخدام والجرعة' },
              { id: 'shipping', labelEn: 'Shipping & Returns', labelAr: 'الشحن والضمان' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveBundleTab(tab.id as any)}
                className={`text-xs sm:text-sm font-semibold uppercase tracking-wider pb-3 border-b-2 cursor-pointer transition-all duration-300 whitespace-nowrap ${activeBundleTab === tab.id
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-zinc-400 hover:text-brand-primary'
                  }`}
              >
                {language === 'en' ? tab.labelEn : tab.labelAr}
              </button>
            ))}
          </div>

          {/* Dynamic content rendering panel */}
          <div className="text-zinc-650 text-xs sm:text-sm leading-relaxed font-sans max-w-4xl space-y-4 pt-8">
            {activeBundleTab === 'desc' && (
              <p>{language === 'en' ? b.descriptionEn : b.descriptionAr}</p>
            )}

            {activeBundleTab === 'ingredients' && (
              <p className="whitespace-pre-line">
                {language === 'en'
                  ? b.items.map((item) => `${item.product.nameEn}: ${item.product.ingredientsEn}`).join('\n\n')
                  : b.items.map((item) => `${item.product.nameAr}: ${item.product.ingredientsAr}`).join('\n\n')}
              </p>
            )}

            {activeBundleTab === 'how' && (
              <p className="whitespace-pre-line">
                {language === 'en'
                  ? b.items.map((item) => `${item.product.nameEn}: ${item.product.howToUseEn}`).join('\n\n')
                  : b.items.map((item) => `${item.product.nameAr}: ${item.product.howToUseAr}`).join('\n\n')}
              </p>
            )}

            {activeBundleTab === 'shipping' && (
              <p>{language === 'en' ? t.shippingDescEn : t.shippingDescAr}</p>
            )}
          </div>
        </div>

        {/* Products In Target Bundle Section */}
        <div className="space-y-8 pt-8">
          <SectionTitle
            subtitle={language === 'en' ? 'Included Formulations' : 'المستحضرات المشمولة في الباقة'}
            title={language === 'en' ? 'Meet the Products' : 'المستحضرات المكونة للمجموعة'}
            description={language === 'en' ? 'A detailed look at the premium clinical formulations configured in this bundle. Click any card to explore its detailed specs and ingredients.' : 'تفاصيل المستحضرات الطبية والسريرية المشمولة بهذه باقة العناية. اضغطي على أي مستحضر لمشاهدة التفاصيل بالكامل.'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {b.items.map((item) => {
              const p = item.product;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="card-elevated overflow-hidden group hover:scale-[1.01] hover:shadow-lg transition-all duration-300 border border-brand-sage-light/10 bg-white flex flex-col justify-between cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-brand-cream/30 p-2">
                    <img
                      src={p.image}
                      alt={p.nameEn}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-serif text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1">
                        {language === 'en' ? p.nameEn : p.nameAr}
                      </h4>
                      <p className="text-zinc-500 text-xs font-sans line-clamp-3 leading-relaxed">
                        {language === 'en' ? p.descriptionEn : p.descriptionAr}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-150 flex items-center justify-between text-[11px] font-sans">
                      <span className="font-semibold text-brand-primary">
                        {p.discountPrice ?? p.price} {language === 'en' ? 'AED/SAR' : 'ريال'}
                      </span>
                      <span className="text-brand-primary font-bold uppercase tracking-wider group-hover:underline flex items-center gap-1">
                        {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                        <ArrowRight size={12} className="rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // Guard if no product selected
  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-650 font-serif">Select a luxury formulation to inspect.</p>
        <button
          onClick={() => setActivePage('shop')}
          className="mt-4 bg-brand-primary text-brand-cream text-xs font-semibold py-3 px-6 rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Go To Collections
        </button>
      </div>
    );
  }

  // Hooks migrated to top level to comply with rules of hooks

  const hasDiscount = selectedProduct.discountPrice !== undefined;
  const currentPrice = selectedProduct.discountPrice ?? selectedProduct.price;

  // Bundle calculations
  let bundleSubtotal = currentPrice;
  if (buyMatch1) bundleSubtotal += bundleMatch1.discountPrice ?? bundleMatch1.price;
  if (buyMatch2) bundleSubtotal += bundleMatch2.discountPrice ?? bundleMatch2.price;

  const bundleDiscount = Math.round(bundleSubtotal * 0.1); // 10% bundle discount
  const bundleTotal = bundleSubtotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    // Add current
    addToCart(selectedProduct, selectedProduct.size, 1);
    // Add matches if checked
    if (buyMatch1) addToCart(bundleMatch1, bundleMatch1.size, 1);
    if (buyMatch2) addToCart(bundleMatch2, bundleMatch2.size, 1);

    setActivePage('cart');
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedProduct.size, quantity);
    setActivePage('checkout');
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Related products (limit to same category, max 3)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.categorySlug === selectedProduct.categorySlug && p.id !== selectedProduct.id
  ).slice(0, 3);

  // Translations relocated to top-level context

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">

      {/* Product Card Upper Half: Gallery + Info Details */}
      <div className="card-elevated grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-5 sm:p-8 lg:p-10 !rounded-2xl">

        {/* LEFT COMPONENT: GALLERY SYSTEM */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-start">
          {/* Large display screen */}
          <div className="img-zoom-container w-full h-[340px] sm:h-[460px] lg:h-[500px] bg-brand-cream/30 border border-brand-sage-light/12 p-1.5 relative !rounded-2xl">
            <img
              src={activeImage}
              alt={selectedProduct.nameEn}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Carousel thumbnails */}
          {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 && (
            <div className="flex space-x-3.5 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-thin">
              {selectedProduct.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 sm:w-18 sm:h-22 rounded-xl flex-shrink-0 overflow-hidden border-2 p-0.5 bg-white transition-all duration-300 cursor-pointer ${activeImage === img ? 'border-brand-primary shadow-md scale-105' : 'border-brand-sage-light/20 hover:border-brand-sage-muted hover:shadow-sm'
                    }`}
                >
                  <img src={img} alt="Cosmetics thumbnail view" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: INFO DESCRIPTIONS PANEL */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest font-semibold text-brand-sage-muted uppercase">
              <button onClick={() => setActivePage('shop')} className="hover:text-brand-primary transition-colors cursor-pointer">{language === 'en' ? 'Collections' : 'مجموعات'}</button>
              <span className="text-brand-sage-light">/</span>
              <span className="text-brand-primary">{selectedProduct.categorySlug}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary leading-tight tracking-tight">
              {language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAr}
            </h1>

            {/* Product Subtitle */}
            <p className="text-zinc-650 text-xs sm:text-sm font-sans italic leading-relaxed">
              {language === 'en' ? selectedProduct.subtitleEn : selectedProduct.subtitleAr}
            </p>

            {/* Rating Stars row */}
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse pt-1 pb-1">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-zinc-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-900 font-sans">{selectedProduct.rating}</span>
            </div>

            {/* Price display card */}
            <div className="bg-gradient-to-r from-brand-cream/60 to-brand-sage-light/10 p-5 rounded-xl border border-brand-sage-light/15 flex items-center justify-between">
              <div>
                <span className="input-label !mb-1.5">{language === 'en' ? 'Aura pricing' : 'السعر المعتمد'}</span>
                <div className="flex items-baseline space-x-2.5 rtl:space-x-reverse">
                  {hasDiscount ? (
                    <>
                      <span className="text-brand-primary text-2xl font-bold font-sans">
                        {selectedProduct.discountPrice} {t.aed}
                      </span>
                      <span className="text-zinc-400 text-sm line-through font-sans">
                        {selectedProduct.price} {t.aed}
                      </span>
                      <span className="badge badge-sale !text-[9px]">
                        {t.saveEn} {selectedProduct.price - (selectedProduct.discountPrice ?? 0)} {t.aed}
                      </span>
                    </>
                  ) : (
                    <span className="text-brand-primary text-2xl font-bold font-sans">
                      {selectedProduct.price} {t.aed}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="input-label !mb-1.5">
                  {language === 'en' ? t.sizeLabelEn : t.sizeLabelAr}
                </span>
                <span className="text-xs font-bold text-brand-primary bg-white border border-brand-sage-light/20 px-4 py-2 rounded-lg inline-block font-sans shadow-sm">
                  {selectedProduct.size}
                </span>
              </div>
            </div>



            {/* Key Clinical Benefits layout */}
            <div className="space-y-2 pt-2">
              <h4 className="input-label">
                {language === 'en' ? t.benefitsTitleEn : t.benefitsTitleAr}
              </h4>
              <ul className="grid grid-cols-1 gap-1.5 font-sans">
                {(language === 'en' ? selectedProduct.benefitsEn : selectedProduct.benefitsAr).map((item, idx) => (
                  <li key={idx} className="flex items-start text-xs text-zinc-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-brand-sage-light/20 flex items-center justify-center mr-2.5 rtl:ml-2.5 flex-shrink-0 mt-0.5"><Check className="text-brand-primary" size={11} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ADD AND ACCELERATED ACTIONS CONTAINER */}
          <div className="pt-5 border-t border-brand-sage-light/12 space-y-3">
            <div className="flex space-x-3 rtl:space-x-reverse">
              {/* Counter Step Picker */}
              <div className="flex items-center border-2 border-brand-sage-light/25 rounded-xl bg-brand-cream/30 font-sans">
                <button
                  onClick={decrementQty}
                  className="p-3.5 text-brand-sage-muted hover:text-brand-primary cursor-pointer h-full transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="px-5 text-sm font-bold text-brand-primary min-w-[28px] text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  className="p-3.5 text-brand-sage-muted hover:text-brand-primary cursor-pointer h-full transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add Routine Bag CTA */}
              <button
                onClick={() => addToCart(selectedProduct, selectedProduct.size, quantity)}
                className="btn-primary flex-1 !py-4 !rounded-xl"
              >
                {language === 'en' ? t.addToBagEn : t.addToBagAr}
              </button>

              {/* Wishlist toggle block */}
              <button
                onClick={() => {
                  toggleWishlist(selectedProduct.id);
                  setIsWished(!isWished);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isWished ? 'border-red-200 bg-red-50 text-red-500 shadow-sm' : 'border-brand-sage-light/20 text-brand-sage-muted hover:text-brand-primary hover:border-brand-sage-muted hover:bg-brand-cream/30'
                  }`}
                aria-label="Wishlist Trigger"
              >
                <Heart size={18} className={isWished ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Buy now direct CTA */}
            <button
              onClick={handleBuyNow}
              className="btn-secondary w-full !py-3.5 !rounded-xl"
            >
              {language === 'en' ? t.buyNowEn : t.buyNowAr}
            </button>
          </div>

        </div>

      </div>

      <div className="card-base bg-white p-6 sm:p-10 !rounded-2xl">
        {/* Buttons header */}
        <div className="flex border-b border-brand-sage-light/10 pb-3 gap-6 sm:gap-10 overflow-x-auto scrollbar-none">
          {[
            { id: 'desc', labelEn: t.descriptionEn, labelAr: t.descriptionAr },
            { id: 'ingredients', labelEn: t.ingredientsEn, labelAr: t.ingredientsAr },
            { id: 'how', labelEn: t.howToUseEn, labelAr: t.howToUseAr },
            { id: 'shipping', labelEn: t.shippingTabEn, labelAr: t.shippingTabAr }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider pb-3 border-b-2 cursor-pointer transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'border-brand-primary text-brand-primary font-bold'
                : 'border-transparent text-zinc-400 hover:text-brand-primary'
                }`}
            >
              {language === 'en' ? tab.labelEn : tab.labelAr}
            </button>
          ))}
        </div>

        {/* Dynamic content rendering panel */}
        <div className="pt-8 text-zinc-650 text-xs sm:text-sm leading-relaxed font-sans max-w-4xl space-y-4">
          {activeTab === 'desc' && (
            <p>{language === 'en' ? selectedProduct.descriptionEn : selectedProduct.descriptionAr}</p>
          )}

          {activeTab === 'ingredients' && (
            <p>{language === 'en' ? selectedProduct.ingredientsEn : selectedProduct.ingredientsAr}</p>
          )}

          {activeTab === 'how' && (
            <p>{language === 'en' ? selectedProduct.howToUseEn : selectedProduct.howToUseAr}</p>
          )}

          {activeTab === 'shipping' && (
            <p>{language === 'en' ? t.shippingDescEn : t.shippingDescAr}</p>
          )}
        </div>
      </div>

      {/* FREQUENTLY BOUGHT TOGETHER - HIGH-CONVERSION BUNDLE (Commented out per user requirements)
      <div className="bg-brand-primary text-brand-cream rounded-2xl p-6 sm:p-10 border border-brand-secondary/40 shadow-xl space-y-6 animate-fade-in">
        <div>
          <h2 className="font-serif text-2xl font-bold flex items-center">
            <Sparkles className="text-brand-sage-light mr-2.5 rtl:ml-2.5" size={20} />
            {language === 'en' ? t.bundleTitleEn : t.bundleTitleAr}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-200 mt-1 font-sans">
            {language === 'en' ? t.bundleSubEn : t.bundleSubAr}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
            
            <div className="flex items-center text-left rtl:text-right bg-brand-secondary/40 p-3.5 rounded-xl border border-brand-sage-muted/30 w-full sm:w-max shadow-sm">
              <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                <input type="checkbox" disabled checked className="w-4 h-4 accent-brand-sage-light rounded border-none cursor-not-allowed" />
                <img src={selectedProduct.image} alt="" className="w-12 h-14 object-cover rounded-lg" />
                <div>
                  <h4 className="font-serif text-[11px] font-bold truncate max-w-[150px]">{language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAr}</h4>
                  <span className="text-[10px] text-brand-sage-light font-sans">{currentPrice} {t.aed}</span>
                </div>
              </label>
            </div>

            <span className="text-zinc-400 font-sans text-xl font-bold mx-auto">+</span>

            <div className={`flex items-center text-left rtl:text-right p-3.5 rounded-xl border transition-all duration-350 w-full sm:w-max shadow-sm ${
              buyMatch1 ? 'bg-brand-secondary border-brand-sage-light/40' : 'bg-brand-secondary/15 border-brand-secondary/30 opacity-60'
            }`}>
              <label className="flex items-center space-x-3.5 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={buyMatch1}
                  onChange={(e) => setBuyMatch1(e.target.checked)}
                  className="w-4 h-4 accent-brand-sage-light rounded border-none"
                />
                <img src={bundleMatch1.image} alt="" className="w-12 h-14 object-cover rounded-lg" />
                <div>
                  <h4 className="font-serif text-[11px] font-bold truncate max-w-[150px]">{language === 'en' ? bundleMatch1.nameEn : bundleMatch1.nameAr}</h4>
                  <span className="text-[10px] text-brand-sage-light font-sans">{bundleMatch1.discountPrice ?? bundleMatch1.price} {t.aed}</span>
                </div>
              </label>
            </div>

            <span className="text-zinc-400 font-sans text-xl font-bold mx-auto">+</span>

            <div className={`flex items-center text-left rtl:text-right p-3.5 rounded-xl border transition-all duration-350 w-full sm:w-max shadow-sm ${
              buyMatch2 ? 'bg-brand-secondary border-brand-sage-light/40' : 'bg-brand-secondary/15 border-brand-secondary/30 opacity-60'
            }`}>
              <label className="flex items-center space-x-3.5 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={buyMatch2}
                  onChange={(e) => setBuyMatch2(e.target.checked)}
                  className="w-4 h-4 accent-brand-sage-light rounded border-none"
                />
                <img src={bundleMatch2.image} alt="" className="w-12 h-14 object-cover rounded-lg" />
                <div>
                  <h4 className="font-serif text-[11px] font-bold truncate max-w-[150px]">{language === 'en' ? bundleMatch2.nameEn : bundleMatch2.nameAr}</h4>
                  <span className="text-[10px] text-brand-sage-light font-sans">{bundleMatch2.discountPrice ?? bundleMatch2.price} {t.aed}</span>
                </div>
              </label>
            </div>

          </div>

          <div className="lg:col-span-4 bg-brand-secondary/30 p-6 rounded-xl border border-brand-sage-muted/30 flex flex-col items-center justify-center space-y-4">
            <div className="text-center font-sans">
              <span className="input-label !mb-1.5 text-zinc-300">{language === 'en' ? 'Combined bundle' : 'إجمالي سعر الفردية'}</span>
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span className="text-zinc-400 line-through text-xs">{bundleSubtotal} {t.aed}</span>
                <span className="text-brand-sage-light text-xl font-bold">{bundleTotal} {t.aed}</span>
              </div>
              <span className="badge badge-success !text-[9px] mt-2">
                {language === 'en' ? 'Includes 10% Bundle Discount' : 'يشمل خصم تشجيعي 10٪'}
              </span>
            </div>

            <button
              onClick={handleAddBundleToCart}
              className="w-full bg-brand-sage-light text-brand-primary hover:bg-white rounded-xl py-3 text-xs uppercase tracking-wider font-bold text-center transition-colors cursor-pointer"
            >
              {language === 'en' ? t.addBundleBtnEn : t.addBundleBtnAr}
            </button>
          </div>
        </div>
      </div>
      */}

      {/* Curated Routine Bundle Integration */}
      {productBundles.length > 0 && (
        <div className="space-y-8 pt-8">
          <SectionTitle
            subtitle={language === 'en' ? 'Synergistic Systems' : 'باقات ترشيد الجرعات للتوفير'}
            title={language === 'en' ? 'Featured Bundles Including This Product' : 'باقات متميزة تشمل هذا المستحضر'}
            description={language === 'en' ? 'Activate therapeutic synergy and gain value benefits by buying this product as part of a grouped routine set.' : 'نشطي تآزر المكونات الطبي واحملي أقصى فائدة توفيرية عند اقتناء هذا المستحضر كجزء من روتينات العناية.'}
          />

          <div className="relative w-full">
            {productBundles.length > 2 && (
              <div className="flex justify-end gap-2 mb-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('product-bundles-slider');
                    if (el) {
                      el.scrollBy({ left: language === 'en' ? -340 : 340, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full border border-zinc-200 hover:border-brand-primary/40 hover:bg-zinc-50 text-zinc-650 transition-all cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} className="rtl:rotate-180" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('product-bundles-slider');
                    if (el) {
                      el.scrollBy({ left: language === 'en' ? 340 : -340, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full border border-zinc-200 hover:border-brand-primary/40 hover:bg-zinc-50 text-zinc-650 transition-all cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRight size={16} className="rtl:rotate-180" />
                </button>
              </div>
            )}

            <div
              id="product-bundles-slider"
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 w-full"
            >
              {productBundles.map((bundle) => {
                const savings = bundle.originalPrice - bundle.bundlePrice;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => {
                      setSelectedBundle(bundle);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group border border-brand-sage-light/10 hover:border-brand-primary/20 bg-white hover:bg-zinc-50/50 rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-md snap-start min-w-[280px] sm:min-w-[340px] max-w-[360px] flex-shrink-0 relative overflow-hidden"
                  >
                    <div className="absolute top-4 left-4 z-10 bg-red-650 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      {language === 'en' ? `Save ${bundle.discountPercentage}%` : `وفر ${bundle.discountPercentage}%`}
                    </div>

                    <div className="space-y-4">
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-brand-cream/30 p-1 border border-brand-sage-light/10">
                        <img
                          src={bundle.image}
                          alt={bundle.nameEn}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-serif text-sm sm:text-base font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                          {language === 'en' ? bundle.nameEn : bundle.nameAr}
                        </h4>
                        <p className="text-[11px] text-brand-sage-muted font-sans italic line-clamp-1">
                          {language === 'en' ? bundle.subtitleEn : bundle.subtitleAr}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-brand-sage-light/10 pt-4 mt-5 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] text-zinc-400 line-through leading-none block mb-0.5 font-sans">
                            {bundle.originalPrice} {language === 'en' ? 'AED/SAR' : 'ريال'}
                          </span>
                          <span className="text-sm font-bold text-brand-primary font-sans">
                            {bundle.bundlePrice} {language === 'en' ? 'AED/SAR' : 'ريال'}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm font-sans uppercase">
                          {language === 'en' ? `You save ${savings} AED` : `وفرتِ ${savings} ريال`}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBundle(bundle);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full btn-secondary !py-2.5 !rounded-xl text-center cursor-pointer text-[10px] flex items-center justify-center gap-1 font-sans font-bold uppercase tracking-wider transition-all"
                      >
                        <span>{language === 'en' ? 'Explore Routine' : 'اكتشفي الروتين'}</span>
                        <ArrowRight size={11} className="rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RELATED RECOMMENDATIONS ROW */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <SectionTitle
            subtitle={language === 'en' ? 'Clinical Pairings' : 'توصيات سريرية متوافقة'}
            title={language === 'en' ? t.relatedTitleEn : t.relatedTitleAr}
            description={language === 'en' ? t.relatedSubtitleEn : t.relatedSubtitleAr}
          />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
