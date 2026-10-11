"use client";

import React, { useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { Product } from '../../types';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    language,
    setSelectedProduct,
    addToCart
  } = useApp();

  const hasDiscount = product.discountPrice !== undefined;
  
  // Calculate discount percentage if discount exists
  const discountPercent = hasDiscount && product.price > 0
    ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100)
    : 0;

  const t = {
    aed: language === 'en' ? 'AED/SAR' : 'ريال/درهم',
    off: language === 'en' ? 'OFF' : 'خصم'
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const imgElement = cardRef.current?.querySelector('img');
    const desktopCart = document.getElementById('cart-btn-desktop');
    const mobileCart = document.getElementById('cart-btn-mobile');
    
    // Choose the target cart button based on device viewport
    let cartBtn = desktopCart;
    if (window.innerWidth < 768) {
      cartBtn = mobileCart || desktopCart;
    }

    if (imgElement && cartBtn) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();

      // Create a floating flyer element
      const flyer = document.createElement('img');
      flyer.src = imgElement.src;
      
      // Initial styles for starting point
      flyer.style.position = 'fixed';
      flyer.style.zIndex = '99999';
      flyer.style.borderRadius = '50%';
      flyer.style.objectFit = 'cover';
      flyer.style.pointerEvents = 'none';
      flyer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      flyer.style.top = `${imgRect.top}px`;
      flyer.style.left = `${imgRect.left}px`;
      flyer.style.width = `${imgRect.width}px`;
      flyer.style.height = `${imgRect.height}px`;

      document.body.appendChild(flyer);

      // Generate quadratic Bezier keyframes for curved path
      const keyframes = [];
      const steps = 15;
      const targetX = cartRect.left + cartRect.width / 2 - 20;
      const targetY = cartRect.top + cartRect.height / 2 - 20;
      
      // Control point is located offset horizontally and pulled upwards (180px above the highest element)
      const ctrlX = imgRect.left + (targetX - imgRect.left) * 0.35;
      const ctrlY = Math.min(imgRect.top, targetY) - 185;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        
        // Quadratic bezier trajectory calculation
        const x = mt * mt * imgRect.left + 2 * mt * t * ctrlX + t * t * targetX;
        const y = mt * mt * imgRect.top + 2 * mt * t * ctrlY + t * t * targetY;
        
        // Scale and opacity interpolation
        const scale = 1 - t * 0.85;
        const opacity = 1 - t * 0.85;

        keyframes.push({
          left: `${x}px`,
          top: `${y}px`,
          width: `${imgRect.width * scale}px`,
          height: `${imgRect.height * scale}px`,
          opacity: opacity,
          offset: t
        });
      }

      // Web Animations API: animate using the generated curved trajectory keyframes
      const animation = flyer.animate(keyframes, {
        duration: 1100, // Slightly slower and more natural
        easing: 'ease-out',
        fill: 'forwards'
      });

      animation.onfinish = () => {
        flyer.remove();

        // Bounce animation triggers on cart buttons
        if (desktopCart) desktopCart.classList.add('cart-bounce');
        if (mobileCart) mobileCart.classList.add('cart-bounce');

        // Add to cart state update
        addToCart(product, product.size, 1);

        // Toast style configuration
        const toastConfig = {
          duration: 2500,
          style: {
            background: '#FFFFFF', // Clean white background
            color: '#374037', // Brand Primary text color
            border: '1px solid rgba(55, 64, 55, 0.12)', // Subtle border
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(55, 64, 55, 0.08), 0 8px 10px -6px rgba(55, 64, 55, 0.08)',
            padding: '12px 20px',
          },
          iconTheme: {
            primary: '#6b826b', // Muted sage green success icon
            secondary: '#FFFFFF'
          }
        };

        // Show toast success
        toast.success(
          language === 'en' 
            ? `${product.nameEn} added to bag!` 
            : `تمت إضافة ${product.nameAr} إلى الحقيبة!`,
          toastConfig
        );

        setTimeout(() => {
          if (desktopCart) desktopCart.classList.remove('cart-bounce');
          if (mobileCart) mobileCart.classList.remove('cart-bounce');
        }, 500);
      };
    } else {
      addToCart(product, product.size, 1);
      
      const toastConfig = {
        duration: 2500,
        style: {
          background: '#FFFFFF',
          color: '#374037',
          border: '1px solid rgba(55, 64, 55, 0.12)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '500',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(55, 64, 55, 0.08), 0 8px 10px -6px rgba(55, 64, 55, 0.08)',
          padding: '12px 20px',
        },
        iconTheme: {
          primary: '#6b826b',
          secondary: '#FFFFFF'
        }
      };

      // Show toast success directly if elements not found
      toast.success(
        language === 'en' 
          ? `${product.nameEn} added to bag!` 
          : `تمت إضافة ${product.nameAr} إلى الحقيبة!`,
        toastConfig
      );
    }
  };

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className="group relative flex flex-col w-full bg-white rounded-xl border border-brand-sage-light/10 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full bg-zinc-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.nameEn}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md shadow-sm">
            {discountPercent}% {t.off}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Product Name */}
          <h4 className="font-serif text-xs sm:text-sm font-bold text-zinc-950 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
            {language === 'en' ? product.nameEn : product.nameAr}
          </h4>
        </div>

        {/* Price Row & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-sage-light/10">
          <div className="flex flex-col font-sans">
            {hasDiscount ? (
              <>
                <span className="text-zinc-400 text-[9px] sm:text-[10px] line-through font-medium leading-none mb-0.5">
                  {product.price} {t.aed}
                </span>
                <span className="text-brand-primary font-bold text-xs sm:text-sm leading-none">
                  {product.discountPrice} {t.aed}
                </span>
              </>
            ) : (
              <span className="text-brand-primary font-bold text-xs sm:text-sm leading-none">
                {product.price} {t.aed}
              </span>
            )}
          </div>

          {/* Quick Add Button - ICON ONLY */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-brand-cream p-2 rounded-lg transition-colors cursor-pointer shadow-3xs"
            aria-label="Add to cart"
          >
            <ShoppingCart size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
