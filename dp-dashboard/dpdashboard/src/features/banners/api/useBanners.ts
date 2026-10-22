import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toFormData, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Banner } from '@/types/api'

export const bannerKeys = {
  all: ['banners'] as const,
  list: (p: { page?: number; limit?: number }) => ['banners', 'list', p] as const,
}

export function useBannerList(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: bannerKeys.list(params),
    queryFn: async () => toPaginated<Banner>((await api.get('/admin/banners', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

export interface BannerPayload {
  titleEn?: string
  titleAr?: string
  link?: string
  sortOrder?: number
  isActive?: boolean
  image?: string
}

function body(payload: BannerPayload, file?: File | null) {
  return file ? toFormData(payload as unknown as Record<string, unknown>, { image: file }) : payload
}

export function useSaveBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, file }: { id?: string; payload: BannerPayload; file?: File | null }) => {
      const res = id
        ? await api.put<ApiEnvelope<Banner>>(`/admin/banners/${id}`, body(payload, file))
        : await api.post<ApiEnvelope<Banner>>('/admin/banners', body(payload, file))
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}

export function useToggleBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.put<ApiEnvelope<Banner>>(`/admin/banners/${id}`, { isActive })).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}

export function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/banners/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      qc.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}
