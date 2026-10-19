import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import type { ApiEnvelope } from '@/features/auth/types/auth.types'
import type {
  InboxFilters,
  InboxRequest,
  Offer,
  OfferFilters,
  OfferPayload,
  Paginated,
  RequestDetail,
} from '../types/vehicleInsurance.types'

const REQUESTS = '/company/vehicle-insurance-requests'
const OFFERS = '/company/vehicle-insurance-offers'

export const vehicleKeys = {
  all: ['vehicle-insurance'] as const,
  inbox: (f: InboxFilters) => [...vehicleKeys.all, 'inbox', f] as const,
  request: (id: string | number) => [...vehicleKeys.all, 'request', String(id)] as const,
  offers: (f: OfferFilters) => [...vehicleKeys.all, 'offers', f] as const,
  offer: (id: string | number) => [...vehicleKeys.all, 'offer', String(id)] as const,
}

type ListEnvelope<T> = ApiEnvelope<T[]> & Pick<Paginated<T>, 'meta'>

/** Drops empty filters so the API doesn't receive `status=` and similar */
const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))

// ─── Requests ────────────────────────────────────────────────────────────────

export function useInboxRequests(filters: InboxFilters) {
  return useQuery<Paginated<InboxRequest>>({
    queryKey: vehicleKeys.inbox(filters),
    queryFn: async () => {
      const res = (await api.get<ListEnvelope<InboxRequest>>(REQUESTS, { params: cleanParams(filters) })).data
      return { data: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

/** Opening a `pending` request marks it `viewed` on the server, so the inbox is refreshed afterwards */
export function useRequestDetail(id: string | undefined) {
  const qc = useQueryClient()
  return useQuery<RequestDetail>({
    queryKey: vehicleKeys.request(id ?? ''),
    enabled: !!id,
    retry: (count, err) => (err as { response?: { status?: number } })?.response?.status !== 404 && count < 2,
    queryFn: async () => {
      const detail = (await api.get<ApiEnvelope<RequestDetail>>(`${REQUESTS}/${id}`)).data.data!
      qc.invalidateQueries({ queryKey: [...vehicleKeys.all, 'inbox'] })
      return detail
    },
  })
}

function useInvalidateAll() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: vehicleKeys.all })
}

export function useSendOffer(requestId: string | number) {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (payload: OfferPayload) =>
      (await api.post<ApiEnvelope<Offer>>(`${REQUESTS}/${requestId}/offers`, payload)).data,
    onSuccess: invalidate,
  })
}

export function useDeclineRequest(requestId: string | number) {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (reason: string) =>
      (await api.patch<ApiEnvelope>(`${REQUESTS}/${requestId}/decline`, { reason: reason.trim() || null })).data,
    onSuccess: invalidate,
  })
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export function useMyOffers(filters: OfferFilters) {
  return useQuery<Paginated<Offer>>({
    queryKey: vehicleKeys.offers(filters),
    queryFn: async () => {
      const res = (await api.get<ListEnvelope<Offer>>(OFFERS, { params: cleanParams(filters) })).data
      return { data: res.data ?? [], meta: res.meta }
    },
    placeholderData: keepPreviousData,
  })
}

export function useOfferDetail(id: string | undefined) {
  return useQuery<Offer>({
    queryKey: vehicleKeys.offer(id ?? ''),
    enabled: !!id,
    retry: (count, err) => (err as { response?: { status?: number } })?.response?.status !== 404 && count < 2,
    queryFn: async () => (await api.get<ApiEnvelope<Offer>>(`${OFFERS}/${id}`)).data.data!,
  })
}

export function useUpdateOffer(offerId: string | number) {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (payload: OfferPayload) =>
      (await api.put<ApiEnvelope<Offer>>(`${OFFERS}/${offerId}`, payload)).data,
    onSuccess: invalidate,
  })
}

export function useWithdrawOffer() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (offerId: number) => (await api.patch<ApiEnvelope<Offer>>(`${OFFERS}/${offerId}/withdraw`)).data,
    onSuccess: invalidate,
  })
}
