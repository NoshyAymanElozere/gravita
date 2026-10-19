import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface PropertyTypeTranslation {
  id?: number
  language_id: number
  name: string
  description: string
}

export interface PropertyType {
  id: number
  name: string
  description: string
  is_active: boolean
  translations?: PropertyTypeTranslation[]
}

export function usePropertyTypesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['propertytypes-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/property-types?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreatePropertyType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<PropertyType>) => {
      const response = await api.post('/admin/property-types', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['propertytypes-list'] })
      toast.success(res.message || 'Property type created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create property type.')
    }
  })
}

export function useUpdatePropertyType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PropertyType> }) => {
      const response = await api.put(`/admin/property-types/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['propertytypes-list'] })
      toast.success(res.message || 'Property type updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update property type.')
    }
  })
}

export function useTogglePropertyTypeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/property-types/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['propertytypes-list'] })
      toast.success(res.message || 'Property type status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeletePropertyType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/property-types/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['propertytypes-list'] })
      toast.success(res.message || 'Property type deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete property type.')
    }
  })
}
