import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toFormData, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Bundle } from '@/types/api'
import { statsKeys } from '@/features/dashboard/api/useStats'

export const bundleKeys = {
  all: ['bundles'] as const,
  list: (p: { page?: number; limit?: number }) => ['bundles', 'list', p] as const,
  detail: (id: string) => ['bundles', 'detail', id] as const,
}

type BundleResponse = ApiEnvelope<Bundle> & { warning?: string }

function announce(res: BundleResponse) {
  toast.success(res.message || 'Saved')
  // e.g. "bundle price is not lower than the products' current sale prices"
  if (res.warning) toast(res.warning, { icon: '⚠️', duration: 9000 })
}

export function useBundleList(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: bundleKeys.list(params),
    queryFn: async () => toPaginated<Bundle>((await api.get('/admin/bundles', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

export function useBundle(id?: string) {
  return useQuery({
    queryKey: bundleKeys.detail(id ?? ''),
    queryFn: async () => (await api.get<ApiEnvelope<Bundle>>(`/admin/bundles/${id}`)).data.data,
    enabled: !!id,
  })
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: bundleKeys.all })
  qc.invalidateQueries({ queryKey: ['products'] })
  qc.invalidateQueries({ queryKey: statsKeys.all })
}

export function useSaveBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, file }: { id?: string; payload: Record<string, unknown>; file?: File | null }) => {
      const body = file ? toFormData(payload, { image: file }) : payload
      const res = id ? await api.put<BundleResponse>(`/admin/bundles/${id}`, body) : await api.post<BundleResponse>('/admin/bundles', body)
      return res.data
    },
    onSuccess: (res) => {
      announce(res)
      invalidate(qc)
    },
  })
}

export function useToggleBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => (await api.put<BundleResponse>(`/admin/bundles/${id}`, { isActive })).data,
    onSuccess: (res) => {
      announce(res)
      invalidate(qc)
    },
  })
}

export function useRecalculateBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.patch<BundleResponse>(`/admin/bundles/${id}/recalculate`)).data,
    onSuccess: (res) => {
      announce(res)
      invalidate(qc)
    },
  })
}

export function useDeleteBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/bundles/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      invalidate(qc)
    },
  })
}
