"use client";

import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Mail, Instagram, ShieldCheck, Heart } from 'lucide-react';
// sfffff
export default function Footer() {
  const { language, setActivePage } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const t = {
    newsletterTitleEn: 'Subscribe to our Skin Journal',
    newsletterTitleAr: 'اشتركي في نشرتنا للعناية بالبشرة',
    newsletterSubEn: 'Receive expert advice, product launches, and exclusive member-only pricing.',
    newsletterSubAr: 'احصلي على نصائح الخبراء، وإطلاق المنتجات الجديدة، وعروض حصرية للأعضاء فقط.',
    emailPlaceholderEn: 'Enter your email address...',
    emailPlaceholderAr: 'أدخلي بريدكِ الإلكتروني...',
    subscribeEn: 'Subscribe',
    subscribeAr: 'اشتراك',
    successEn: 'Perfectly Subscribed! Check your inbox for 10% off coupon code: GLOWGLOW.',
    successAr: 'تم الاشتراك بنجاح! تفقدي بريدك للحصول على خصم 10%: GLOWGLOW.',
    aboutEn: 'Aura Laboratories was founded to offer high-efficacy, plant-derived, clinically sound skincare options for complex climates.',
    aboutAr: 'تأسست أورا لابوراتوريز لتقديم مستحضرات عالية الفعالية، مستخلصة من النباتات ومثبتة سريرياً لتناسب الأجواء المختلفة.',
    companyEn: 'Company',
    companyAr: 'الشركة',
    serviceEn: 'Customer Support',
    serviceAr: 'خدمة العملاء',
    paymentEn: '100% Secure Payment',
    paymentAr: 'دفع آمن 100%',
    allRightsEn: '© 2026 AURA Laboratories. All designs are registered trademarks.',
    allRightsAr: '© 2026 مختبرات أورا. جميع الحقوق محفوظة.'
  };

  const menuCompany = [
    { titleEn: 'About Us', titleAr: 'عن أورا', page: 'developer-specs' },
    { titleEn: 'Contact Us', titleAr: 'اتصلي بنا', page: 'home' },
    { titleEn: 'FAQ', titleAr: 'الأسئلة الشائعة', page: 'home' },
    { titleEn: 'Privacy Policy', titleAr: 'سياسة الخصوصية', page: 'home' },
    { titleEn: 'Terms of Service', titleAr: 'شروط الخدمة', page: 'home' }
  ];

  const menuSupport = [
    { titleEn: 'Shipping Guide', titleAr: 'دليل الشحن والتوصيل', page: 'home' },
    { titleEn: 'Luxury Returns', titleAr: 'سياسة الاسترجاع الفاخر', page: 'home' }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="w-full bg-brand-primary text-brand-cream pt-16 pb-8 border-t border-brand-secondary/40 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div id="newsletter-section" className="pb-12 border-b border-brand-secondary/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <h3 className="font-serif text-2xl font-bold tracking-wide text-brand-cream">
              {language === 'en' ? t.newsletterTitleEn : t.newsletterTitleAr}
            </h3>
            <p className="text-brand-cream/80 text-xs sm:text-sm max-w-lg">
              {language === 'en' ? t.newsletterSubEn : t.newsletterSubAr}
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="bg-brand-secondary/50 border border-brand-sage-light/30 rounded-2xl p-4.5 text-center text-xs tracking-wider text-brand-cream animate-fade-in">
                {language === 'en' ? t.successEn : t.successAr}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder={language === 'en' ? t.emailPlaceholderEn : t.emailPlaceholderAr}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-brand-secondary/45 border border-brand-cream/20 focus:border-brand-sage-light rounded-xl py-3 px-4 text-xs text-brand-cream focus:outline-none placeholder:text-brand-cream/45 shadow-inner transition-colors"
                />
                <button
                  type="submit"
                  className="bg-brand-cream text-brand-primary hover:bg-brand-sage-light hover:text-brand-primary font-bold rounded-xl text-xs py-3 px-6 uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-3xs"
                >
                  {language === 'en' ? t.subscribeEn : t.subscribeAr}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Logo / Brand Intro */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-brand-cream">AURA</span>
              <span className="font-sans text-[7px] tracking-[0.4em] text-brand-sage-light -mt-1">LABORATORIES</span>
            </div>
            <p className="text-xs text-brand-cream/75 leading-relaxed max-w-xs">
              {language === 'en' ? t.aboutEn : t.aboutAr}
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-brand-cream hover:text-brand-primary hover:bg-brand-cream transition-all duration-300 p-2 bg-brand-secondary/40 rounded-full">
                <Instagram size={16} />
              </a>
              <a href="mailto:expert@aura.com" className="text-brand-cream hover:text-brand-primary hover:bg-brand-cream transition-all duration-300 p-2 bg-brand-secondary/40 rounded-full">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-widest text-brand-sage-light uppercase">
              {language === 'en' ? t.companyEn : t.companyAr}
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-cream/75">
              {menuCompany.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setActivePage(item.page)}
                    className="hover:text-brand-cream hover:underline underline-offset-4 transition-all text-left rtl:text-right cursor-pointer"
                  >
                    {language === 'en' ? item.titleEn : item.titleAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-bold tracking-widest text-brand-sage-light uppercase">
              {language === 'en' ? t.serviceEn : t.serviceAr}
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-cream/75">
              {menuSupport.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setActivePage(item.page)}
                    className="hover:text-brand-cream hover:underline underline-offset-4 transition-all text-left rtl:text-right cursor-pointer"
                  >
                    {language === 'en' ? item.titleEn : item.titleAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee Badges */}
          <div className="space-y-4 bg-brand-secondary/20 rounded-2xl p-5 border border-brand-secondary/45 shadow-3xs">
            <h4 className="font-serif text-xs font-bold tracking-widest text-brand-sage-light uppercase flex items-center">
              <ShieldCheck className="mr-1.5 rtl:ml-1.5" size={14} />
              {language === 'en' ? t.paymentEn : t.paymentAr}
            </h4>
            <p className="text-[11px] text-brand-cream/80 leading-relaxed">
              {language === 'en'
                ? 'Your transactional security is prioritized. Express checkout accepts Apple Pay, Google Pay, and robust encrypted credit payments.'
                : 'أمن معاملتكم له الأولوية القصوى لدينا. الدفع السريع يقبل آبل باي، جوجل باي، والدفع ببطاقات الائتمان المشفرة.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-brand-secondary/60 rounded-md px-2 py-0.5 text-[8.5px] uppercase tracking-wider font-bold text-brand-cream border border-brand-cream/10">Visa</span>
              <span className="bg-brand-secondary/60 rounded-md px-2 py-0.5 text-[8.5px] uppercase tracking-wider font-bold text-brand-cream border border-brand-cream/10">Mastercard</span>
              <span className="bg-brand-secondary/60 rounded-md px-2 py-0.5 text-[8.5px] uppercase tracking-wider font-bold text-brand-cream border border-brand-cream/10">Apple Pay</span>
              <span className="bg-brand-secondary/60 rounded-md px-2 py-0.5 text-[8.5px] uppercase tracking-wider font-bold text-brand-cream border border-brand-cream/10">COD</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="pt-8 border-t border-brand-secondary/25 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[10px] text-brand-cream/60 font-medium">
            {language === 'en' ? t.allRightsEn : t.allRightsAr}
          </p>
          <div className="flex items-center space-x-1 rtl:space-x-reverse text-[10px] text-brand-cream/60 font-medium">
            <span>Made with passion for healthy skin</span>
            <Heart size={8} className="text-brand-sage-light fill-brand-sage-light animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
