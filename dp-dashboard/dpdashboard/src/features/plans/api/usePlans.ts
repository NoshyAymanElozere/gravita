import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export interface CompanyPlan {
  id: string
  name_ar: string
  name_en: string
  category: string
  coverage_type: 'comprehensive' | 'tpl'
  base_price: number
  deductible: number
  features: string[]
  status: 'active' | 'inactive'
  policies_sold: number
  created_at: string
}

const INITIAL_PLANS: CompanyPlan[] = [
  {
    id: 'pln-1',
    name_ar: 'التأمين الشامل الماسي',
    name_en: 'Diamond Comprehensive Motor',
    category: 'مركبات',
    coverage_type: 'comprehensive',
    base_price: 1250,
    deductible: 500,
    features: ['إصلاح وكالة معتمد', 'سيارة بديلة مجانية 14 يوم', 'مساعدة على الطريق 24/7', 'تغطية دول مجلس التعاون'],
    status: 'active',
    policies_sold: 4820,
    created_at: '2024-01-10'
  },
  {
    id: 'pln-2',
    name_ar: 'تأمين ضد الغير الاقتصادي',
    name_en: 'Third Party Liability (TPL)',
    category: 'مركبات',
    coverage_type: 'tpl',
    base_price: 780,
    deductible: 0,
    features: ['تغطية الطرف الثالث حتى 10 ملايين ريال', 'خدمة سحب ونقل المركبة المعطلة'],
    status: 'active',
    policies_sold: 8430,
    created_at: '2024-01-15'
  },
  {
    id: 'pln-3',
    name_ar: 'تأمين الرعاية الطبية الذهبية',
    name_en: 'Gold Medical Healthcare',
    category: 'طبي',
    coverage_type: 'comprehensive',
    base_price: 3600,
    deductible: 50,
    features: ['شبكة مستشفيات كبرى', 'تغطية أسنان ونظارات وعلاج طبيعي', 'تغطية الأدوية بنسبة 80%'],
    status: 'active',
    policies_sold: 1240,
    created_at: '2024-02-01'
  }
]

let plansStore = [...INITIAL_PLANS]

export function usePlanList() {
  return useQuery({
    queryKey: ['company-plans'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return [...plansStore]
    }
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<CompanyPlan, 'id' | 'created_at' | 'policies_sold'>) => {
      await new Promise((r) => setTimeout(r, 300))
      const created: CompanyPlan = {
        ...data,
        id: `pln-${Date.now()}`,
        policies_sold: 0,
        created_at: new Date().toISOString().split('T')[0]
      }
      plansStore = [created, ...plansStore]
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-plans'] })
      toast.success('تمت إضافة الباقة التأمينية بنجاح')
    },
    onError: () => {
      toast.error('فشل في إضافة الباقة')
    }
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyPlan> }) => {
      await new Promise((r) => setTimeout(r, 300))
      plansStore = plansStore.map((p) => (p.id === id ? { ...p, ...data } : p))
      return plansStore.find((p) => p.id === id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-plans'] })
      toast.success('تم تحديث الباقة بنجاح')
    },
    onError: () => {
      toast.error('فشل تحديث الباقة')
    }
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300))
      plansStore = plansStore.filter((p) => p.id !== id)
      return { success: true }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-plans'] })
      toast.success('تم حذف الباقة بنجاح')
    },
    onError: () => {
      toast.error('فشل حذف الباقة')
    }
  })
}

export function useTogglePlanStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 200))
      plansStore = plansStore.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      )
      return plansStore.find((p) => p.id === id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-plans'] })
      toast.success('تم تغيير حالة الباقة بنجاح')
    },
    onError: () => {
      toast.error('فشل تغيير حالة الباقة')
    }
  })
}

