import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export interface CompanyStaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'claims_officer' | 'accountant'
  status: 'active' | 'inactive'
  created_at: string
}

const INITIAL_TEAM: CompanyStaffMember[] = [
  {
    id: 'stf-1',
    name: 'عبدالرحمن الدخيل',
    email: 'a.dakheel@tawuniya.com.sa',
    phone: '+966 50 111 9988',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-10'
  },
  {
    id: 'stf-2',
    name: 'سارة المنصور',
    email: 's.mansoor@tawuniya.com.sa',
    phone: '+966 55 222 8877',
    role: 'claims_officer',
    status: 'active',
    created_at: '2024-02-15'
  },
  {
    id: 'stf-3',
    name: 'ماجد السعيد',
    email: 'm.saeed@tawuniya.com.sa',
    phone: '+966 54 333 7766',
    role: 'accountant',
    status: 'active',
    created_at: '2024-03-01'
  }
]

let teamStore = [...INITIAL_TEAM]

export function useCompanyTeamList() {
  return useQuery({
    queryKey: ['company-team'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return [...teamStore]
    }
  })
}

export function useCreateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<CompanyStaffMember, 'id' | 'created_at'>) => {
      await new Promise((r) => setTimeout(r, 300))
      const created: CompanyStaffMember = {
        ...data,
        id: `stf-${Date.now()}`,
        created_at: new Date().toISOString().split('T')[0]
      }
      teamStore = [created, ...teamStore]
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-team'] })
      toast.success('تمت إضافة عضو الفريق بنجاح')
    },
    onError: () => {
      toast.error('فشل في إضافة العضو')
    }
  })
}

export function useUpdateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyStaffMember> }) => {
      await new Promise((r) => setTimeout(r, 200))
      teamStore = teamStore.map((m) => (m.id === id ? { ...m, ...data } : m))
      return teamStore.find((m) => m.id === id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-team'] })
      toast.success('تم تحديث بيانات العضو بنجاح')
    },
    onError: () => {
      toast.error('فشل تحديث بيانات العضو')
    }
  })
}

export function useDeleteTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 200))
      teamStore = teamStore.filter((m) => m.id !== id)
      return { success: true }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-team'] })
      toast.success('تم حذف عضو الفريق بنجاح')
    },
    onError: () => {
      toast.error('فشل حذف العضو')
    }
  })
}

export function useToggleTeamStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 200))
      teamStore = teamStore.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
      return { success: true }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-team'] })
      toast.success('تم تحديث حالة الحساب بنجاح')
    },
    onError: () => {
      toast.error('فشل تحديث الحالة')
    }
  })
}

