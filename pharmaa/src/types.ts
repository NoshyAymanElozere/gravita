export type Language = 'en' | 'ar';

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
}

export type SkinType = 'all' | 'dry' | 'oily' | 'sensitive' | 'combination';

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  ingredientsEn: string;
  ingredientsAr: string;
  skinTypeEn: string;
  skinTypeAr: string;
  benefitsEn: string[];
  benefitsAr: string[];
  howToUseEn: string;
  howToUseAr: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  size: string; // e.g. "50ml", "100ml"
  image: string;
  galleryImages: string[];
  isBestSeller: boolean;
  isNew: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  categorySlug: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  expiresAt: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  commentEn: string;
  commentAr: string;
  productNameEn: string;
  productNameAr: string;
  verified: boolean;
  helpfulCount: number;
  userPhoto?: string;
}

export interface CartItem {
  id: string; // combination of productId and size
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'returned' | 'cancelled';
  items: {
    productId: string;
    productNameEn: string;
    productNameAr: string;
    price: number;
    quantity: number;
    image: string;
    selectedSize: string;
  }[];
  shippingAddress: Address;
  paymentMethod: 'credit_card' | 'cod' | 'apple_pay' | 'google_pay';
  couponApplied?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist: string[]; // Product IDs
}

export interface BundleProduct {
  product: Product;
  stepEn: string;
  stepAr: string;
  benefitEn: string;
  benefitAr: string;
}

export interface Bundle {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  items: BundleProduct[];
  discountPercentage: number;
  originalPrice: number;
  bundlePrice: number;
  benefitsEn: string[];
  benefitsAr: string[];
}

