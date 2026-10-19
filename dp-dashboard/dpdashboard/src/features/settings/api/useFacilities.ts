import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface FacilityTranslation {
  id?: number
  language_id: number
  name: string
}

export interface Facility {
  id: number
  name: string
  image_url?: string
  is_active: boolean
  translations?: FacilityTranslation[]
}

export function useFacilitiesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['facilities-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/property-amenities?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/admin/property-amenities', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['facilities-list'] })
      toast.success(res.message || 'Facility created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create facility.')
    }
  })
}

export function useUpdateFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await api.post(`/admin/property-amenities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['facilities-list'] })
      toast.success(res.message || 'Facility updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update facility.')
    }
  })
}

export function useToggleFacilityStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/property-amenities/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['facilities-list'] })
      toast.success(res.message || 'Facility status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/property-amenities/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['facilities-list'] })
      toast.success(res.message || 'Facility deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete facility.')
    }
  })
}
