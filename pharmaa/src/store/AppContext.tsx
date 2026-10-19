"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Product, Bundle } from '../types';
import { useAppStore, convertBundleToProduct } from './useAppStore';

export { convertBundleToProduct };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const storeActivePage = useAppStore((state) => state.activePage);
  const storeSetActivePage = useAppStore((state) => state.setActivePage);
  const catalogLoaded = useAppStore((state) => state.catalogLoaded);

  // Restore the saved session/guest cart, then load the catalog and the account from the API
  useEffect(() => {
    const store = useAppStore;
    Promise.resolve(store.persist.rehydrate()).then(() => {
      store.getState().initSession();
    });
    store.getState().loadCatalog();
  }, []);

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
    if (typeof window === 'undefined' || !catalogLoaded) return;

    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const id = params.get('id');

      const { selectedProduct, selectedBundle, products, bundles } = useAppStore.getState();

      if (type === 'product' && id) {
        const prod = products.find((p) => p.id === id || p.slug === id);
        if (prod && (!selectedProduct || selectedProduct.id !== prod.id)) {
          useAppStore.setState({ selectedProduct: prod, selectedBundle: null });
        }
      } else if (type === 'bundle' && id) {
        const bund = bundles.find((b) => b.id === id || b.slug === id);
        if (bund && (!selectedBundle || selectedBundle.id !== bund.id)) {
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
  }, [catalogLoaded]);

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
      if (product && product.categorySlug === 'bundles') {
        const bundle = store.bundles.find(b => b.id === product.id);
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
