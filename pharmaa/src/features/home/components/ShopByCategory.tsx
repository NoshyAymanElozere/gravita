"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';
import { CATEGORIES } from '../../../constants/data';
import SectionTitle from '../../../components/shared/SectionTitle';

export default function ShopByCategory() {
  const { language, setActiveCategory, setActivePage } = useApp();

  const title = language === 'en' ? 'Shop by Category' : 'تسوقي حسب الفئة';
  const description = language === 'en' 
    ? 'Targeted clinical pathways crafted with pristine organic materials.' 
    : 'مسارات علاجية مستهدفة مصنوعة من مواد طبيعية نقية ومثبتة.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SectionTitle
        subtitle={language === 'en' ? 'Organic Laboratories' : 'علاجات نباتية مجهزة'}
        title={title}
        description={description}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.slug);
              setActivePage('shop');
            }}
            className="bg-white rounded-2xl overflow-hidden border border-brand-sage-light/10 shadow-xs hover:border-brand-sage-muted hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col items-center text-center p-4"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-cream group-hover:scale-105 transition-transform duration-300">
              <img src={cat.image} alt={cat.nameEn} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-serif text-xs font-bold text-zinc-900 mt-4 group-hover:text-brand-primary transition-colors">
              {language === 'en' ? cat.nameEn : cat.nameAr}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 max-w-[130px] line-clamp-1 font-sans">
              {language === 'en' ? cat.descriptionEn : cat.descriptionAr}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
