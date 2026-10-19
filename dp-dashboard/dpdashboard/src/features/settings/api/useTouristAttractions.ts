import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TouristAttractionTranslation {
  id?: number
  language_id: number
  name: string
  description: string
}

export interface TouristAttraction {
  id: number
  tourist_destination_id: number
  price: string | number
  name: string
  description: string
  tourist_destination?: {
    id: number
    city_id: number
    name: string
    description: string
    is_active: boolean
  }
  translations?: TouristAttractionTranslation[]
}

export function useTouristAttractionsList(page = 1, touristDestinationId?: number | string, search = '') {
  return useQuery({
    queryKey: ['tourist-attractions-list', page, touristDestinationId, search],
    queryFn: async () => {
      let url = `/admin/tourist-attractions?page=${page}`
      if (touristDestinationId) url += `&tourist_destination_id=${touristDestinationId}`
      if (search) url += `&search=${search}`
      const response = await api.get(url)
      return response.data.data
    }
  })
}

export function useTouristAttraction(id: number | null) {
  return useQuery({
    queryKey: ['tourist-attraction', id],
    queryFn: async () => {
      const response = await api.get(`/admin/tourist-attractions/${id}`)
      return response.data.data as TouristAttraction
    },
    enabled: !!id
  })
}

export function useCreateTouristAttraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<TouristAttraction>) => {
      const response = await api.post('/admin/tourist-attractions', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-attractions-list'] })
      toast.success(res.message || 'Tourist attraction created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create tourist attraction.')
    }
  })
}

export function useUpdateTouristAttraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TouristAttraction> }) => {
      const response = await api.put(`/admin/tourist-attractions/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-attractions-list'] })
      qc.invalidateQueries({ queryKey: ['tourist-attraction'] })
      toast.success(res.message || 'Tourist attraction updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update tourist attraction.')
    }
  })
}

export function useDeleteTouristAttraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/tourist-attractions/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-attractions-list'] })
      toast.success(res.message || 'Tourist attraction deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete tourist attraction.')
    }
  })
}

export function useAllTouristAttractions(touristDestinationId?: number | string) {
  return useQuery({
    queryKey: ['all-tourist-attractions', touristDestinationId],
    queryFn: async () => {
      if (!touristDestinationId) return []
      const response = await api.get(`/admin/tourist-attractions?per_page=1000&tourist_destination_id=${touristDestinationId}`)
      return response.data.data.data || []
    },
    enabled: !!touristDestinationId
  })
}
