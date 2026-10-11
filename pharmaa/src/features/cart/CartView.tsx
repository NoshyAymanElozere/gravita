"use client";

import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Trash2, Plus, Minus, Ticket, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CartView() {
  const {
    language,
    cart,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setActivePage,
    setSelectedProduct
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const t = {
    cartTitleEn: 'Daily Routine Shopping Bag',
    cartTitleAr: 'حقيبة التسوق للعناية والروتين',
    emptyTitleEn: 'No skin formulas added yet.',
    emptyTitleAr: 'حقيبة مستحضرات التجميل فارغة حالياً.',
    emptyBtnEn: 'Begin Selection',
    emptyBtnAr: 'ابدئي باكتشاف المستحضرات',
    itemEn: 'Product details',
    itemAr: 'تفاصيل المنتج',
    qtyEn: 'Quantity',
    qtyAr: 'الكمية',
    totalPriceEn: 'Total Price',
    totalPriceAr: 'الإجمالي الفرعي',
    orderSummaryEn: 'Formulation Summary',
    orderSummaryAr: 'ملخص الحساب والجرعات',
    subtotalEn: 'Subtotal',
    subtotalAr: 'المجموع الفرعي',
    discountEn: 'Pro coupon applied',
    discountAr: 'تم تفعيل كود الخصم',
    shippingEn: 'Insulated Delivery',
    shippingAr: 'الشحن المبرد الفاخر',
    freeEn: 'FREE',
    freeAr: 'مجاني',
    totalEn: 'Grand Total',
    totalAr: 'الإجمالي الكلي',
    checkoutEn: 'Secure Checkout',
    checkoutAr: 'الانتقال للدفع الآمن',
    promoCodeEn: 'Promotion Code / Coupon',
    promoCodeAr: 'كوبون الخصم أو رمز ترويجي',
    applyEn: 'Apply',
    applyAr: 'تطبيق',
    removeEn: 'Remove',
    removeAr: 'حذف',
    placeholderEn: 'Try AURA20, SAVE50...',
    placeholderAr: 'أدخلي كوبون الخصم (AURA20)...',
    aed: language === 'en' ? 'AED/SAR' : 'ريال',
    satisfactionEn: 'Tested Botanics',
    satisfactionAr: 'مواد مجربة بيولوجياً'
  };

  const currentSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
    0
  );

  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountValue = Math.round((currentSubtotal * appliedCoupon.value) / 100);
    } else {
      discountValue = appliedCoupon.value;
    }
  }

  const shippingFee = currentSubtotal - discountValue > 200 || currentSubtotal === 0 ? 0 : 25;
  const grandTotal = currentSubtotal - discountValue + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode.trim()) return;

    const error = applyCoupon(couponCode);
    if (error) {
      setCouponError(error);
    } else {
      setCouponCode('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-cream border border-brand-sage-light/35 flex items-center justify-center text-brand-primary shadow-inner animate-float-slow">
          <ShoppingBag size={38} className="stroke-[1.5]" />
        </div>
        <div className="space-y-2.5">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-brand-primary">
            {language === 'en' ? t.emptyTitleEn : t.emptyTitleAr}
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            {language === 'en' ? 'Formulations and luxury skincare essentials added to your basket will appear here.' : 'المستحضرات التجميلية والعناية بالبشرة التي تضيفينها للحقيبة ستظهر هنا.'}
          </p>
        </div>
        <button
          onClick={() => setActivePage('shop')}
          className="btn-primary !px-12 !py-4 !rounded-xl shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 transition-all font-semibold"
        >
          {language === 'en' ? t.emptyBtnEn : t.emptyBtnAr}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-fade-in">
      {/* Title block */}
      <div className="border-b border-brand-sage-light/20 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary tracking-tight">
          {language === 'en' ? t.cartTitleEn : t.cartTitleAr}
        </h1>
        <p className="text-xs text-zinc-500 mt-2">
          {language === 'en' ? 'Review your selected skin formulations before checkout.' : 'راجعي مستحضرات العناية المختارة قبل إتمام الطلب.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-8 space-y-5">
          <div className="hidden md:grid grid-cols-12 pb-3 px-4 border-b border-brand-sage-light/20 text-[10px] tracking-widest font-bold text-brand-primary uppercase">
            <div className="col-span-6">{language === 'en' ? t.itemEn : t.itemAr}</div>
            <div className="col-span-3 text-center">{language === 'en' ? t.qtyEn : t.qtyAr}</div>
            <div className="col-span-3 text-right rtl:text-left">{language === 'en' ? t.totalPriceEn : t.totalPriceAr}</div>
          </div>

          <div className="space-y-4">
            {cart.map((item) => {
              const unitPrice = item.product.discountPrice ?? item.product.price;
              const rowTotal = unitPrice * item.quantity;
              return (
                <div
                  key={item.id}
                  className="card-elevated bg-white p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center !rounded-2xl border border-brand-sage-light/10 hover:border-brand-sage-light/30 transition-all duration-300"
                >
                  {/* Info Column */}
                  <div className="md:col-span-6 flex items-start gap-4 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.nameEn}
                      className="w-20 h-24 rounded-xl object-cover bg-brand-cream border border-brand-sage-light/20 p-1 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 space-y-2">
                      <h4
                        onClick={() => {
                          setSelectedProduct(item.product);
                        }}
                        className="font-serif text-base font-bold text-zinc-900 hover:text-brand-primary cursor-pointer truncate transition-colors"
                      >
                        {language === 'en' ? item.product.nameEn : item.product.nameAr}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-outline !py-1 !px-2.5 !text-[9px] font-sans font-bold uppercase">
                          {item.selectedSize === 'Complete Set'
                            ? (language === 'en' ? 'Complete Set' : 'المجموعة الكاملة')
                            : `${language === 'en' ? 'Size' : 'الحجم'}: ${item.selectedSize}`}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-sans">
                          {unitPrice} {t.aed} / {language === 'en' ? 'unit' : 'وحدة'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] text-zinc-400 hover:text-red-600 font-bold uppercase flex items-center gap-1 cursor-pointer pt-2 transition-colors duration-200"
                      >
                        <Trash2 size={11} />
                        <span>{language === 'en' ? 'Vaporize' : 'حذف'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity Counter Column */}
                  <div className="md:col-span-3 flex justify-center">
                    <div className="flex items-center border border-brand-sage-light/40 rounded-xl bg-brand-cream/10 p-0.5 font-sans">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-brand-sage-muted hover:text-brand-primary hover:bg-brand-cream/40 rounded-lg cursor-pointer h-full transition-all"
                      >
                        <Minus size={12} className="stroke-[2.5]" />
                      </button>
                      <span className="px-4 text-xs font-bold text-brand-primary min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-brand-sage-muted hover:text-brand-primary hover:bg-brand-cream/40 rounded-lg cursor-pointer h-full transition-all"
                      >
                        <Plus size={12} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="md:col-span-3 text-right rtl:text-left min-w-0">
                    <span className="text-base font-bold text-brand-primary block font-sans tracking-tight">
                      {rowTotal} {t.aed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Promo input and receipt summary */}
        <div className="lg:col-span-4 space-y-6">

          {/* Coupon Entry */}
          <div className="card-elevated bg-white p-6 !rounded-2xl border border-brand-sage-light/10 space-y-4">
            <h4 className="input-label font-bold text-xs">
              {t.promoCodeEn}
            </h4>

            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between gap-3 animate-fade-in">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-800 block font-sans">
                    {appliedCoupon.code} Activated
                  </span>
                  <span className="text-[10px] text-emerald-600 block line-clamp-1 mt-0.5 font-medium">
                    {language === 'en' ? appliedCoupon.descriptionEn : appliedCoupon.descriptionAr}
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {language === 'en' ? 'Erase' : 'إزالة'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'en' ? t.placeholderEn : t.placeholderAr}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input-field uppercase !py-3 !text-xs !rounded-xl"
                />
                <button
                  type="submit"
                  className="btn-primary !py-3 !px-6 !text-xs !rounded-xl shadow-sm hover:shadow"
                >
                  {language === 'en' ? t.applyEn : t.applyAr}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[10px] text-red-600 font-semibold font-sans animate-fade-up">
                {couponError}
              </p>
            )}
            <p className="text-[9px] text-zinc-400 block font-sans italic">
              *Promo codes (AURA20 / SAVE50) cannot be grouped together.
            </p>
          </div>

          {/* Totals panel */}
          <div className="card-elevated bg-white p-6 !rounded-2xl border border-brand-sage-light/10 space-y-5 font-sans text-xs">
            <h4 className="input-label font-bold text-xs">
              {language === 'en' ? t.orderSummaryEn : t.orderSummaryAr}
            </h4>

            <div className="space-y-3 pb-4 border-b border-brand-sage-light/15">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>{language === 'en' ? t.subtotalEn : t.subtotalAr}</span>
                <span className="font-bold text-zinc-800">{currentSubtotal} {t.aed}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-red-600 font-medium animate-fade-in">
                  <span>{language === 'en' ? t.discountEn : t.discountAr} ({appliedCoupon.code})</span>
                  <span className="font-bold">-{discountValue} {t.aed}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-500 font-medium">
                <span>{language === 'en' ? t.shippingEn : t.shippingAr}</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 uppercase tracking-wider">{language === 'en' ? t.freeEn : t.freeAr}</span>
                  ) : (
                    <span className="font-bold text-zinc-800">{shippingFee} {t.aed}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline font-serif pt-2">
              <span className="text-sm font-bold text-zinc-900">
                {language === 'en' ? t.totalEn : t.totalAr}
              </span>
              <span className="font-sans text-xl font-bold text-brand-primary tracking-tight">
                {grandTotal} {t.aed}
              </span>
            </div>

            {/* Free Shipping Progress bar */}
            {currentSubtotal < 200 ? (
              <div className="p-4 bg-brand-cream/60 rounded-2xl space-y-2.5 border border-brand-sage-light/20">
                <p className="text-[10px] text-brand-primary leading-relaxed font-sans font-semibold">
                  {language === 'en'
                    ? `Add ${200 - currentSubtotal} ${t.aed} more to unlock Free Temp-Controlled insulated delivery!`
                    : `أضيفي منتجات بـ ${200 - currentSubtotal} ريال/درهم أخرى لـتفعيل الشحن المبرد المجاني الفاخر!`}
                </p>
                <div className="w-full bg-brand-sage-light/25 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(currentSubtotal / 200) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-700 animate-fade-in">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><ShieldCheck size={12} className="text-emerald-600" /></span>
                <span className="text-[10px] font-bold uppercase tracking-wider font-sans leading-none">
                  {language === 'en' ? 'Unlocked Free Temperature-Regulated Shipping!' : 'تفعيل الشحن المبرد المجاني الفاخر!'}
                </span>
              </div>
            )}

            <button
              onClick={() => setActivePage('checkout')}
              className="btn-primary w-full !py-4 !rounded-xl shadow-md hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
            >
              <span>{language === 'en' ? t.checkoutEn : t.checkoutAr}</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
