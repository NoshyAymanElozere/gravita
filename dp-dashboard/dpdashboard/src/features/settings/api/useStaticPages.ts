import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface StaticPageTranslation {
  id?: number
  language_id: number
  title: string
  content: string
}

export interface StaticPage {
  id: number
  key: string
  title: string
  content: string
  is_active: boolean
  image_url: string | null
  translations?: StaticPageTranslation[]
}

export function useStaticPage(key: string) {
  return useQuery({
    queryKey: ['static-page', key],
    queryFn: async () => {
      const response = await api.get(`/admin/static-pages/${key}`)
      return response.data.data as StaticPage
    },
    enabled: !!key
  })
}

export function useUpdateStaticPage(key: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { is_active: boolean; translations: StaticPageTranslation[] }) => {
      const response = await api.put(`/admin/static-pages/${key}`, payload)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['static-page', key] })
      toast.success(res.message || 'Static page updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update static page.')
    }
  })
}
