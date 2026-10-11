"use client";

import React from 'react';
import HeroSlider from './components/HeroSlider';
import BestSellers from './components/BestSellers';
import ProductGrid from './components/ProductGrid';
import PromoBanner from './components/PromoBanner';
import FeaturesBar from './components/FeaturesBar';
import ShopByCategory from './components/ShopByCategory';
import NewArrivals from './components/NewArrivals';
import Reviews from './components/Reviews';
import NewsletterRedirection from './components/NewsletterRedirection';

export default function HomeView() {
  return (
    <div className="w-full space-y-20 pb-20">
      <HeroSlider />
      <BestSellers />
      <ProductGrid />
      <PromoBanner />
      <FeaturesBar />
      {/* <ShopByCategory /> */}
      <NewArrivals />
      <Reviews />
      <NewsletterRedirection />
    </div>
  );
}
