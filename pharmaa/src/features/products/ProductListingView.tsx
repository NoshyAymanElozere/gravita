"use client";

import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { PRODUCTS, CATEGORIES } from '../../constants/data';
import { Grid, List, Heart, Star, Eye, Filter, X, Check, Search } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../../components/shared/ProductCard';

export default function ProductListingView() {
  const {
    language,
    activePage,
    setActivePage,
    setSelectedProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeSkinType,
    setActiveSkinType,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Translations
  const t = {
    allProducts: language === 'en' ? 'Prescribed Formulations' : 'مستحضرات طبية تجميلية',
    subText: language === 'en' ? 'Clinically evaluated botanical solutions targeted for absolute skin restoration.' : 'حلول نباتية مقيمة عملياً تم تطويرها واستخلاصها لتجديد البشرة.',
    filters: language === 'en' ? 'Skin Filters' : 'تصفية البشرة',
    categories: language === 'en' ? 'Product Category' : 'فئات وعلاجات',
    allCategories: language === 'en' ? 'All Collections' : 'كل المجموعات',
    skinConcern: language === 'en' ? 'Ideal Skin Type' : 'نوع البشرة المثالي',
    skinAll: language === 'en' ? 'All Concerns' : 'جميع الحالات',
    skinDry: language === 'en' ? 'Dry / Dehydrated' : 'الجافة والمتهيجة',
    skinOily: language === 'en' ? 'Oily / Active Sebum' : 'الدهنية والزيتية',
    skinSensitive: language === 'en' ? 'Hypoallergenic / Sensitive' : 'الحساسة وتلف الخلايا',
    skinCombination: language === 'en' ? 'Combination' : 'البشرة المختلطة',
    price: language === 'en' ? 'Maximum Price' : 'السعر الأقصى',
    sortByLabel: language === 'en' ? 'Sort By' : 'تحت ترتيب',
    sortBest: language === 'en' ? 'Best Sellers' : 'الأكثر مبيعاً',
    sortLowHigh: language === 'en' ? 'Price: Low to High' : 'السعر: من الأقل للأعلى',
    sortHighLow: language === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى للأقل',
    sortNew: language === 'en' ? 'New Arrivals' : 'وصل حديثاً',
    availabilityEn: 'Availability',
    availabilityAr: 'مدى التوفر',
    inStockOnlyEn: 'In Stock Only',
    inStockOnlyAr: 'المنتجات المتوفرة فقط',
    showingEn: 'Showing',
    showingAr: 'عرض',
    resultsEn: 'formulations found',
    resultsAr: 'مستحضر متاح حالياً',
    resetFiltersEn: 'Reset All Filters',
    resetFiltersAr: 'إعادة تعيين الفلاتر',
    noResultsEn: 'No formulations match your precise filters. Try broadening your concern options.',
    noResultsAr: 'لم نجد أي مستحضرات مطابقة لخيارات الفلترة هذه. حاولي اختيار فئات أخرى.',
    aed: language === 'en' ? 'AED/SAR' : 'ريال',
    searchActiveEn: 'Search result for',
    searchActiveAr: 'نتائج البحث عن',
    clearSearchEn: 'Clear Search',
    clearSearchAr: 'مسح البحث'
  };

  // 1. Filtering logic
  const filteredProducts = PRODUCTS.filter((product) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.nameEn.toLowerCase().includes(q) || product.nameAr.includes(q);
      const matchSub = product.subtitleEn.toLowerCase().includes(q) || product.subtitleAr.includes(q);
      const matchIng = product.ingredientsEn.toLowerCase().includes(q) || product.ingredientsAr.includes(q);
      if (!matchName && !matchSub && !matchIng) return false;
    }

    // Category filter
    if (activeCategory && product.categorySlug !== activeCategory) {
      return false;
    }

    // Skin Type filter
    if (activeSkinType) {
      const pSkin = product.skinTypeEn.toLowerCase();
      const searchSkin = activeSkinType.toLowerCase();
      if (!pSkin.includes(searchSkin) && searchSkin !== 'all') {
        return false;
      }
    }

    // Price range filter
    const activePrice = product.discountPrice ?? product.price;
    if (activePrice > priceRange[1]) {
      return false;
    }

    // Availability filter
    if (onlyInStock && product.stockStatus !== 'in_stock') {
      return false;
    }

    return true;
  });

  // 2. Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.discountPrice ?? a.price;
    const bPrice = b.discountPrice ?? b.price;

    if (sortBy === 'price-low-high') {
      return aPrice - bPrice;
    }
    if (sortBy === 'price-high-low') {
      return bPrice - aPrice;
    }
    if (sortBy === 'newest') {
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    // Default best-selling (ratings first, then reviews count)
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  const handleResetFilters = () => {
    setActiveCategory(null);
    setActiveSkinType(null);
    setPriceRange([0, 500]);
    setSortBy('best-selling');
    setOnlyInStock(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center md:text-left rtl:md:text-right border-b border-brand-cream pb-8 space-y-3">
        <span className="text-[10px] tracking-[0.4em] font-bold text-brand-sage-muted uppercase block">
          {searchQuery ? `${t.searchActiveEn} "${searchQuery}"` : t.allProducts}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary tracking-tight">
          {searchQuery ? `“${searchQuery}”` : t.allCategories}
        </h1>
        <p className="text-sm text-brand-sage-muted font-sans max-w-2xl leading-relaxed">
          {t.subText}
        </p>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-red-650 hover:underline font-semibold tracking-wider uppercase flex items-center justify-center md:justify-start gap-1 cursor-pointer font-sans"
          >
            <X size={12} />
            <span>{t.clearSearchEn}</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="max-w-xl mx-auto relative mb-4">
        <input
          type="text"
          placeholder={language === 'en' ? 'Search elixirs, ingredients, skin concern...' : 'ابحثي عن الإكسير، المكونات، مشاكل البشرة...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-11 pr-10 rtl:pr-11 rtl:pl-10 !py-3.5 !text-sm !rounded-2xl bg-brand-cream/30"
        />
        <Search className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-brand-sage-muted" size={18} />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Top Toolbar: View Toggles, Sorting, Mobile Filter Trigger */}
      <div className="flex items-center justify-between card-base !p-4 shadow-xs !rounded-2xl">
        {/* Results indicator */}
        <div className="text-xs text-brand-sage-muted font-medium font-sans">
          {t.showingEn} <span className="font-bold text-brand-primary">{sortedProducts.length}</span> {t.resultsEn}
        </div>

        {/* Controls block */}
        <div className="flex items-center space-x-4 sm:space-x-6 rtl:space-x-reverse">
          {/* Mobile Filter Trigger commented out per request */}
          {/* <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-semibold text-brand-primary bg-brand-cream border border-brand-sage-light/25 px-3.5 py-2 rounded-xl hover:bg-brand-cream/80 cursor-pointer transition-colors"
          >
            <Filter size={14} />
            <span>{t.filters}</span>
          </button> */}

          {/* Desktop Sort Dropdown */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <label className="hidden sm:inline text-[10px] text-brand-sage-muted uppercase tracking-wider font-bold">
              {t.sortByLabel}:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-cream/40 border border-brand-sage-light/25 focus:border-brand-primary focus:outline-none text-xs font-bold rounded-xl py-2 px-3 text-brand-primary font-sans cursor-pointer transition-colors"
            >
              <option value="best-selling">{t.sortBest}</option>
              <option value="price-low-high">{t.sortLowHigh}</option>
              <option value="price-high-low">{t.sortHighLow}</option>
              <option value="newest">{t.sortNew}</option>
            </select>
          </div>

          {/* Grid/List toggles */}
          <div className="hidden sm:flex items-center border border-brand-sage-light/15 rounded-xl overflow-hidden bg-brand-cream/40 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? 'bg-brand-primary text-brand-cream shadow-sm' : 'text-brand-sage-muted/70 hover:text-brand-primary'}`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'bg-brand-primary text-brand-cream shadow-sm' : 'text-brand-sage-muted/70 hover:text-brand-primary'}`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Pane: Sidebar filters + Products list */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* DESKTOP FILTER SIDEBAR commented out per request */}
        {/* <div className="hidden md:block col-span-1 space-y-8 card-base !p-6 !rounded-2xl h-max">
          ... (sidebar filters commented)
        </div> */}

        {/* PRODUCTS LIST SIDE */}
        <div className="col-span-1 md:col-span-4">

          {sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sortedProducts.map((prod) => (
                  <div key={prod.id} className="w-full">
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {sortedProducts.map((prod) => (
                  <div key={prod.id} className="w-full">
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            )
          ) : (
            /* EMPTY VIEW */
            <div className="card-base p-12 text-center flex flex-col items-center justify-center space-y-4 !rounded-3xl shadow-xs">
              <span className="text-brand-sage-muted bg-brand-cream/60 p-4 rounded-full">
                <Filter size={32} />
              </span>
              <p className="text-sm font-medium text-brand-primary max-w-sm leading-relaxed font-sans">
                {language === 'en' ? t.noResultsEn : t.noResultsAr}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-primary hover:bg-brand-secondary text-brand-cream text-xs font-semibold py-2.5 px-6 rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-3xs"
              >
                {language === 'en' ? t.resetFiltersEn : t.resetFiltersAr}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FILTER MODAL DRAWER OVERLAY commented out per request */}
      {/* {isMobileFiltersOpen && (
        ...
      )} */}


    </div>
  );
}
