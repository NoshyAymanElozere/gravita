import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TouristDestinationTranslation {
  id?: number
  language_id: number
  name: string
  description: string
}

export interface TouristDestination {
  id: number
  city_id: number
  name: string
  description: string
  is_active: boolean
  image_url?: string
  image?: {
    id: number
    file_path: string
    collection_name: string
    mime_type: string
    size: number
  }
  gallery?: Array<{
    id: number
    file_path: string
    collection_name: string
    mime_type: string
    size: number
  }>
  city?: {
    id: number
    country_id: number
    name: string
    is_active: boolean
  }
  translations?: TouristDestinationTranslation[]
}

export function useTouristDestinationsList(page = 1, cityId?: number | string, search = '') {
  return useQuery({
    queryKey: ['tourist-destinations-list', page, cityId, search],
    queryFn: async () => {
      let url = `/admin/tourist-destinations?page=${page}`
      if (cityId) url += `&city_id=${cityId}`
      if (search) url += `&search=${search}`
      const response = await api.get(url)
      return response.data.data
    }
  })
}

export function useAllTouristDestinations() {
  return useQuery({
    queryKey: ['all-tourist-destinations'],
    queryFn: async () => {
      const response = await api.get('/admin/tourist-destinations?per_page=100')
      return response.data.data.data || []
    }
  })
}

export function useTouristDestination(id: number | null) {
  return useQuery({
    queryKey: ['tourist-destination', id],
    queryFn: async () => {
      const response = await api.get(`/admin/tourist-destinations/${id}`)
      return response.data.data as TouristDestination
    },
    enabled: !!id
  })
}

export function useCreateTouristDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/admin/tourist-destinations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-destinations-list'] })
      toast.success(res.message || 'Tourist destination created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create tourist destination.')
    }
  })
}

export function useUpdateTouristDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Must use POST with _method = PUT for multipart updates
      const response = await api.post(`/admin/tourist-destinations/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-destinations-list'] })
      qc.invalidateQueries({ queryKey: ['tourist-destination'] })
      toast.success(res.message || 'Tourist destination updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update tourist destination.')
    }
  })
}

export function useToggleTouristDestinationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/tourist-destinations/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-destinations-list'] })
      toast.success(res.message || 'Status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteTouristDestination() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/tourist-destinations/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-destinations-list'] })
      toast.success(res.message || 'Tourist destination deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete tourist destination.')
    }
  })
}
