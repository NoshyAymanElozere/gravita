import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface CityTranslation {
  id?: number
  language_id: number
  name: string
}

export interface City {
  id: number
  country_id: number
  name: string
  is_active: boolean
  country?: {
    id: number
    code: string
    name: string
    is_active: boolean
  }
  translations?: CityTranslation[]
}

export function useCitiesList(page = 1, countryId?: number | string, search = '') {
  return useQuery({
    queryKey: ['cities-list', page, countryId, search],
    queryFn: async () => {
      let url = `/admin/cities?page=${page}`
      if (countryId) url += `&country_id=${countryId}`
      if (search) url += `&search=${search}`
      const response = await api.get(url)
      return response.data.data
    }
  })
}

export function useAllCities() {
  return useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const response = await api.get('/admin/cities?per_page=1000')
      return response.data.data.data as City[]
    }
  })
}

export function useCity(id: number | null) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: async () => {
      const response = await api.get(`/admin/cities/${id}`)
      return response.data.data as City
    },
    enabled: !!id
  })
}

export function useCreateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<City>) => {
      const response = await api.post('/admin/cities', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cities-list'] })
      toast.success(res.message || 'City created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create city.')
    }
  })
}

export function useUpdateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<City> }) => {
      const response = await api.put(`/admin/cities/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cities-list'] })
      qc.invalidateQueries({ queryKey: ['city'] })
      toast.success(res.message || 'City updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update city.')
    }
  })
}

export function useToggleCityStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/cities/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cities-list'] })
      toast.success(res.message || 'City status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle city status.')
    }
  })
}

export function useDeleteCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/cities/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cities-list'] })
      toast.success(res.message || 'City deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete city.')
    }
  })
}
