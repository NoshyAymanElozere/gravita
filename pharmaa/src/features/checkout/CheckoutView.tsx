"use client";

import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Check, ShieldCheck, CreditCard, ShoppingBag, Truck, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CheckoutView() {
  const {
    language,
    cart,
    user,
    appliedCoupon,
    placeOrder,
    setActivePage
  } = useApp();

  const [step, setStep] = useState(1);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? '');

  const [shippingLine1, setShippingLine1] = useState(user?.addresses[0]?.addressLine1 ?? '');
  const [shippingCity, setShippingCity] = useState(user?.addresses[0]?.city ?? 'Riyadh');
  const [shippingState, setShippingState] = useState(user?.addresses[0]?.state ?? 'Central Province');
  const [shippingCountry, setShippingCountry] = useState(user?.addresses[0]?.country ?? 'Saudi Arabia');
  const [postalCode, setPostalCode] = useState(user?.addresses[0]?.postalCode ?? '12282');

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cod' | 'apple_pay' | 'google_pay'>('credit_card');
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');

  // Translations
  const t = {
    checkoutTitleEn: 'Secure Checkout Portal',
    checkoutTitleAr: 'بوابة الدفع الآمن المشفر',
    step1En: 'Profile Info',
    step1Ar: 'بيانات العميل',
    step2En: 'Shipping Address',
    step2Ar: 'عنوان الشحن',
    step3En: 'Payment Mode',
    step3Ar: 'طريقة الدفع',
    step4En: 'Complete Review',
    step4Ar: 'تأكيد ومراجعة',
    guestEn: 'Checkout Details',
    guestAr: 'بيانات الاتصال والتسليم',
    fullNameEn: 'Full Legal Name',
    fullNameAr: 'الاسم الكامل بالكامل',
    emailEn: 'Email for Receipt',
    emailAr: 'البريد الإلكتروني للخطابات',
    phoneEn: 'Delivery Contact Phone',
    phoneAr: 'رقم هاتف المحمول',
    nextEn: 'Proceed',
    nextAr: 'التثبيت والمتابعة',
    prevEn: 'Back',
    prevAr: 'عودة للخلف',
    streetEn: 'Street and Villa/Apartment Number',
    streetAr: 'اسم الشارع، رقم الفيلا والمنزل',
    cityEn: 'City',
    cityAr: 'المدينة',
    provinceEn: 'State / Governorate',
    provinceAr: 'المنطقة أو المحافظة',
    postalEn: 'ZIP / Postal Code',
    postalAr: 'الرمز البريدي / صندوق البريد',
    countryEn: 'Country',
    countryAr: 'الدولة',
    payCCEn: 'Encrypted Credit / Debit Card',
    payCCAr: 'بطاقة ائتمانية مشفرة (فيزا/ماستركارد)',
    payCODEn: 'Cash on Delivery (COD)',
    payCODAr: 'الدفع نقداً عند الاستلام (+15 ريال رسوم)',
    cardNumEn: 'Card Number',
    cardNumAr: 'رقم البطاقة الائتمانية',
    validEn: 'Expires (MM/YY)',
    validAr: 'تاريخ الصلاحية (MM/YY)',
    cardHolderEn: 'Card Holder Name',
    cardHolderAr: 'اسم صاحب البطاقة',
    reviewTitleEn: 'Confirm and Transmit Order',
    reviewTitleAr: 'مراجعة وتأكيد طلبية أورا',
    termsEn: 'By placing this order you consent to temperature-controlled bio-skincare deliveries.',
    termsAr: 'بإرسال الطلب، فإنك توافق على تسليم الجرعات وصناديق التبريد وتخزينها السليم.',
    placeBtnEn: 'Authorize Order & Dispatch',
    placeBtnAr: 'اعتماد وإرسال الطلب الآن',
    summaryTitleEn: 'Bag Manifest',
    summaryTitleAr: 'حقيبة مستحضراتكِ',
    subtotalEn: 'Subtotal',
    subtotalAr: 'المجموع الفرعي',
    discountEn: 'Pro Coupon Code',
    discountAr: 'كود خصم مستخدم',
    shippingEn: 'Insulated Delivery',
    shippingAr: 'الشحن المبرد الفاخر',
    freeEn: 'FREE',
    freeAr: 'مجاني',
    totalEn: 'Grand Total',
    totalAr: 'الإجمالي الكلي',
    aed: language === 'en' ? 'AED/SAR' : 'ريال',
    thankYouEn: 'Your Skin routine is on its way!',
    thankYouAr: 'تم تسجيل طلبيتكِ بنجاح!',
    successDescEn: 'We have processed your transaction securely. Your insulated temperature-controlled white parcel is being prepared by our skincare scientists.',
    successDescAr: 'تم الحفظ والتحقق من المعاملة البنكية بنجاح. نقوم حالياً بتجهيز صندوق التبريد والحرص على حيوية وتألق روتينكِ.',
    orderNumEn: 'Order Number',
    orderNumAr: 'رقم الطلب',
    trackingEn: 'Aramex tracking reference ID',
    trackingAr: 'رقم تتبع الشحنة مع أرامكس',
    deliveryEstEn: 'Estimated doorstep delivery',
    deliveryEstAr: 'التوصيل التقريبي لباب البيت',
    trackPageBtnEn: 'Go Tracking Board',
    trackPageBtnAr: 'الذهاب لتتبع الشحنة',
    errorRequiredEn: 'Please fill out all required fields to proceed.',
    errorRequiredAr: 'يرجى ملء جميع الحقول المطلوبة للمتابعة.'
  };

  const [formError, setFormError] = useState<string | null>(null);

  // Math totals calculation
  const currentSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((currentSubtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const baseShippingFee = currentSubtotal - discountAmount > 200 || currentSubtotal === 0 ? 0 : 25;
  const codSurcharge = paymentMethod === 'cod' ? 15 : 0;
  const shippingFee = baseShippingFee + codSurcharge;

  const grandTotal = currentSubtotal - discountAmount + shippingFee;

  const handleNextStep = () => {
    setFormError(null);
    if (step === 1) {
      if (!customerName || !customerEmail || !customerPhone) {
        setFormError(language === 'en' ? t.errorRequiredEn : t.errorRequiredAr);
        return;
      }
    }
    if (step === 2) {
      if (!shippingLine1 || !shippingCity || !postalCode) {
        setFormError(language === 'en' ? t.errorRequiredEn : t.errorRequiredAr);
        return;
      }
    }
    if (step === 3) {
      if (paymentMethod === 'credit_card' && (!ccNumber || !ccExpiry || !ccCvv)) {
        setFormError(language === 'en' ? t.errorRequiredEn : t.errorRequiredAr);
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setFormError(null);
    setStep((s) => s - 1);
  };

  const handlePlaceOrderSubmit = () => {
    const deliveryAddress = {
      id: `addr_check_${Date.now()}`,
      fullName: customerName,
      addressLine1: shippingLine1,
      city: shippingCity,
      state: shippingState,
      postalCode,
      country: shippingCountry,
      phone: customerPhone,
      isDefault: false
    };

    const newOrder = placeOrder(deliveryAddress, paymentMethod);
    setPlacedOrderDetails(newOrder);
  };

  // If order was successfully built
  if (placedOrderDetails) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
          <Check size={38} />
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-bold text-brand-primary">
            {language === 'en' ? t.thankYouEn : t.thankYouAr}
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-sans">
            {language === 'en' ? t.successDescEn : t.successDescAr}
          </p>
        </div>

        {/* Invoice Summary Receipt Card */}
        <div className="card-elevated bg-white p-6 text-left rtl:text-right space-y-4 font-sans text-xs !rounded-2xl">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-brand-cream text-zinc-600">
            <div>
              <span className="block text-[10px] text-zinc-400 uppercase font-semibold">{language === 'en' ? t.orderNumEn : t.orderNumAr}</span>
              <span className="text-sm font-bold text-zinc-800 font-mono tracking-wide">{placedOrderDetails.orderNumber}</span>
            </div>
            <div>
              <span className="block text-[10px] text-zinc-400 uppercase font-semibold">{language === 'en' ? t.trackingEn : t.trackingAr}</span>
              <span className="text-sm font-bold text-brand-primary font-mono tracking-wide">{placedOrderDetails.trackingNumber}</span>
            </div>
          </div>

          <div className="space-y-1.5 pb-4 border-b border-brand-cream text-zinc-600">
            <div className="flex justify-between">
              <span>{language === 'en' ? 'Shipment address' : 'عنوان الشحن والتسليم'}</span>
              <span className="font-semibold text-zinc-800">{placedOrderDetails.shippingAddress.addressLine1}, {placedOrderDetails.shippingAddress.city}</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'en' ? t.deliveryEstEn : t.deliveryEstAr}</span>
              <span className="font-semibold text-zinc-800">3-5 {language === 'en' ? 'Business Days' : 'أيام عمل'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setActivePage('profile'); // Goes straight to profile orders page where tracking can be inspected live
          }}
          className="btn-primary !py-3.5 !px-8"
        >
          <span>{language === 'en' ? t.trackPageBtnEn : t.trackPageBtnAr}</span>
        </button>
      </div>
    );
  }

  // Guard if cart is mysteriously empty
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 flex flex-col items-center justify-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-sage-light/15 flex items-center justify-center text-brand-primary">
          <ShoppingBag size={28} />
        </div>
        <p className="text-zinc-550 font-serif max-w-xs">{language === 'en' ? 'You have no items inside your Shopping bag to check out.' : 'لا توجد مستحضرات في حقيبتكِ لإتمام الشراء.'}</p>
        <button onClick={() => setActivePage('shop')} className="btn-primary">Begin Selection</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">

      {/* Page Title */}
      <div className="border-b border-brand-sage-light/12 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
          {language === 'en' ? t.checkoutTitleEn : t.checkoutTitleAr}
        </h1>
      </div>

      {/* Steps Indicator Bar */}
      <div className="flex justify-between items-center max-w-4xl mx-auto bg-white p-4 sm:p-5 rounded-2xl border border-brand-sage-light/10 text-xs text-zinc-400 font-semibold font-sans shadow-3xs">
        {[
          { text: language === 'en' ? t.step1En : t.step1Ar, s: 1 },
          { text: language === 'en' ? t.step2En : t.step2Ar, s: 2 },
          { text: language === 'en' ? t.step3En : t.step3Ar, s: 3 },
          { text: language === 'en' ? t.step4En : t.step4Ar, s: 4 }
        ].map((item, idx) => (
          <React.Fragment key={item.s}>
            {idx > 0 && (
              <div className={`step-connector ${step >= item.s ? 'step-connector-active' : ''}`} />
            )}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all duration-300 ${step >= item.s ? 'bg-brand-primary text-brand-cream border-brand-primary shadow-sm' : 'bg-brand-cream/30 border-brand-sage-light/20 text-brand-sage-muted'
                }`}>
                {item.s}
              </span>
              <span className={`hidden md:inline ${step === item.s ? 'text-brand-primary font-bold' : 'text-brand-sage-muted'}`}>
                {item.text}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT WORKSPACE: STEP DETAILS */}
        <div className="lg:col-span-8 card-base bg-white p-6 sm:p-8 !rounded-2xl space-y-6">

          {formError && (
            <p className="p-3 bg-red-50 text-red-700 text-xs font-semibold font-sans rounded-xl border border-red-100 flex items-center animate-fade-up">
              <span>{formError}</span>
            </p>
          )}

          {/* STEP 1: GUEST / CUSTOMER DATA */}
          {step === 1 && (
            <div className="space-y-4 font-sans text-xs animate-fade-in">
              <h3 className="font-serif text-base font-bold text-brand-primary border-b border-brand-cream pb-2 flex items-center">
                <Lock className="mr-2 rtl:ml-2 text-brand-sage-muted" size={16} />
                {language === 'en' ? t.guestEn : t.guestAr}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.fullNameEn : t.fullNameAr}</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.emailEn : t.emailAr}</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <label className="input-label">{language === 'en' ? t.phoneEn : t.phoneAr}</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  placeholder="+966 5x xxx xxxx"
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DISPATCH ADDRESS */}
          {step === 2 && (
            <div className="space-y-4 font-sans text-xs animate-fade-in">
              <h3 className="font-serif text-base font-bold text-brand-primary border-b border-brand-cream pb-2 flex items-center">
                <Truck className="mr-2 rtl:ml-2 text-brand-sage-muted" size={16} />
                {language === 'en' ? t.step2En : t.step2Ar}
              </h3>

              <div className="space-y-1.5">
                <label className="input-label">{language === 'en' ? t.streetEn : t.streetAr}</label>
                <input
                  type="text"
                  required
                  value={shippingLine1}
                  onChange={(e) => setShippingLine1(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.cityEn : t.cityAr}</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.provinceEn : t.provinceAr}</label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.postalEn : t.postalAr}</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="input-label">{language === 'en' ? t.countryEn : t.countryAr}</label>
                  <select
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="input-field cursor-pointer !bg-white"
                  >
                    <option value="Saudi Arabia">Saudi Arabia / السعودية</option>
                    <option value="United Arab Emirates">United Arab Emirates / الإمارات</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT TYPE */}
          {step === 3 && (
            <div className="space-y-6 font-sans text-xs animate-fade-in">
              <h3 className="font-serif text-base font-bold text-brand-primary border-b border-brand-cream pb-2 flex items-center">
                <CreditCard className="mr-2 rtl:ml-2 text-brand-sage-muted" size={16} />
                {language === 'en' ? t.step3En : t.step3Ar}
              </h3>

              <div className="space-y-3">
                {/* CC input choose option */}
                <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-brand-primary bg-brand-cream/15' : 'border-brand-sage-light/15 hover:bg-brand-cream/10'
                  }`}>
                  <input
                    type="radio"
                    name="payOption"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="w-4 h-4 accent-brand-primary mr-3 rtl:ml-3 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-brand-primary block">{language === 'en' ? t.payCCEn : t.payCCAr}</span>

                    {paymentMethod === 'credit_card' && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 outline-none border-t border-brand-sage-light/10 pt-4 animate-fade-in">
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[10px] text-brand-sage-muted uppercase font-semibold">{t.cardNumEn}</label>
                          <input
                            type="text"
                            placeholder="4242 •••• •••• ••••"
                            value={ccNumber}
                            onChange={(e) => setCcNumber(e.target.value)}
                            className="bg-white border border-brand-sage-light/20 focus:border-brand-primary rounded-xl py-2 px-3 text-xs w-full text-zinc-800 font-mono focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-sage-muted uppercase font-semibold">{t.validEn}</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={ccExpiry}
                            onChange={(e) => setCcExpiry(e.target.value)}
                            className="bg-white border border-brand-sage-light/20 focus:border-brand-primary rounded-xl py-2 px-3 text-xs w-full text-zinc-800 font-mono focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-sage-muted uppercase font-semibold">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={ccCvv}
                            onChange={(e) => setCcCvv(e.target.value)}
                            className="bg-white border border-brand-sage-light/20 focus:border-brand-primary rounded-xl py-2 px-3 text-xs w-full text-zinc-800 font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* COD option choose */}
                <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-cream/15' : 'border-brand-sage-light/15 hover:bg-brand-cream/10'
                  }`}>
                  <input
                    type="radio"
                    name="payOption"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-brand-primary mr-3 rtl:ml-3 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-brand-primary block">{language === 'en' ? t.payCODEn : t.payCODAr}</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: MEMORANDUM REVIEW */}
          {step === 4 && (
            <div className="space-y-4 font-sans text-xs animate-fade-in">
              <h3 className="font-serif text-base font-bold text-brand-primary border-b border-brand-cream pb-2 flex items-center">
                <Check className="mr-2 rtl:ml-2 text-brand-sage-muted" size={16} />
                {language === 'en' ? t.reviewTitleEn : t.reviewTitleAr}
              </h3>

              {/* Informational checklist summary card */}
              <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-sage-light/25 space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-brand-sage-muted uppercase tracking-wider font-bold block">Contact Customer:</span>
                    <span className="font-semibold text-brand-primary text-xs">{customerName} ({customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-sage-muted uppercase tracking-wider font-bold block">Mail Receipt:</span>
                    <span className="font-semibold text-brand-primary text-xs">{customerEmail}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-brand-sage-light/10">
                  <div>
                    <span className="text-[9px] text-brand-sage-muted uppercase tracking-wider font-bold block">Destination Location:</span>
                    <span className="font-semibold text-brand-primary text-xs">{shippingLine1}, {shippingCity}, {shippingCountry}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-sage-muted uppercase tracking-wider font-bold block">Authorization Method:</span>
                    <span className="font-semibold text-brand-primary text-xs uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Encrypted Card'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-brand-cream/30 border border-brand-sage-light/15 rounded-2xl space-y-1">
                <p className="text-[10px] text-brand-sage-muted font-sans leading-relaxed">
                  {language === 'en' ? t.termsEn : t.termsAr}
                </p>
              </div>

              <button
                onClick={handlePlaceOrderSubmit}
                className="btn-primary w-full !py-4"
              >
                <ShieldCheck size={14} />
                <span>{language === 'en' ? t.placeBtnEn : t.placeBtnAr}</span>
              </button>
            </div>
          )}

          {/* Stepper buttons (prev/next) for non-final steps */}
          {step < 4 && (
            <div className={`flex justify-between items-center pt-4 border-t border-brand-sage-light/10`}>
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="text-xs font-semibold uppercase tracking-wider text-brand-sage-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={12} className="rtl:rotate-180" />
                  <span>{language === 'en' ? t.prevEn : t.prevAr}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNextStep}
                className="btn-primary !py-3 !px-6"
              >
                <span>{language === 'en' ? t.nextEn : t.nextAr}</span>
                <ArrowRight size={12} className="rtl:rotate-180" />
              </button>
            </div>
          )}

        </div>

        {/* RIGHT STICKY COMPONENT: RECEIPT SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-base bg-white p-5 !rounded-xl space-y-4">
            <h3 className="font-serif text-sm font-bold text-brand-primary border-b border-brand-sage-light/10 pb-2 flex items-center">
              <ShoppingBag className="mr-2 rtl:ml-2 text-brand-sage-muted" size={16} />
              {language === 'en' ? t.summaryTitleEn : t.summaryTitleAr}
            </h3>

            {/* List mini products card scrolling list */}
            <div className="max-h-72 overflow-y-auto space-y-3.5 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-3 rtl:space-x-reverse items-center pb-2 border-b border-brand-sage-light/10">
                  <img src={item.product.image} alt="" className="w-10 h-12 object-cover rounded bg-brand-cream/30 p-0.5 border border-brand-sage-light/10" />
                  <div className="flex-1 min-w-0 font-sans text-xs">
                    <h5 className="font-serif font-bold text-zinc-900 truncate m-0">{language === 'en' ? item.product.nameEn : item.product.nameAr}</h5>
                    <span className="text-[10px] text-brand-sage-muted block mt-0.5">
                      {item.quantity} x {item.selectedSize === 'Complete Set' ? (language === 'en' ? 'Complete Set' : 'المجموعة الكاملة') : item.selectedSize}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-primary font-sans">
                    {(item.product.discountPrice ?? item.product.price) * item.quantity} {t.aed}
                  </span>
                </div>
              ))}
            </div>

            {/* Price additions summaries */}
            <div className="space-y-2.5 pb-3 pt-2 text-xs font-sans text-brand-sage-muted border-b border-brand-sage-light/10">
              <div className="flex justify-between">
                <span>{language === 'en' ? t.subtotalEn : t.subtotalAr}</span>
                <span className="text-zinc-900 font-semibold">{currentSubtotal} {t.aed}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-red-650">
                  <span>{language === 'en' ? t.discountEn : t.discountAr} ({appliedCoupon.code})</span>
                  <span>-{discountAmount} {t.aed}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{language === 'en' ? t.shippingEn : t.shippingAr}</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600">{language === 'en' ? t.freeEn : t.freeAr}</span>
                  ) : (
                    <span className="text-zinc-900 font-semibold">{shippingFee} {t.aed}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline font-serif pt-1">
              <span className="text-sm font-bold text-zinc-900">
                {language === 'en' ? t.totalEn : t.totalAr}
              </span>
              <span className="text-brand-primary font-bold text-base font-sans">
                {grandTotal} {t.aed}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
