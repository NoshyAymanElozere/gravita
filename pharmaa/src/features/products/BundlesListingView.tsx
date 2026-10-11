"use client";

import React from 'react';
import { useApp, convertBundleToProduct } from '../../store/AppContext';
import { BUNDLES } from '../../constants/data';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle';

export default function BundlesListingView() {
  const { language, setSelectedBundle, addToCart, setActivePage } = useApp();

  const handleAddBundle = (bundle: typeof BUNDLES[0]) => {
    addToCart(convertBundleToProduct(bundle), 'Complete Set', 1);
    setActivePage('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">

      {/* Header */}
      <div className="text-center space-y-3 pb-8 border-b border-brand-cream/80">
        <span className="section-eyebrow">
          {language === 'en' ? 'Synergistic Care' : 'عناية متكاملة تآزرية'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary tracking-tight">
          {language === 'en' ? 'Clinical Skincare Bundles' : 'باقات العناية السريرية'}
        </h1>
        <p className="text-sm text-brand-sage-muted font-sans max-w-2xl mx-auto leading-relaxed">
          {language === 'en'
            ? 'Discover curated routines designed by skincare experts. Purchased together, these clinical formulations coordinate to target skin issues while delivering maximum value.'
            : 'اكتشفي روتين العناية المنسق من قبل خبراء البشرة. عند شرائكِ هذه المستحضرات معاً، فإنها تعمل بتناغم تام لتحقيق أفضل النتائج لبشرتكِ وبقيمة توفيرية استثنائية.'}
        </p>
      </div>

      {/* Grid of Bundles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {BUNDLES.map((bundle) => {
          const savings = bundle.originalPrice - bundle.bundlePrice;
          return (
            <div
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle)}
              className="card-base flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-all duration-300 border border-brand-sage-light/10 cursor-pointer"
            >
              {/* Image & Saving Badge */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-brand-cream/40 p-2">
                <div className="w-full h-full rounded-xl overflow-hidden img-zoom-container">
                  <img
                    src={bundle.image}
                    alt={bundle.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-6 left-6 bg-red-650 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-md">
                  {language === 'en' ? `Save ${bundle.discountPercentage}%` : `وفر ${bundle.discountPercentage}٪`}
                </div>
              </div>

              {/* Info Body */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                      {language === 'en' ? bundle.nameEn : bundle.nameAr}
                    </h3>
                    <p className="text-xs text-brand-sage-muted font-sans italic">
                      {language === 'en' ? bundle.subtitleEn : bundle.subtitleAr}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    {language === 'en' ? bundle.descriptionEn : bundle.descriptionAr}
                  </p>

                  {/* Included Items Thumbnails */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-400 block font-sans">
                      {language === 'en' ? 'Included Formulations:' : 'المستحضرات المتضمنة:'}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {bundle.items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-cream/35 border border-brand-sage-light/10 p-1.5 pr-3 rtl:pl-3 rounded-lg"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.nameEn}
                            className="w-7 h-7 object-cover rounded-md bg-white border border-zinc-150"
                          />
                          <span className="text-[10px] font-sans font-bold text-zinc-700">
                            {language === 'en' ? item.product.nameEn.split(' ').slice(0, 2).join(' ') : item.product.nameAr.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and CTAs */}
                <div className="pt-6 border-t border-brand-cream/80 space-y-4 mt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-sans line-through block leading-none mb-1">
                        {bundle.originalPrice} {language === 'en' ? 'AED/SAR' : 'ريال'}
                      </span>
                      <span className="text-brand-primary text-xl font-bold font-sans">
                        {bundle.bundlePrice} {language === 'en' ? 'AED/SAR' : 'ريال'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm font-sans uppercase">
                        {language === 'en' ? `You Save ${savings} AED` : `توفير ${savings} ريال`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBundle(bundle);
                      }}
                      className="btn-secondary !py-3 !rounded-xl text-center cursor-pointer text-[10px] flex items-center justify-center gap-1 font-sans"
                    >
                      <span>{language === 'en' ? 'Explore Routine' : 'اكتشفي الروتين'}</span>
                      <ArrowRight size={12} className="rtl:rotate-180" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBundle(bundle);
                      }}
                      className="btn-primary !py-3 !rounded-xl text-center cursor-pointer text-[10px] flex items-center justify-center gap-1.5 font-sans"
                    >
                      <ShoppingBag size={12} />
                      <span>{language === 'en' ? 'Add To Bag' : 'إضافة للحقيبة'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
