import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface CurrencyTranslation {
  id?: number
  language_id: number
  name: string
}

export interface Currency {
  id: number
  name: string
  code: string
  symbol: string
  is_active: boolean
  translations?: CurrencyTranslation[]
}

export function useCurrenciesList(page = 1, search = '') {
  return useQuery({
    queryKey: ['currencies-list', page, search],
    queryFn: async () => {
      const response = await api.get(`/admin/currencies?page=${page}&search=${search}`)
      return response.data.data
    }
  })
}

export function useCreateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Currency>) => {
      const response = await api.post('/admin/currencies', data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['currencies-list'] })
      toast.success(res.message || 'Currency created successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create currency.')
    }
  })
}

export function useUpdateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Currency> }) => {
      const response = await api.put(`/admin/currencies/${id}`, data)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['currencies-list'] })
      toast.success(res.message || 'Currency updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update currency.')
    }
  })
}

export function useToggleCurrencyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/currencies/${id}/toggle`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['currencies-list'] })
      toast.success(res.message || 'Currency status updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to toggle status.')
    }
  })
}

export function useDeleteCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/currencies/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['currencies-list'] })
      toast.success(res.message || 'Currency deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete currency.')
    }
  })
}
