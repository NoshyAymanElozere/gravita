import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface SupportMessage {
  id: number
  user_id: number | null
  name: string
  phone: string
  email: string
  subject: string
  message?: string
  status: 'unread' | 'read'
  read_at: string | null
  created_at: string
}

export function useSupportMessagesList(page = 1, search = '', status = '') {
  return useQuery({
    queryKey: ['support-messages-list', page, search, status],
    queryFn: async () => {
      let url = `/admin/support-messages?page=${page}`
      if (search) url += `&search=${search}`
      if (status) url += `&status=${status}`
      const response = await api.get(url)
      return response.data.data
    }
  })
}

export function useSupportMessageDetails(id: number | null) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['support-message', id],
    queryFn: async () => {
      const response = await api.get(`/admin/support-messages/${id}`)
      // Invalidate list since viewing a message marks it as read on the backend
      qc.invalidateQueries({ queryKey: ['support-messages-list'] })
      return response.data.data as SupportMessage
    },
    enabled: !!id
  })
}

export function useMarkSupportMessageRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/support-messages/${id}/mark-read`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['support-messages-list'] })
      qc.invalidateQueries({ queryKey: ['support-message'] })
      toast.success(res.message || 'Message marked as read.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to mark message as read.')
    }
  })
}

export function useDeleteSupportMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/support-messages/${id}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['support-messages-list'] })
      toast.success(res.message || 'Message deleted successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete message.')
    }
  })
}
