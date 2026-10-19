import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface CountryTranslation {
  id?: number
  language_id: number
  name: string
}

export interface Country {
  id: number
  code: string
  name: string
  is_active: boolean
  image_url?: string
  translations?: CountryTranslation[]
}

export function useCountriesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['countries-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/countries?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useAllCountries() {
  return useQuery({
    queryKey: ['all-countries'],
    queryFn: async () => {
      const response = await api.get('/admin/countries?per_page=1000')
      return response.data.data.data as Country[]
    }
  })
}

export function useCountry(id: number | null) {
  return useQuery({
    queryKey: ['country', id],
    queryFn: async () => {
      const response = await api.get(`/admin/countries/${id}`)
      return response.data.data as Country
    },
    enabled: !!id
  })
}

export function useCreateCountry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/admin/countries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['countries-list'] })
      qc.invalidateQueries({ queryKey: ['all-countries'] })
      toast.success(res.message || 'Country created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create country.')
    }
  })
}

export function useUpdateCountry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await api.post(`/admin/countries/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['countries-list'] })
      qc.invalidateQueries({ queryKey: ['all-countries'] })
      qc.invalidateQueries({ queryKey: ['country'] })
      toast.success(res.message || 'Country updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update country.')
    }
  })
}

export function useToggleCountryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/countries/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['countries-list'] })
      qc.invalidateQueries({ queryKey: ['all-countries'] })
      toast.success(res.message || 'Country status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle country status.')
    }
  })
}

export function useDeleteCountry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/countries/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['countries-list'] })
      qc.invalidateQueries({ queryKey: ['all-countries'] })
      toast.success(res.message || 'Country deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete country.')
    }
  })
}
