import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export interface CompanyAssignedClaim {
  id: string
  claim_number: string
  policy_number: string
  customer_name: string
  phone: string
  accident_date: string
  report_number: string
  report_source: string
  description: string
  claimed_amount: number
  approved_amount?: number
  rejection_reason?: string
  status: 'new' | 'under_review' | 'approved' | 'rejected' | 'disbursed'
  created_at: string
}

const INITIAL_COMPANY_CLAIMS: CompanyAssignedClaim[] = [
  {
    id: 'c-clm-1',
    claim_number: 'CLM-2026-0182',
    policy_number: 'TAW-MOT-88912',
    customer_name: 'محمد العتيبي',
    phone: '+966 50 123 4567',
    accident_date: '2026-09-28',
    report_number: 'NAJM-9921820',
    report_source: 'نجم',
    description: 'صدم خفيف من الخلف - نسبة الخطأ على الطرف الآخر 100%',
    claimed_amount: 3400.0,
    approved_amount: 3400.0,
    status: 'approved',
    created_at: '2026-09-28 18:30'
  },
  {
    id: 'c-clm-2',
    claim_number: 'CLM-2026-0185',
    policy_number: 'TAW-MOT-88910',
    customer_name: 'سعود الفايز',
    phone: '+966 50 887 6655',
    accident_date: '2026-09-29',
    report_number: 'NAJM-8819201',
    report_source: 'نجم',
    description: 'تضرر الصدام الأمامي والأنوار في موقف سيارات',
    claimed_amount: 2100.0,
    status: 'under_review',
    created_at: '2026-09-29 14:10'
  }
]

let claimsStore = [...INITIAL_COMPANY_CLAIMS]

export function useCompanyClaimList() {
  return useQuery({
    queryKey: ['company-assigned-claims'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return [...claimsStore]
    }
  })
}

export function useProcessCompanyClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      approved_amount,
      rejection_reason
    }: {
      id: string
      status: CompanyAssignedClaim['status']
      approved_amount?: number
      rejection_reason?: string
    }) => {
      await new Promise((r) => setTimeout(r, 300))
      claimsStore = claimsStore.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              approved_amount: status === 'approved' || status === 'disbursed' ? approved_amount : undefined,
              rejection_reason: status === 'rejected' ? rejection_reason : undefined
            }
          : c
      )
      return { success: true }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-assigned-claims'] })
      toast.success('تم تسجيل القرار في المطالبة بنجاح')
    },
    onError: () => {
      toast.error('فشل في معالجة المطالبة')
    }
  })
}
