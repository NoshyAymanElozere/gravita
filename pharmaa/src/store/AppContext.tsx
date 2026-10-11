"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Language, Product, CartItem, Coupon, Order, Address, UserProfile, Category, Bundle } from '../types';
import { PRODUCTS, BUNDLES } from '../constants/data';
import { useAppStore } from './useAppStore';

export function convertBundleToProduct(bundle: Bundle): Product {
  return {
    id: bundle.id,
    slug: bundle.slug,
    nameEn: bundle.nameEn,
    nameAr: bundle.nameAr,
    subtitleEn: bundle.subtitleEn,
    subtitleAr: bundle.subtitleAr,
    descriptionEn: bundle.descriptionEn,
    descriptionAr: bundle.descriptionAr,
    ingredientsEn: bundle.items.map(item => item.product.nameEn).join(', '),
    ingredientsAr: bundle.items.map(item => item.product.nameAr).join('، '),
    skinTypeEn: 'Various',
    skinTypeAr: 'مختلف',
    benefitsEn: bundle.benefitsEn,
    benefitsAr: bundle.benefitsAr,
    howToUseEn: bundle.items.map((item, idx) => `Step ${idx + 1}: ${item.stepEn}`).join('\n'),
    howToUseAr: bundle.items.map((item, idx) => `الخطوة ${idx + 1}: ${item.stepAr}`).join('\n'),
    price: bundle.originalPrice,
    discountPrice: bundle.bundlePrice,
    rating: 5.0,
    reviewCount: 1,
    size: 'Complete Set',
    image: bundle.image,
    galleryImages: [bundle.image],
    isBestSeller: true,
    isNew: false,
    stockStatus: 'in_stock',
    categorySlug: 'bundles'
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const storeActivePage = useAppStore((state) => state.activePage);
  const storeSetActivePage = useAppStore((state) => state.setActivePage);

  // Sync state active page with current router pathname
  useEffect(() => {
    if (!pathname) return;
    let page = 'home';
    if (pathname === '/shop') page = 'shop';
    else if (pathname === '/cart') page = 'cart';
    else if (pathname === '/checkout') page = 'checkout';
    else if (pathname === '/profile') page = 'profile';
    else if (pathname === '/auth') page = 'auth';
    else if (pathname === '/product-details') page = 'product-details';
    else if (pathname === '/bundles') page = 'bundles';

    if (page !== storeActivePage) {
      storeSetActivePage(page);
    }
  }, [pathname, storeActivePage, storeSetActivePage]);

  // Sync selectedProduct and selectedBundle with query parameters (support back/forward/refresh navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const id = params.get('id');

      const { selectedProduct, selectedBundle } = useAppStore.getState();

      if (type === 'product' && id) {
        const prod = PRODUCTS.find((p) => p.id === id);
        if (prod && (!selectedProduct || selectedProduct.id !== id)) {
          useAppStore.setState({ selectedProduct: prod, selectedBundle: null });
        }
      } else if (type === 'bundle' && id) {
        const bund = BUNDLES.find((b) => b.id === id);
        if (bund && (!selectedBundle || selectedBundle.id !== id)) {
          useAppStore.setState({ selectedBundle: bund, selectedProduct: null });
        }
      } else {
        if (window.location.pathname === '/product-details') {
          useAppStore.setState({ selectedProduct: null, selectedBundle: null });
        }
      }
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return <>{children}</>;
};

export const useApp = () => {
  const store = useAppStore();
  const router = useRouter();

  const setSelectedBundleRedirect = (bundle: Bundle) => {
    store.setSelectedBundle(bundle);
    router.push(`/product-details?type=bundle&id=${bundle.id}`);
  };

  return {
    ...store,
    setActivePage: (page: string) => {
      store.setActivePage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      let path = '/';
      if (page === 'home') path = '/';
      else if (page === 'shop') path = '/shop';
      else if (page === 'cart') path = '/cart';
      else if (page === 'checkout') path = '/checkout';
      else if (page === 'profile') path = '/profile';
      else if (page === 'auth') path = '/auth';
      else if (page === 'developer-specs') path = '/developer-specs';
      else if (page === 'bundles') path = '/bundles';

      router.push(path);
    },
    setSelectedProduct: (product: Product | null) => {
      if (product && (product.categorySlug === 'bundles' || product.id.startsWith('bundle_'))) {
        const bundle = BUNDLES.find(b => b.id === product.id);
        if (bundle) {
          setSelectedBundleRedirect(bundle);
          return;
        }
      }
      store.setSelectedProduct(product);
      if (product) {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        router.push(`/product-details?type=product&id=${product.id}`);
      }
    },
    setSelectedBundle: (bundle: Bundle | null) => {
      store.setSelectedBundle(bundle);
      if (bundle) {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        router.push(`/product-details?type=bundle&id=${bundle.id}`);
      }
    }
  };
};
