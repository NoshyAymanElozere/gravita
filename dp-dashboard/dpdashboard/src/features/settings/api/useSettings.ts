import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export function useSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings')
      const list = response.data.data?.data || response.data.data || []
      const settingsMap = list.reduce((acc: Record<string, string>, item: any) => {
        acc[item.key] = item.value
        return acc
      }, {})
      return settingsMap
    }
  })
}

export interface SettingItem {
  key: string
  value: string
}

export function useSettingsList() {
  return useQuery({
    queryKey: ['system-settings-list'],
    queryFn: async (): Promise<SettingItem[]> => {
      const response = await api.get('/admin/settings')
      const list = response.data.data?.data || response.data.data || []
      return list.map((item: SettingItem) => ({
        key: item.key,
        value: item.value
      }))
    }
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const response = await api.post('/admin/settings', { settings })
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success(res.message || 'Settings updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update settings.')
    }
  })
}

export function useDeleteSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await api.delete(`/admin/settings/${encodeURIComponent(key)}`)
      return response.data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['system-settings-list'] })
      qc.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success(res.message || 'Setting deleted successfully.')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to delete setting.')
    }
  })
}
