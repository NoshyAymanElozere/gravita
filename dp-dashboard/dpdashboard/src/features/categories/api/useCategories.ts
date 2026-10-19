import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toFormData, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Category } from '@/types/api'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (p: { page?: number; limit?: number }) => ['categories', 'list', p] as const,
  options: ['categories', 'options'] as const,
}

export function useCategoryList(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => toPaginated<Category>((await api.get('/admin/categories', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

/** All categories (active + inactive) for selects and filters */
export function useCategoryOptions() {
  return useQuery({
    queryKey: categoryKeys.options,
    queryFn: async () => toPaginated<Category>((await api.get('/admin/categories', { params: { limit: 100 } })).data).items,
    staleTime: 5 * 60_000,
  })
}

/** Product counts per category come from the public endpoint (active categories only) */
export function useCategoryProductCounts() {
  return useQuery({
    queryKey: ['categories', 'counts'],
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<Category[]>>('/categories', { params: { limit: 100 }, silent: true })
      return Object.fromEntries((res.data.data ?? []).map((c) => [c._id, c.productCount ?? 0])) as Record<string, number>
    },
  })
}

export interface CategoryPayload {
  slug?: string
  nameEn: string
  nameAr: string
  descriptionEn?: string
  descriptionAr?: string
  sortOrder?: number
  isActive?: boolean
  image?: string
}

function body(payload: CategoryPayload, file?: File | null) {
  return file ? toFormData(payload as unknown as Record<string, unknown>, { image: file }) : payload
}

export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, file }: { id?: string; payload: CategoryPayload; file?: File | null }) => {
      const res = id
        ? await api.put<ApiEnvelope<Category>>(`/admin/categories/${id}`, body(payload, file))
        : await api.post<ApiEnvelope<Category>>('/admin/categories', body(payload, file))
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useToggleCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.put<ApiEnvelope<Category>>(`/admin/categories/${id}`, { isActive })).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    // 409 when the category still has products — the interceptor toasts the backend message
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/categories/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
