"use client";

import React, { useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { PRODUCTS } from '../../../constants/data';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/shared/ProductCard';
import SectionTitle from '../../../components/shared/SectionTitle';

export default function BestSellers() {
  const { language, setActiveCategory, setActivePage } = useApp();
  const bestSellersRef = useRef<HTMLDivElement>(null);

  const scrollBestSellers = (direction: 'left' | 'right') => {
    if (bestSellersRef.current) {
      const scrollAmount = 320;
      const dirMultiplier = language === 'ar' ? -1 : 1;
      const finalAmount = direction === 'left' ? -scrollAmount : scrollAmount;
      bestSellersRef.current.scrollBy({
        left: finalAmount * dirMultiplier,
        behavior: 'smooth'
      });
    }
  };

  const title = language === 'en' ? 'The Best Sellers' : 'الأكثر مبيعاً';
  const description = language === 'en' 
    ? 'Our most coveted daily formulation staples requested worldwide.' 
    : 'تركيباتنا اليومية الأكثر طلباً وشهرة حول العالم.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <SectionTitle
          subtitle={language === 'en' ? 'Clinical Favorites' : 'المفضلة سريرياً'}
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
          <span>{language === 'en' ? 'See all products' : 'رؤية كل المنتجات'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Swiper simulated slider container with scroll arrows */}
      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          onClick={() => scrollBestSellers('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-brand-primary border border-brand-sage-light/35 p-3.5 rounded-full shadow-md hover:scale-115 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Scroll Left"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Scroll container */}
        <div
          ref={bestSellersRef}
          className="flex overflow-x-auto pb-6 gap-6 scrollbar-thin snap-x scroll-smooth px-2"
        >
          {PRODUCTS.filter((p) => p.isBestSeller).map((product) => (
            <div key={product.id} className="snap-start select-none flex-shrink-0 w-[160px] sm:w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollBestSellers('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-brand-primary border border-brand-sage-light/35 p-3.5 rounded-full shadow-md hover:scale-115 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Scroll Right"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
