import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Customer, CustomerStats, Role } from '@/types/api'
import { statsKeys } from '@/features/dashboard/api/useStats'

export interface CustomerFilters {
  page?: number
  limit?: number
  q?: string
  role?: string
  isActive?: string
}

export const customerKeys = {
  all: ['customers'] as const,
  list: (f: CustomerFilters) => ['customers', 'list', f] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
}

export function useCustomerList(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => toPaginated<Customer>((await api.get('/admin/users', { params: cleanParams({ ...filters }) })).data),
    placeholderData: keepPreviousData,
  })
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: async () => (await api.get<ApiEnvelope<{ user: Customer; stats: CustomerStats }>>(`/admin/users/${id}`)).data.data,
    enabled: !!id,
  })
}

export interface CustomerPayload {
  name?: string
  email?: string
  phone?: string
  role?: Role
  isActive?: boolean
  password?: string
}

export function useSaveCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: CustomerPayload }) =>
      id
        ? (await api.put<ApiEnvelope<{ user: Customer }>>(`/admin/users/${id}`, payload)).data
        : (await api.post<ApiEnvelope<{ user: Customer & { id: string } }>>('/admin/users', payload)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: customerKeys.all })
      qc.invalidateQueries({ queryKey: statsKeys.all })
    },
  })
}

/** Users with orders are deactivated instead of deleted — the API message says which happened */
export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/users/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Done', { duration: 6000 })
      qc.invalidateQueries({ queryKey: customerKeys.all })
      qc.invalidateQueries({ queryKey: statsKeys.all })
    },
  })
}
