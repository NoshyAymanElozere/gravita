import type { Product, Customer, Order, DashboardStats, RevenueData } from '@/types'

// ─── Products ─────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  { id: '1', name: 'Premium Widget Pro', sku: 'WGT-001', category: 'Electronics', price: 299.99, cost: 120, stock: 145, minStock: 20, unit: 'pcs', status: 'active', createdAt: '2026-01-10', updatedAt: '2026-04-20' },
  { id: '2', name: 'Standard Connector X', sku: 'CON-002', category: 'Hardware', price: 49.99, cost: 18, stock: 8, minStock: 15, unit: 'pcs', status: 'active', createdAt: '2026-01-15', updatedAt: '2026-05-01' },
  { id: '3', name: 'Industrial Bolt Set', sku: 'BLT-003', category: 'Hardware', price: 14.99, cost: 5, stock: 520, minStock: 50, unit: 'set', status: 'active', createdAt: '2026-02-01', updatedAt: '2026-04-28' },
  { id: '4', name: 'Display Module HD', sku: 'DIS-004', category: 'Electronics', price: 189.99, cost: 75, stock: 0, minStock: 10, unit: 'pcs', status: 'out_of_stock', createdAt: '2026-02-10', updatedAt: '2026-05-05' },
  { id: '5', name: 'Thermal Paste TG-7', sku: 'THM-005', category: 'Components', price: 9.99, cost: 3, stock: 230, minStock: 30, unit: 'tube', status: 'active', createdAt: '2026-02-20', updatedAt: '2026-04-15' },
  { id: '6', name: 'Power Supply 650W', sku: 'PSU-006', category: 'Electronics', price: 119.99, cost: 55, stock: 42, minStock: 10, unit: 'pcs', status: 'active', createdAt: '2026-03-01', updatedAt: '2026-05-08' },
  { id: '7', name: 'Heat Sink Aluminum', sku: 'HSK-007', category: 'Components', price: 24.99, cost: 9, stock: 3, minStock: 20, unit: 'pcs', status: 'active', createdAt: '2026-03-10', updatedAt: '2026-05-10' },
  { id: '8', name: 'USB-C Hub 7-in-1', sku: 'USB-008', category: 'Electronics', price: 59.99, cost: 22, stock: 88, minStock: 15, unit: 'pcs', status: 'active', createdAt: '2026-03-20', updatedAt: '2026-05-02' },
  { id: '9', name: 'Cable Management Kit', sku: 'CBL-009', category: 'Accessories', price: 19.99, cost: 7, stock: 175, minStock: 25, unit: 'kit', status: 'inactive', createdAt: '2026-04-01', updatedAt: '2026-04-30' },
  { id: '10', name: 'SSD 1TB NVMe', sku: 'SSD-010', category: 'Storage', price: 129.99, cost: 60, stock: 56, minStock: 10, unit: 'pcs', status: 'active', createdAt: '2026-04-05', updatedAt: '2026-05-11' },
  { id: '11', name: 'RAM DDR5 32GB', sku: 'RAM-011', category: 'Memory', price: 159.99, cost: 70, stock: 34, minStock: 8, unit: 'pcs', status: 'active', createdAt: '2026-04-10', updatedAt: '2026-05-09' },
  { id: '12', name: 'PCIe Riser Cable', sku: 'PCE-012', category: 'Hardware', price: 39.99, cost: 14, stock: 12, minStock: 20, unit: 'pcs', status: 'active', createdAt: '2026-04-15', updatedAt: '2026-05-07' },
]

// ─── Customers ────────────────────────────────────────────────────────────────

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', phone: '+1-555-0101', type: 'company', status: 'vip', company: 'Acme Corp', city: 'New York', country: 'US', totalOrders: 48, totalSpent: 142500, createdAt: '2025-06-15' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1-555-0102', type: 'individual', status: 'active', city: 'Los Angeles', country: 'US', totalOrders: 12, totalSpent: 3840, createdAt: '2025-08-20' },
  { id: '3', name: 'TechBridge LLC', email: 'procurement@techbridge.io', phone: '+1-555-0103', type: 'company', status: 'active', company: 'TechBridge LLC', city: 'Austin', country: 'US', totalOrders: 29, totalSpent: 87200, createdAt: '2025-09-10' },
  { id: '4', name: 'Michael Chen', email: 'm.chen@company.com', phone: '+1-555-0104', type: 'individual', status: 'active', city: 'San Francisco', country: 'US', totalOrders: 7, totalSpent: 1925, createdAt: '2025-10-05' },
  { id: '5', name: 'Global Industries', email: 'orders@globalindustries.net', phone: '+1-555-0105', type: 'company', status: 'vip', company: 'Global Industries', city: 'Chicago', country: 'US', totalOrders: 73, totalSpent: 234800, createdAt: '2025-03-22' },
  { id: '6', name: 'Emily Rodriguez', email: 'emily.r@gmail.com', phone: '+1-555-0106', type: 'individual', status: 'inactive', city: 'Miami', country: 'US', totalOrders: 3, totalSpent: 445, createdAt: '2026-01-18' },
  { id: '7', name: 'DataSync Systems', email: 'purchasing@datasync.com', phone: '+1-555-0107', type: 'company', status: 'active', company: 'DataSync Systems', city: 'Seattle', country: 'US', totalOrders: 22, totalSpent: 62300, createdAt: '2025-11-30' },
  { id: '8', name: 'James Wilson', email: 'jwilson@contractor.com', phone: '+1-555-0108', type: 'individual', status: 'active', city: 'Denver', country: 'US', totalOrders: 18, totalSpent: 5640, createdAt: '2025-12-12' },
]

