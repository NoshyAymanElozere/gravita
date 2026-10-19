import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Coupon } from '@/types/api'

export const couponKeys = {
  all: ['coupons'] as const,
  list: (p: { page?: number; limit?: number; isActive?: string }) => ['coupons', 'list', p] as const,
}

export function useCouponList(params: { page?: number; limit?: number; isActive?: string }) {
  return useQuery({
    queryKey: couponKeys.list(params),
    queryFn: async () => toPaginated<Coupon>((await api.get('/admin/coupons', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

export type CouponPayload = Partial<Omit<Coupon, '_id' | 'usedCount' | 'createdAt'>>

export function useSaveCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: CouponPayload }) =>
      id
        ? (await api.put<ApiEnvelope<Coupon>>(`/admin/coupons/${id}`, payload)).data
        : (await api.post<ApiEnvelope<Coupon>>('/admin/coupons', payload)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/coupons/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      qc.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}
