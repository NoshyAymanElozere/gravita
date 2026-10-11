"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';
import { Truck, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export default function FeaturesBar() {
  const { language } = useApp();

  const features = [
    {
      icon: <Truck className="text-brand-sage-muted" size={24} />,
      titleEn: 'Fast & Temperature-Controlled Shipping',
      titleAr: 'توصيل مبرّد وسريع',
      descEn: 'Dispatched in cooling boxes to protect active bacterial prebiotics and serums.',
      descAr: 'تُشحن في عبوات مبردة لحماية البريبايوتك ومكونات السيروم النشطة.'
    },
    {
      icon: <ShieldCheck className="text-brand-sage-muted" size={24} />,
      titleEn: '100% Secure Encrypted Payment',
      titleAr: 'دفع مشفر آمن 100٪',
      descEn: 'Flexible payment via Credit Card, Apple Pay, Google Pay, or Cash on Delivery.',
      descAr: 'خيارات دفع مرنة بالبطاقة الأمنة، آبل باي، أو الدفع نقداً عند الاستلام.'
    },
    {
      icon: <Sparkles className="text-brand-sage-muted" size={24} />,
      titleEn: 'Pristine Botanical Formulations',
      titleAr: 'تركيبات نباتية نقية',
      descEn: '100% vegan, cruelty-free, synthesized on premium biocompatible plant bases.',
      descAr: 'نباتي 100٪، بدون قسوة، ومصنوع على قواعد نباتية متوافقة حيوياً.'
    },
    {
      icon: <HelpCircle className="text-brand-sage-muted" size={24} />,
      titleEn: 'Dermatologist Consulting Support',
      titleAr: 'دعم استشاري لطب الجلد',
      descEn: 'Expert guidance available via online live chat to diagnose skin concerns.',
      descAr: 'فريق طبي تجميلي متوفر عبر المحادثة المباشرة لتشخيص وعلاج بشرتكِ.'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-brand-sage-light/10 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left rtl:sm:text-right space-y-3 group hover:border-brand-sage-muted transition-all duration-300"
          >
            <div className="p-3 bg-brand-cream rounded-xl group-hover:scale-110 group-hover:bg-brand-sage-light/20 transition-all">
              {feat.icon}
            </div>
            <h3 className="font-serif text-sm font-bold text-zinc-900 group-hover:text-brand-primary transition-colors">
              {language === 'en' ? feat.titleEn : feat.titleAr}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              {language === 'en' ? feat.descEn : feat.descAr}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