// ─── Orders ───────────────────────────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    id: '1', orderNumber: 'ORD-2026-1042', customerId: '1', customerName: 'Acme Corporation', customerEmail: 'billing@acme.com',
    items: [
      { productId: '1', productName: 'Premium Widget Pro', sku: 'WGT-001', quantity: 5, unitPrice: 299.99, total: 1499.95 },
      { productId: '8', productName: 'USB-C Hub 7-in-1', sku: 'USB-008', quantity: 10, unitPrice: 59.99, total: 599.90 },
    ],
    subtotal: 2099.85, tax: 189.99, shipping: 0, total: 2289.84,
    status: 'delivered', paymentStatus: 'paid', createdAt: '2026-05-10', updatedAt: '2026-05-12',
  },
  {
    id: '2', orderNumber: 'ORD-2026-1041', customerId: '3', customerName: 'TechBridge LLC', customerEmail: 'procurement@techbridge.io',
    items: [{ productId: '10', productName: 'SSD 1TB NVMe', sku: 'SSD-010', quantity: 20, unitPrice: 129.99, total: 2599.80 }],
    subtotal: 2599.80, tax: 234, shipping: 25, total: 2858.80,
    status: 'shipped', paymentStatus: 'paid', createdAt: '2026-05-11', updatedAt: '2026-05-12',
  },
  {
    id: '3', orderNumber: 'ORD-2026-1040', customerId: '2', customerName: 'Sarah Johnson', customerEmail: 'sarah.j@email.com',
    items: [{ productId: '6', productName: 'Power Supply 650W', sku: 'PSU-006', quantity: 1, unitPrice: 119.99, total: 119.99 }],
    subtotal: 119.99, tax: 10.80, shipping: 9.99, total: 140.78,
    status: 'processing', paymentStatus: 'paid', createdAt: '2026-05-12', updatedAt: '2026-05-12',
  },
  {
    id: '4', orderNumber: 'ORD-2026-1039', customerId: '5', customerName: 'Global Industries', customerEmail: 'orders@globalindustries.net',
    items: [
      { productId: '11', productName: 'RAM DDR5 32GB', sku: 'RAM-011', quantity: 50, unitPrice: 159.99, total: 7999.50 },
      { productId: '10', productName: 'SSD 1TB NVMe', sku: 'SSD-010', quantity: 50, unitPrice: 129.99, total: 6499.50 },
    ],
    subtotal: 14499, tax: 1305, shipping: 0, total: 15804,
    status: 'pending', paymentStatus: 'unpaid', createdAt: '2026-05-13', updatedAt: '2026-05-13',
  },
  {
    id: '5', orderNumber: 'ORD-2026-1038', customerId: '4', customerName: 'Michael Chen', customerEmail: 'm.chen@company.com',
    items: [{ productId: '5', productName: 'Thermal Paste TG-7', sku: 'THM-005', quantity: 3, unitPrice: 9.99, total: 29.97 }],
    subtotal: 29.97, tax: 2.70, shipping: 4.99, total: 37.66,
    status: 'cancelled', paymentStatus: 'refunded', createdAt: '2026-05-08', updatedAt: '2026-05-09',
  },
  {
    id: '6', orderNumber: 'ORD-2026-1037', customerId: '7', customerName: 'DataSync Systems', customerEmail: 'purchasing@datasync.com',
    items: [{ productId: '1', productName: 'Premium Widget Pro', sku: 'WGT-001', quantity: 8, unitPrice: 299.99, total: 2399.92 }],
    subtotal: 2399.92, tax: 216, shipping: 0, total: 2615.92,
    status: 'delivered', paymentStatus: 'paid', createdAt: '2026-05-07', updatedAt: '2026-05-10',
  },
]

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 284750,
  revenueChange: 12.5,
  totalOrders: 1042,
  ordersChange: 8.2,
  totalCustomers: 856,
  customersChange: 5.7,
  totalProducts: 248,
  lowStockCount: 4,
}

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 38500, expenses: 25000, profit: 13500 },
  { month: 'Mar', revenue: 51000, expenses: 31000, profit: 20000 },
  { month: 'Apr', revenue: 47800, expenses: 29500, profit: 18300 },
  { month: 'May', revenue: 63200, expenses: 35000, profit: 28200 },
  { month: 'Jun', revenue: 58900, expenses: 33000, profit: 25900 },
  { month: 'Jul', revenue: 71400, expenses: 38000, profit: 33400 },
  { month: 'Aug', revenue: 66800, expenses: 36500, profit: 30300 },
  { month: 'Sep', revenue: 74200, expenses: 40000, profit: 34200 },
  { month: 'Oct', revenue: 69500, expenses: 38500, profit: 31000 },
  { month: 'Nov', revenue: 82100, expenses: 43000, profit: 39100 },
  { month: 'Dec', revenue: 91600, expenses: 48000, profit: 43600 },
]

export const mockCategoryData = [
  { name: 'Luxury Packages', value: 42, color: '#3b82f6' },
  { name: 'Beach Resorts', value: 25, color: '#10b981' },
  { name: 'Historical Tours', value: 15, color: '#f59e0b' },
  { name: 'Adventure Safari', value: 11, color: '#8b5cf6' },
  { name: 'City Sightseeing', value: 7, color: '#ef4444' },
]
