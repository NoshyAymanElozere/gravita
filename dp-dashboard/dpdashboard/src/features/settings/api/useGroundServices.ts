import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface GroundServiceTranslation {
  id?: number
  language_id: number
  name: string
  description: string
}

export interface GroundService {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  is_active: boolean
  translations?: GroundServiceTranslation[]
}

export function useGroundServicesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['groundservices-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/ground-handling-services?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateGroundService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/admin/ground-handling-services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['groundservices-list'] })
      toast.success(res.message || 'Ground service created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create ground service.')
    }
  })
}

export function useUpdateGroundService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await api.post(`/admin/ground-handling-services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['groundservices-list'] })
      toast.success(res.message || 'Ground service updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update ground service.')
    }
  })
}

export function useToggleGroundServiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/ground-handling-services/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['groundservices-list'] })
      toast.success(res.message || 'Ground service status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteGroundService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/ground-handling-services/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['groundservices-list'] })
      toast.success(res.message || 'Ground service deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete ground service.')
    }
  })
}

export function useAllGroundServices() {
  return useQuery({
    queryKey: ['all-groundservices'],
    queryFn: async () => {
      const response = await api.get('/admin/ground-handling-services?per_page=1000')
      return response.data.data.data || []
    }
  })
}
