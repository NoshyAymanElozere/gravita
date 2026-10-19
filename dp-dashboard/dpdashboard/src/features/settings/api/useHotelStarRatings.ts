import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface HotelStarRatingTranslation {
  id?: number
  language_id: number
  name: string
}

export interface HotelStarRating {
  id: number
  name: string
  is_active: boolean
  translations?: HotelStarRatingTranslation[]
}

export function useHotelStarRatingsList(page = 1, search = '') {
  return useQuery({
    queryKey: ['hotelcategories-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/hotel-star-ratings?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateHotelStarRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<HotelStarRating>) => {
      const response = await api.post('/admin/hotel-star-ratings', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['hotelcategories-list'] })
      toast.success(res.message || 'Hotel category created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create hotel category.')
    }
  })
}

export function useUpdateHotelStarRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HotelStarRating> }) => {
      const response = await api.put(`/admin/hotel-star-ratings/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['hotelcategories-list'] })
      toast.success(res.message || 'Hotel category updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update hotel category.')
    }
  })
}

export function useToggleHotelStarRatingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/hotel-star-ratings/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['hotelcategories-list'] })
      toast.success(res.message || 'Hotel category status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteHotelStarRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/hotel-star-ratings/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['hotelcategories-list'] })
      toast.success(res.message || 'Hotel category deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete hotel category.')
    }
  })
}
