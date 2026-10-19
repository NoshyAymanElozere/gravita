import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TravelerTypeTranslation {
  id?: number
  language_id: number
  name: string
}

export interface TravelerType {
  id: number
  name: string
  is_active: boolean
  translations?: TravelerTypeTranslation[]
}

export function useTravelerTypesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['travelertypes-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/traveler-types?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateTravelerType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<TravelerType>) => {
      const response = await api.post('/admin/traveler-types', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travelertypes-list'] })
      toast.success(res.message || 'Traveler type created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create traveler type.')
    }
  })
}

export function useUpdateTravelerType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TravelerType> }) => {
      const response = await api.put(`/admin/traveler-types/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travelertypes-list'] })
      toast.success(res.message || 'Traveler type updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update traveler type.')
    }
  })
}

export function useToggleTravelerTypeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/traveler-types/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travelertypes-list'] })
      toast.success(res.message || 'Traveler type status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle traveler type status.')
    }
  })
}

export function useDeleteTravelerType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/traveler-types/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travelertypes-list'] })
      toast.success(res.message || 'Traveler type deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete traveler type.')
    }
  })
}
