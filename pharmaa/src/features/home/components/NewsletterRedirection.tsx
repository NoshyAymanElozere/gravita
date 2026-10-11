"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';

export default function NewsletterRedirection() {
  const { language } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
      <div className="max-w-lg mx-auto p-8 bg-brand-secondary/5 rounded-2xl border border-brand-sage-light/20">
        <span className="text-[9px] tracking-widest text-brand-sage-muted uppercase block font-semibold mb-2">
          {language === 'en' ? 'Aura Loyalty Circle' : 'دائرة الولاء لأورا'}
        </span>
        <p className="text-xs text-zinc-500 leading-relaxed font-sans">
          {language === 'en'
            ? 'Our seasonal offers and custom coupon codes are managed dynamically. Scroll directly to our Footer block below to subscribe and unlock immediate 10% premium reductions!'
            : 'جميع أكواد خصم المشتركين تتم إدارتها تلقائياً وبأمان. تفضلي بالنزول أسفل الصفحة للتسجيل في قائمة الرسائل المميزة لتلقي خصومات فورية.'}
        </p>
      </div>
    </section>
  );
}
