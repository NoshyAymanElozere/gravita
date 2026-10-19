// ─── Common ──────────────────────────────────────────────────────────────────

export type ID = string | number

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export type SortOrder = 'asc' | 'desc'

export interface TableParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: ID
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  avatar?: string
  department?: string
  createdAt: string
}

// ─── Product / Inventory ─────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock'

export interface Product {
  id: ID
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  status: ProductStatus
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  status: ProductStatus
  description?: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerType = 'individual' | 'company'
export type CustomerStatus = 'active' | 'inactive' | 'vip'

export interface Customer {
  id: ID
  name: string
  email: string
  phone: string
  type: CustomerType
  status: CustomerStatus
  company?: string
  address?: string
  city?: string
  country?: string
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  type: CustomerType
  status: CustomerStatus
  company?: string
  address?: string
  city?: string
  country?: string
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial'

export interface OrderItem {
  productId: ID
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Order {
  id: ID
  orderNumber: string
  customerId: ID
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalCustomers: number
  customersChange: number
  totalProducts: number
  lowStockCount: number
}

export interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: ID
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}
