import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, Review } from '@/types/api'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (p: Record<string, unknown>) => ['reviews', 'list', p] as const,
}

export function useReviewList(params: { page?: number; limit?: number; isApproved?: string; product?: string }) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: async () => toPaginated<Review>((await api.get('/admin/reviews', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

/** Approving / hiding or deleting a review re-computes the product rating on the server */
function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: reviewKeys.all })
  qc.invalidateQueries({ queryKey: ['products'] })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      (await api.patch<ApiEnvelope<Review>>(`/admin/reviews/${id}`, { isApproved })).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      invalidate(qc)
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/reviews/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      invalidate(qc)
    },
  })
}
