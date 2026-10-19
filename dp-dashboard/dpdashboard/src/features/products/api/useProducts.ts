import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/lib/i18n/i18n'
import api from '@/services/axios'
import { cleanParams, toFormData, toPaginated } from '@/services/apiHelpers'
import type { ApiEnvelope, BundleSync, Product, ProductBundleRef } from '@/types/api'
import { statsKeys } from '@/features/dashboard/api/useStats'

export interface ProductFilters {
  page?: number
  limit?: number
  q?: string
  category?: string
  isActive?: string
  inStock?: string
  sort?: string
}

export const productKeys = {
  all: ['products'] as const,
  list: (f: ProductFilters) => ['products', 'list', f] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  options: ['products', 'options'] as const,
}

export function useProductList(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => toPaginated<Product>((await api.get('/admin/products', { params: cleanParams({ ...filters }) })).data),
    placeholderData: keepPreviousData,
  })
}

/** Every product (for the bundle product picker) */
export function useProductOptions() {
  return useQuery({
    queryKey: productKeys.options,
    queryFn: async () => toPaginated<Product>((await api.get('/admin/products', { params: { limit: 100 } })).data).items,
    staleTime: 60_000,
  })
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: async () => (await api.get<ApiEnvelope<{ product: Product; bundles: ProductBundleRef[] }>>(`/admin/products/${id}`)).data.data,
    enabled: !!id,
  })
}

/** Toast the bundle re-pricing / deactivation summary returned after a price or status change */
export function announceBundleSync(sync?: BundleSync) {
  if (!sync) return
  const { repriced = [], deactivated = [] } = sync
  if (repriced.length) toast(i18n.t('products.bundlesRepriced', { list: repriced.join(', ') }), { icon: '🔄', duration: 7000 })
  if (deactivated.length) toast(i18n.t('products.bundlesDeactivated', { list: deactivated.join(', ') }), { icon: '⚠️', duration: 8000 })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: productKeys.all })
  qc.invalidateQueries({ queryKey: ['bundles'] })
  qc.invalidateQueries({ queryKey: statsKeys.all })
}

export type ProductPayload = Record<string, unknown>

/**
 * Create / update a product.
 * - Field updates go as JSON so `discountPrice: null` can clear a sale price
 *   (multipart can only send strings, and the API turns '' into "unchanged").
 * - New image files are sent as multipart (arrays as JSON strings). On update the
 *   images are uploaded in a second request after the JSON update.
 */
export function useSaveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
      image,
      gallery,
      keptGallery,
    }: {
      id?: string
      payload: ProductPayload
      image?: File | null
      gallery?: File[]
      keptGallery: string[]
    }) => {
      const hasFiles = !!image || !!gallery?.length
      let res: ApiEnvelope<Product> & { bundleSync?: BundleSync }

      if (!id) {
        res = hasFiles
          ? (await api.post('/admin/products', toFormData({ ...payload, galleryImages: keptGallery }, { image, galleryImages: gallery }))).data
          : (await api.post('/admin/products', { ...payload, galleryImages: keptGallery })).data
        return res
      }

      res = (await api.put(`/admin/products/${id}`, { ...payload, galleryImages: keptGallery })).data
      if (hasFiles) {
        const upload = (await api.put(`/admin/products/${id}`, toFormData({ galleryImages: keptGallery }, { image, galleryImages: gallery }))).data
        res = { ...upload, bundleSync: res.bundleSync }
      }
      return res
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      announceBundleSync(res.bundleSync)
      invalidateAll(qc)
    },
  })
}

/** Quick activate / deactivate from the list (PUT isActive) */
export function useToggleProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.put<ApiEnvelope<Product> & { bundleSync?: BundleSync }>(`/admin/products/${id}`, { isActive })).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      announceBundleSync(res.bundleSync)
      invalidateAll(qc)
    },
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; stock?: number; adjust?: number }) =>
      (await api.patch<ApiEnvelope<{ _id: string; stock: number; stockStatus: string }>>(`/admin/products/${id}/stock`, body)).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Stock updated')
      invalidateAll(qc)
    },
  })
}

/** DELETE = deactivate (soft); `hard` = permanent delete (409 if the product is in a bundle) */
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, hard }: { id: string; hard?: boolean }) =>
      (await api.delete<ApiEnvelope<null> & { bundleSync?: BundleSync }>(`/admin/products/${id}`, { params: hard ? { hard: 'true' } : undefined })).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Done')
      announceBundleSync(res.bundleSync)
      invalidateAll(qc)
    },
  })
}
