// Maps gravuta-backend documents to the shapes in src/types.ts,
// so the existing components keep working unchanged.
import { Address, Bundle, CartItem, Category, Coupon, Order, Product, Review, UserProfile } from '../types';
import { resolveImage } from './api';

export function mapCategory(c: any): Category {
  return {
    id: c._id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn || '',
    descriptionAr: c.descriptionAr || '',
    image: resolveImage(c.image)
  };
}

export function mapProduct(p: any): Product {
  return {
    id: p._id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    subtitleEn: p.subtitleEn || '',
    subtitleAr: p.subtitleAr || '',
    descriptionEn: p.descriptionEn || '',
    descriptionAr: p.descriptionAr || '',
    ingredientsEn: p.ingredientsEn || '',
    ingredientsAr: p.ingredientsAr || '',
    skinTypeEn: p.skinTypeEn || '',
    skinTypeAr: p.skinTypeAr || '',
    benefitsEn: p.benefitsEn || [],
    benefitsAr: p.benefitsAr || [],
    howToUseEn: p.howToUseEn || '',
    howToUseAr: p.howToUseAr || '',
    price: p.price,
    discountPrice: p.discountPrice ?? undefined,
    rating: p.rating ?? p.ratingAvg ?? 0,
    reviewCount: p.reviewCount ?? p.ratingCount ?? 0,
    size: p.size || '',
    image: resolveImage(p.image),
    galleryImages: (p.galleryImages?.length ? p.galleryImages : [p.image]).map(resolveImage),
    isBestSeller: Boolean(p.isBestSeller),
    isNew: Boolean(p.isNew),
    stockStatus: p.stockStatus || 'in_stock',
    categorySlug: typeof p.category === 'object' && p.category ? p.category.slug : ''
  };
}

export function mapBundle(b: any): Bundle {
  return {
    id: b._id,
    slug: b.slug,
    nameEn: b.nameEn,
    nameAr: b.nameAr,
    subtitleEn: b.subtitleEn || '',
    subtitleAr: b.subtitleAr || '',
    descriptionEn: b.descriptionEn || '',
    descriptionAr: b.descriptionAr || '',
    image: resolveImage(b.image),
    items: (b.items || [])
      .filter((item: any) => item.product && typeof item.product === 'object')
      .map((item: any) => ({
        product: mapProduct(item.product),
        stepEn: item.stepEn,
        stepAr: item.stepAr,
        benefitEn: item.benefitEn,
        benefitAr: item.benefitAr
      })),
    discountPercentage: b.discountPercentage,
    originalPrice: b.originalPrice,
    bundlePrice: b.bundlePrice,
    benefitsEn: b.benefitsEn || [],
    benefitsAr: b.benefitsAr || []
  };
}

// A bundle shown/stored as a product (same convention the UI already uses: categorySlug === 'bundles')
export function bundleToProduct(bundle: Bundle): Product {
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

export const isBundleProduct = (product: Product) => product.categorySlug === 'bundles';

export const cartItemId = (product: Product, size: string) => `${product.id}_${size}`;

// Server cart line -> UI cart item
export function mapCartLine(line: any): CartItem | null {
  if (line.itemType === 'bundle') {
    if (!line.bundle) return null;
    const product = bundleToProduct(mapBundle(line.bundle));
    return { id: cartItemId(product, product.size), product, quantity: line.quantity, selectedSize: product.size };
  }
  if (!line.product) return null;
  const product = mapProduct(line.product);
  return { id: cartItemId(product, product.size), product, quantity: line.quantity, selectedSize: product.size };
}

export function mapCoupon(c: any): Coupon {
  return {
    code: c.code,
    discountType: c.discountType,
    value: c.value,
    minOrderAmount: c.minOrderAmount ?? 0,
    expiresAt: c.expiresAt || '',
    descriptionEn: c.descriptionEn || '',
    descriptionAr: c.descriptionAr || ''
  };
}

export function mapAddress(a: any): Address {
  return {
    id: a._id || '',
    fullName: a.fullName,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 || undefined,
    city: a.city,
    state: a.state || '',
    postalCode: a.postalCode || '',
    country: a.country || '',
    phone: a.phone,
    isDefault: Boolean(a.isDefault)
  };
}

export function mapUser(u: any, wishlist: string[] = []): UserProfile {
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    addresses: (u.addresses || []).map(mapAddress),
    wishlist
  };
}

// The profile page groups statuses into: processing / in-transit / delivered / returned / cancelled
const ORDER_STATUS_MAP: Record<string, Order['status']> = {
  pending: 'processing',
  confirmed: 'processing',
  processing: 'processing',
  shipped: 'in-transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
  return_requested: 'returned',
  returned: 'returned'
};

const formatDate = (value?: string) => (value ? new Date(value).toISOString().split('T')[0] : '');

export function mapOrder(o: any): Order {
  return {
    id: o._id,
    orderNumber: o.orderNumber,
    date: formatDate(o.createdAt),
    status: ORDER_STATUS_MAP[o.status] || 'pending',
    items: (o.items || []).map((item: any) => ({
      productId: String(item.itemType === 'bundle' ? item.bundle?._id || item.bundle : item.product?._id || item.product),
      productNameEn: item.nameEn,
      productNameAr: item.nameAr,
      price: item.unitPrice,
      quantity: item.quantity,
      image: resolveImage(item.image),
      selectedSize: item.size || ''
    })),
    shippingAddress: mapAddress({ ...o.shippingAddress, isDefault: false }),
    paymentMethod: o.paymentMethod,
    couponApplied: o.coupon?.code,
    subtotal: o.subtotal,
    discount: o.discount,
    shippingFee: (o.shippingFee || 0) + (o.codFee || 0),
    total: o.total,
    trackingNumber: o.trackingNumber || '—',
    estimatedDelivery: formatDate(o.estimatedDelivery)
  };
}

export function mapReview(r: any): Review {
  return {
    id: r._id,
    author: r.authorName,
    avatar: r.avatar || undefined,
    rating: r.rating,
    date: formatDate(r.createdAt),
    commentEn: r.commentEn,
    commentAr: r.commentAr,
    productNameEn: r.product?.nameEn || '',
    productNameAr: r.product?.nameAr || '',
    verified: Boolean(r.verified),
    helpfulCount: r.helpfulCount || 0,
    userPhoto: r.photo || undefined
  };
}
