import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface GlobalSetting {
  key: string
  value: string
}

export function useGlobalSettings() {
  return useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings')
      const list: GlobalSetting[] = response.data.data?.data || []
      // Convert array to key→value map for easy access
      return list.reduce<Record<string, string>>((acc, s) => {
        acc[s.key] = s.value
        return acc
      }, {})
    }
  })
}

export function useUpdateGlobalSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const response = await api.post('/admin/settings', { settings })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['global-settings'] })
      toast.success(res.message || 'Settings updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update settings.')
    }
  })
}
