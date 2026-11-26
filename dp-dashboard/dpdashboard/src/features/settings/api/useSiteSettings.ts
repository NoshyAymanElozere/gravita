import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/services/axios'
import type { ApiEnvelope } from '@/types/api'

export interface SiteSettings {
  logo: string | null
  updatedAt?: string
}

export const siteSettingsKey = ['site-settings'] as const

/** Public site settings (logo) — also used on the login page, so no auth needed */
export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsKey,
    queryFn: async () => (await api.get<ApiEnvelope<SiteSettings>>('/settings', { silent: true })).data.data,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

export function useUploadLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('logo', file)
      return (await api.put<ApiEnvelope<SiteSettings>>('/admin/settings/logo', form)).data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.setQueryData(siteSettingsKey, res.data)
    },
  })
}

export function useResetLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.delete<ApiEnvelope<SiteSettings>>('/admin/settings/logo')).data,
    onSuccess: (res) => {
      toast.success(res.message || 'Saved')
      qc.setQueryData(siteSettingsKey, res.data)
    },
  })
}
