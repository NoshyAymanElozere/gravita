import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface HotelRatingTranslation {
  id?: number
  language_id: number
  name: string
}

export interface HotelRating {
  id: number
  name: string
  is_active: boolean
  translations?: HotelRatingTranslation[]
}

export function useHotelRatingsList(page = 1, search = '') {
  return useQuery({
    queryKey: ['ratings-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/hotel-ratings?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateHotelRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<HotelRating>) => {
      const response = await api.post('/admin/hotel-ratings', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['ratings-list'] })
      toast.success(res.message || 'Rating created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create rating.')
    }
  })
}

export function useUpdateHotelRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HotelRating> }) => {
      const response = await api.put(`/admin/hotel-ratings/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['ratings-list'] })
      toast.success(res.message || 'Rating updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update rating.')
    }
  })
}

export function useToggleHotelRatingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/hotel-ratings/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['ratings-list'] })
      toast.success(res.message || 'Rating status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteHotelRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/hotel-ratings/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['ratings-list'] })
      toast.success(res.message || 'Rating deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete rating.')
    }
  })
}
