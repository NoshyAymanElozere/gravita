"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';
import { PRODUCTS } from '../../../constants/data';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/shared/ProductCard';
import SectionTitle from '../../../components/shared/SectionTitle';

export default function NewArrivals() {
  const { language, setActiveCategory, setActivePage } = useApp();

  const title = language === 'en' ? 'New Arrivals' : 'وصل حديثاً';
  const description = language === 'en' 
    ? 'Freshly bottled scientific breakthroughs to refresh your vanity.' 
    : 'ابتكارات علمية حديثة تم صبها مؤخراً لروتينكِ المستمر.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <SectionTitle
          subtitle={language === 'en' ? 'Fresh Science Release' : 'إصدارات جديدة وحديثة'}
          title={title}
          description={description}
        />
        <button
          onClick={() => {
            setActiveCategory(null);
            setActivePage('shop');
          }}
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs uppercase tracking-wider font-semibold text-brand-primary hover:text-brand-sage-muted hover:underline transition-all cursor-pointer pt-2"
        >
          <span>{language === 'en' ? 'Discover all releases' : 'اكتشفي الإضافات الجديدة'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Carousel for newly released items */}
      <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-thin snap-x scroll-smooth">
        {PRODUCTS.filter((p) => p.isNew).map((product) => (
          <div key={product.id} className="snap-start select-none flex-shrink-0 w-[160px] sm:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
