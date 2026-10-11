"use client";

import React from 'react';
import { useApp } from '../../../store/AppContext';
import { PRODUCTS } from '../../../constants/data';
import ProductCard from '../../../components/shared/ProductCard';
import SectionTitle from '../../../components/shared/SectionTitle';

export default function ProductGrid() {
  const { language } = useApp();

  const title = language === 'en' ? 'Products' : 'منتجاتنا';
  const description = language === 'en'
    ? 'Explore our clinical line of organic botanical solutions for complete skin health.'
    : 'اكتشفي تشكيلة المستحضرات الطبية المصنوعة من مواصفات عضوية فائقة النقاء.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SectionTitle
        subtitle={language === 'en' ? 'Our Formulations' : 'مجموعتنا الكاملة'}
        title={title}
        description={description}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {PRODUCTS.slice(0, 3).map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
