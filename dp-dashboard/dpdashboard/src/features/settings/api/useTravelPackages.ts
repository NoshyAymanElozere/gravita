import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface TravelPackageTranslation {
  id?: number
  language_id: number
  name: string
  description: string
}

export interface TravelPackage {
  id: number
  tourist_destination_id: number
  start_date: string
  end_date: string
  price: number
  custom_price: number | null
  final_price: number
  is_custom_price_used: boolean
  number_of_individuals: number
  is_active: boolean
  name: string
  description: string
  duration: string
  image_url?: string
  image?: {
    id: number
    file_path: string
  }
  gallery?: Array<{
    id: number
    file_path: string
  }>
  tourist_program?: {
    id: number
    tourist_destination_id: number
    price: string | number
    name: string
  }
  tourist_program_id?: number
  ground_handling_services?: Array<{
    id: number
    name: string
    price: number
  }>
  translations?: TravelPackageTranslation[]
}

export function useTravelPackagesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['travel-packages-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/travel-packages?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useTravelPackage(id: number | null) {
  return useQuery({
    queryKey: ['travel-package', id],
    queryFn: async () => {
      const response = await api.get(`/admin/travel-packages/${id}`)
      return response.data.data as TravelPackage
    },
    enabled: !!id
  })
}

export function useCreateTravelPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/admin/travel-packages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travel-packages-list'] })
      toast.success(res.message || 'Travel package created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create travel package.')
    }
  })
}

export function useUpdateTravelPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Use POST with _method = PUT for multipart updates
      const response = await api.post(`/admin/travel-packages/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travel-packages-list'] })
      qc.invalidateQueries({ queryKey: ['travel-package'] })
      toast.success(res.message || 'Travel package updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update travel package.')
    }
  })
}

export function useToggleTravelPackageStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/travel-packages/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travel-packages-list'] })
      toast.success(res.message || 'Status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteTravelPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/travel-packages/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['travel-packages-list'] })
      toast.success(res.message || 'Travel package deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete travel package.')
    }
  })
}
