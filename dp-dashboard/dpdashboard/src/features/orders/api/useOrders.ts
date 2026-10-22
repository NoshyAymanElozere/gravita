import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Order, OrderStatus } from '@/types/api'
import { statsKeys } from '@/features/dashboard/api/useStats'

export interface OrderFilters {
  page?: number
  limit?: number
  q?: string
  status?: string
  from?: string
  to?: string
}

export const orderKeys = {
  all: ['orders'] as const,
  list: (f: OrderFilters) => ['orders', 'list', f] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

/** `to` is a date (yyyy-MM-dd); include the whole day */
function toEndOfDay(date?: string) {
  if (!date) return undefined
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T23:59:59.999Z` : date
}

export function useOrderList(filters: OrderFilters, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<{ orders: Order[] }>>('/admin/orders', {
        params: cleanParams({ ...filters, to: toEndOfDay(filters.to) }),
      })
      return toPaginated<Order>(res.data, 'orders')
    },
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: async () =>
      (await api.get<ApiEnvelope<{ order: Order; allowedTransitions: OrderStatus[] }>>(`/admin/orders/${id}`)).data.data,
    enabled: !!id,
  })
}

/** Confirm a bank transfer landed (or correct a payment state) */
export function useUpdatePaymentStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'; paymentRef?: string }) =>
      (await api.patch<ApiEnvelope<{ order: Order }>>(`/admin/orders/${id}/payment`, cleanParams(payload))).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Payment updated')
      qc.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { status: OrderStatus; note?: string; trackingNumber?: string; estimatedDelivery?: string }) =>
      (await api.put<ApiEnvelope<{ order: Order }>>(`/admin/orders/${id}/status`, cleanParams(payload))).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Order updated')
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: statsKeys.all })
      // cancelling restocks products
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
