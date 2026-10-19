import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TouristProgramTranslation {
  id?: number
  language_id: number
  name: string
  description?: string
}

export interface TouristProgramStep {
  id?: number
  sort_order: number
  translations: TouristProgramTranslation[]
}

export interface TouristProgram {
  id: number
  tourist_destination_id: number
  price: number | string
  translations: TouristProgramTranslation[]
  steps: TouristProgramStep[]
  tourist_destination?: {
    id: number
    city_id: number
    name: string
    description: string
    is_active: boolean
  }
}

export function useTouristProgramsList(page = 1, search = '', touristDestinationId?: string | number) {
  return useQuery({
    queryKey: ['tourist-programs-list', page, search, touristDestinationId],
    queryFn: async () => {
      let url = `/admin/tourist-programs?page=${page}`
      if (search) url += `&search=${search}`
      if (touristDestinationId) url += `&tourist_destination_id=${touristDestinationId}`
      const response = await api.get(url)
      return response.data.data
    }
  })
}

export function useAllTouristPrograms() {
  return useQuery({
    queryKey: ['all-tourist-programs'],
    queryFn: async () => {
      const response = await api.get('/admin/tourist-programs?per_page=1000')
      return response.data.data.data as TouristProgram[]
    }
  })
}

export function useTouristProgram(id: number | null) {
  return useQuery({
    queryKey: ['tourist-program', id],
    queryFn: async () => {
      const response = await api.get(`/admin/tourist-programs/${id}`)
      return response.data.data as TouristProgram
    },
    enabled: !!id
  })
}

export function useCreateTouristProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<TouristProgram>) => {
      const response = await api.post('/admin/tourist-programs', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-programs-list'] })
      toast.success(res.message || 'Tourist program created successfully.')
    }
  })
}

export function useUpdateTouristProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TouristProgram> }) => {
      const response = await api.put(`/admin/tourist-programs/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-programs-list'] })
      qc.invalidateQueries({ queryKey: ['tourist-program'] })
      toast.success(res.message || 'Tourist program updated successfully.')
    }
  })
}

export function useDeleteTouristProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/tourist-programs/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tourist-programs-list'] })
      toast.success(res.message || 'Tourist program deleted successfully.')
    }
  })
}
