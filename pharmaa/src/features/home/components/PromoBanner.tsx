"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';
import { PRODUCTS } from '../../../constants/data';

export default function PromoBanner() {
  const { language, setActivePage, addToCart } = useApp();

  const promoHeadline = language === 'en' ? 'The Seasonal Ritual Bundle' : 'مجموعة الطقوس الموسمية الفاخرة';
  const promoDesc = language === 'en'
    ? 'Incorporate our prebiotic cleanser, ocean hyaluronic serum, and cloud moisture barrier. Purchased as a complete system to activate maximum skin barrier defence, saving 15%.'
    : 'اجمعي بين غسول البريبايوتك، وسيروم الهيالورونيك الساحلي، وكريم حاجز السيراميد. احصلي على النظام المتكامل لتفعيل أقصى درجات حماية البشرة مع توفير 15٪.';
  const promoBtn = language === 'en' ? 'Acquire the Bundle (Save 15%)' : 'اقتني المجموعة الكاملة (توفير 15٪)';

  const checkoutRitualBundle = () => {
    // Add Ocean glow, Velvet cloud, and Prebiotic cleanser
    const clean = PRODUCTS.find((p) => p.id === 'prod_botanical_gel');
    const serum = PRODUCTS.find((p) => p.id === 'prod_ocean_glow');
    const moisturizer = PRODUCTS.find((p) => p.id === 'prod_velvet_cloud');

    if (clean) addToCart(clean, '150ml', 1);
    if (serum) addToCart(serum, '50ml', 1);
    if (moisturizer) addToCart(moisturizer, '100ml', 1);

    setActivePage('cart');
  };

  return (
    <section id="bundles-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
      <div className="bg-brand-primary rounded-3xl overflow-hidden relative shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Subtle premium organic line pattern overlay */}
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-[0.12] pointer-events-none select-none z-0" style={{ backgroundImage: "url('/assets/images/Patterns-02.jpg')" }} />

        {/* Background visuals and decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sage-muted/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-sage-light/5 rounded-full blur-3xl pointer-events-none" />

        {/* Text panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center text-brand-cream space-y-6 z-10">
          <span className="bg-brand-sage-muted text-brand-cream text-[10px] uppercase tracking-widest font-bold py-1 px-3.5 rounded-full w-max">
            {language === 'en' ? 'Exclusive Skincare Ritual Combos' : 'طقوس حصرية بتركيبات متوافقة'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            {promoHeadline}
          </h2>
          <p className="text-zinc-200 text-xs sm:text-sm font-sans leading-relaxed max-w-xl">
            {promoDesc}
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={checkoutRitualBundle}
              className="bg-brand-cream text-brand-primary hover:bg-white font-bold rounded-xl text-xs py-3 px-6 uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>{promoBtn}</span>
            </button>
            <span className="text-zinc-400 text-xs font-sans italic">
              {language === 'en' ? '*Comes with luxury linen pouch and custom dosage spoon.' : 'يشمل حقيبة قطنية فاخرة وملعقة جرعات أورا مخصصة.'}
            </span>
          </div>
        </div>

        {/* Product shot panel */}
        <div className="lg:col-span-5 h-[300px] lg:h-auto min-h-[350px] relative bg-brand-secondary/40">
          <img
            src="/assets/images/hero_skincare_banner_1781217525355.jpg"
            alt="Luxury cosmetic ritual items display"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
