import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TripTypeTranslation {
  id?: number
  language_id: number
  name: string
}

export interface TripType {
  id: number
  name: string
  is_active: boolean
  translations?: TripTypeTranslation[]
}

export function useTripTypesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['triptypes-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/trip-types?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useAllTripTypes() {
  return useQuery({
    queryKey: ['all-triptypes'],
    queryFn: async () => {
      const response = await api.get('/admin/trip-types?per_page=1000')
      return response.data.data.data as TripType[]
    }
  })
}


export function useCreateTripType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<TripType>) => {
      const response = await api.post('/admin/trip-types', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['triptypes-list'] })
      toast.success(res.message || 'Trip type created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create trip type.')
    }
  })
}

export function useUpdateTripType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TripType> }) => {
      const response = await api.put(`/admin/trip-types/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['triptypes-list'] })
      toast.success(res.message || 'Trip type updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update trip type.')
    }
  })
}

export function useToggleTripTypeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/trip-types/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['triptypes-list'] })
      toast.success(res.message || 'Trip type status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle trip type status.')
    }
  })
}

export function useDeleteTripType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/trip-types/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['triptypes-list'] })
      toast.success(res.message || 'Trip type deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete trip type.')
    }
  })
}
