import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import { PROFILE_KEY } from '@/features/auth/api/useAuth'
import { LANG_AR, LANG_EN, setStoredCompany } from '@/features/auth/lib/authStorage'
import type { ApiEnvelope, Company } from '@/features/auth/types/auth.types'
import type { ChangePasswordPayload, CompanyProfile, UpdateProfilePayload } from '../types/profile.types'

export const COMPANY_PROFILE_KEY = ['company-profile-details'] as const

type RawProfile = Omit<CompanyProfile, 'translations' | 'categories'> & {
  translations?: CompanyProfile['translations']
  categories?: CompanyProfile['categories']
}

const fetchProfile = async (lang: 'en' | 'ar') =>
  (await api.get<ApiEnvelope<RawProfile>>('/company/profile', { headers: { 'Accept-Language': lang } })).data.data!

/**
 * The profile endpoint localizes name/description/address by `Accept-Language` and
 * doesn't return a `translations` array, so both languages are fetched and merged
 * to let the form edit EN and AR side by side.
 */
export function useCompanyProfile() {
  return useQuery<CompanyProfile>({
    queryKey: COMPANY_PROFILE_KEY,
    queryFn: async () => {
      const [en, ar] = await Promise.all([fetchProfile('en'), fetchProfile('ar')])
      const translations = en.translations?.length
        ? en.translations
        : [
            { language_id: LANG_EN, name: en.name, description: en.description, address: en.address },
            { language_id: LANG_AR, name: ar.name, description: ar.description, address: ar.address },
          ]
      return { ...ar, categories: ar.categories ?? [], translations }
    },
  })
}

function toFormData(payload: UpdateProfilePayload) {
  const fd = new FormData()
  // Empty strings are sent on purpose so clearing an optional field works (Laravel turns them into null)
  fd.append('phone', payload.phone)
  fd.append('website_url', payload.website_url)
  payload.translations.forEach((tr, i) => {
    fd.append(`translations[${i}][language_id]`, String(tr.language_id))
    fd.append(`translations[${i}][name]`, tr.name)
    fd.append(`translations[${i}][description]`, tr.description)
    fd.append(`translations[${i}][address]`, tr.address)
  })
  if (payload.logo) fd.append('logo', payload.logo)
  return fd
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) =>
      (
        await api.post<ApiEnvelope<RawProfile>>('/company/profile', toFormData(payload), {
          // Explicit, otherwise the instance's JSON default makes axios serialize the FormData to JSON
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      ).data,
    onSuccess: (res) => {
      // Keep the header/sidebar identity (name, logo) in sync with the saved profile
      const updated = res.data
      const current = queryClient.getQueryData<Company | null>(PROFILE_KEY)
      if (updated && current) {
        const next = { ...current, ...updated } as Company
        setStoredCompany(next)
        queryClient.setQueryData(PROFILE_KEY, next)
      }
      queryClient.invalidateQueries({ queryKey: COMPANY_PROFILE_KEY })
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
    },
  })
}

export function useChangeCompanyPassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) =>
      (await api.put<ApiEnvelope>('/company/profile/password', payload)).data,
  })
}
