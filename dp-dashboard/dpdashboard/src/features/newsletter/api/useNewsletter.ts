import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import { cleanParams, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, NewsletterSubscriber } from '@/types/api'

// ─── Newsletter ──────────────────────────────────────────────────────────────

export function useSubscriberList(params: { page?: number; limit?: number; isActive?: string }) {
  return useQuery({
    queryKey: ['newsletter', params],
    queryFn: async () => toPaginated<NewsletterSubscriber>((await api.get('/admin/newsletter', { params: cleanParams(params) })).data),
    placeholderData: keepPreviousData,
  })
}

export function useDeleteSubscriber() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiEnvelope<null>>(`/admin/newsletter/${id}`)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Deleted')
      qc.invalidateQueries({ queryKey: ['newsletter'] })
    },
  })
}

/** Every subscriber matching the filter (pages of 100) — for the CSV export */
export async function fetchAllSubscribers(isActive?: string): Promise<NewsletterSubscriber[]> {
  const out: NewsletterSubscriber[] = []
  let page = 1
  for (;;) {
    const res = toPaginated<NewsletterSubscriber>((await api.get('/admin/newsletter', { params: cleanParams({ page, limit: 100, isActive }) })).data)
    out.push(...res.items)
    if (!res.pagination.hasNextPage || page >= 200) break
    page++
  }
  return out
}
