// Shapes returned by gravuta-backend (see gravuta-backend/API_REFERENCE.md)

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiEnvelope<T = unknown> {
  status: 'success' | 'fail' | 'error'
  message?: string
  errors?: unknown[]
  data: T
  pagination?: Pagination
  token?: string
  warning?: string
}

export interface Paginated<T> {
  items: T[]
  pagination: Pagination
}

export type Role = 'user' | 'admin'

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
}

export interface CategoryRef {
  _id: string
  slug: string
  nameEn: string
  nameAr: string
}

export interface Category extends CategoryRef {
  descriptionEn?: string
  descriptionAr?: string
  image?: string
  sortOrder: number
  isActive: boolean
  productCount?: number
  createdAt?: string
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface Product {
  _id: string
  slug: string
  nameEn: string
  nameAr: string
  subtitleEn?: string
  subtitleAr?: string
  descriptionEn?: string
  descriptionAr?: string
  ingredientsEn?: string
  ingredientsAr?: string
  howToUseEn?: string
  howToUseAr?: string
  skinTypeEn?: string
  skinTypeAr?: string
  benefitsEn: string[]
  benefitsAr: string[]
  price: number
  discountPrice: number | null
  finalPrice?: number
  size?: string
  image?: string
  galleryImages: string[]
  category: CategoryRef | string | null
  stock: number
  lowStockThreshold: number
  stockStatus: StockStatus
  isBestSeller: boolean
  isNew: boolean
  soldCount: number
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt?: string
}

export interface ProductBundleRef {
  _id: string
  slug: string
  nameEn: string
  nameAr: string
  isActive: boolean
  bundlePrice: number
}

export interface BundleSync {
  repriced: string[]
  deactivated: string[]
}

export interface BundleItem {
  _id?: string
  product: Product | string | null
  stepEn: string
  stepAr: string
  benefitEn: string
  benefitAr: string
  quantity: number
  order?: number
}

export interface Bundle {
  _id: string
  slug: string
  nameEn: string
  nameAr: string
  subtitleEn?: string
  subtitleAr?: string
  descriptionEn: string
  descriptionAr: string
  image?: string
  items: BundleItem[]
  discountPercentage: number
  originalPrice: number
  bundlePrice: number
  savings?: number
  benefitsEn: string[]
  benefitsAr: string[]
  sortOrder?: number
  isActive: boolean
  available?: boolean
  maxQuantity?: number
  effectiveOriginalPrice?: number
  createdAt?: string
}

export interface Address {
  _id?: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode?: string
  country?: string
  isDefault?: boolean
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type PaymentMethod = 'cod' | 'credit_card' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface BundleSnapshot {
  originalPrice: number
  discountPercentage: number
  items: Array<{ product?: string; nameEn: string; nameAr: string; quantity: number; stepEn?: string; stepAr?: string }>
}

export interface OrderItem {
  _id?: string
  itemType: 'product' | 'bundle'
  product?: { _id: string; slug: string; image?: string; stock?: number } | string | null
  bundle?: { _id: string; slug: string; image?: string } | string | null
  nameEn: string
  nameAr: string
  image?: string
  size?: string
  quantity: number
  unitPrice: number
  lineTotal: number
  bundleSnapshot?: BundleSnapshot
}

export interface StatusHistoryEntry {
  _id?: string
  status: OrderStatus
  at: string
  note?: string
  by?: string
}

export interface Order {
  _id: string
  orderNumber: string
  user: { _id: string; name: string; email: string; phone?: string } | string | null
  items: OrderItem[]
  contact?: { name?: string; email?: string; phone?: string }
  shippingAddress?: Address
  notes?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  coupon?: { code: string; discountType: 'percentage' | 'fixed'; value: number } | null
  subtotal: number
  discount: number
  shippingFee: number
  codFee: number
  total: number
  status: OrderStatus
  statusHistory: StatusHistoryEntry[]
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  cancelReason?: string
  returnReason?: string
  createdAt: string
}

export interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  role: Role
  isActive: boolean
  addresses?: Address[]
  createdAt?: string
}

export interface CustomerStats {
  ordersCount: number
  totalSpent: number
}

export interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  minOrderAmount: number
  maxDiscount: number | null
  expiresAt: string | null
  usageLimit: number | null
  usedCount: number
  perUserLimit: number
  descriptionEn?: string
  descriptionAr?: string
  isActive: boolean
  createdAt?: string
}

export interface Review {
  _id: string
  product: { _id: string; slug: string; nameEn: string; nameAr: string } | string | null
  user: { _id: string; name: string; email: string } | string | null
  authorName: string
  avatar?: string
  rating: number
  comment: string
  lang: 'en' | 'ar'
  commentEn?: string
  commentAr?: string
  photo?: string
  verified: boolean
  helpfulCount: number
  isApproved: boolean
  createdAt: string
}

export interface NewsletterSubscriber {
  _id: string
  email: string
  lang: 'en' | 'ar'
  isActive: boolean
  createdAt: string
}

export interface AdminStats {
  periodDays: number
  revenue: { total: number; orders: number; averageOrderValue: number }
  ordersByStatus: Partial<Record<OrderStatus, number>>
  dailySales: Array<{ date: string; revenue: number; orders: number }>
  topProducts: Array<{ _id: string; slug: string; nameEn: string; nameAr: string; soldCount: number; stock: number; image?: string; stockStatus?: StockStatus }>
  lowStock: Array<{ _id: string; slug: string; nameEn: string; nameAr: string; stock: number; lowStockThreshold: number; stockStatus?: StockStatus }>
  totals: { users: number; products: number; bundles: number }
}
