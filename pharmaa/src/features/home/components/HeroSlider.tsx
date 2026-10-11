"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function HeroSlider() {
  const { language, setActivePage } = useApp();

  const banners = [
    '/assets/images/banner1.png',
    '/assets/images/banner2.png',
    '/assets/images/banner3.png'
  ];
  
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);

  return (
    <section className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] lg:h-[580px] overflow-hidden bg-brand-cream/10 rounded-2xl md:rounded-3xl shadow-md group">
      {/* Banner Images Slider */}
      <div className="absolute inset-0 w-full h-full">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out ${
              idx === currentBanner ? 'opacity-100 scale-100 z-10 visible' : 'opacity-0 scale-95 pointer-events-none z-0 invisible'
            }`}
            style={{ backgroundImage: `url('${banner}')` }}
          />
        ))}
      </div>

      {/* Ambient luxury light/shadow overlay */}
      <div className="absolute inset-0 bg-brand-primary/5 z-20 pointer-events-none" />

      {/* Linear bottom & top fade gradients to seamlessly integrate with the cream layout */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-cream/60 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-brand-cream to-transparent z-20 pointer-events-none" />

      {/* Subtle premium frame borders */}
      <div className="absolute inset-4 border border-brand-primary/5 pointer-events-none rounded-2xl z-20" />

      {/* Carousel slide controls (Only visible on hover / active) */}
      <button
        onClick={prevBanner}
        className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 z-30 bg-brand-cream/80 hover:bg-brand-cream text-brand-primary p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300"
        aria-label="Previous Banner"
      >
        <ArrowLeft size={16} />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 z-30 bg-brand-cream/80 hover:bg-brand-cream text-brand-primary p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300"
        aria-label="Next Banner"
      >
        <ArrowRight size={16} />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5 rtl:space-x-reverse">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentBanner(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              i === currentBanner ? 'bg-brand-primary w-6' : 'bg-brand-primary/30 hover:bg-brand-primary/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
