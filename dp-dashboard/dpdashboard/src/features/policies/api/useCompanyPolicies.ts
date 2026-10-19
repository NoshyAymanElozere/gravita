import { useQuery } from '@tanstack/react-query'

export interface CompanyIssuedPolicy {
  id: string
  company_policy_no: string
  platform_no: string
  customer_name: string
  national_id: string
  product_name: string
  coverage_type: 'comprehensive' | 'tpl'
  asset_details: string
  net_premium: number
  total_paid_by_customer: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
}

const INITIAL_COMPANY_POLICIES: CompanyIssuedPolicy[] = [
  {
    id: 'c-pol-1',
    company_policy_no: 'TAW-MOT-88912',
    platform_no: 'WAS-2026-00491',
    customer_name: 'محمد العتيبي',
    national_id: '1098765432',
    product_name: 'تأمين مركبات شامل',
    coverage_type: 'comprehensive',
    asset_details: 'تويوتا كامري 2023 - أ ب ج 1234',
    net_premium: 1106.88,
    total_paid_by_customer: 1265.0,
    start_date: '2026-09-30',
    end_date: '2027-09-29',
    status: 'active'
  },
  {
    id: 'c-pol-2',
    company_policy_no: 'TAW-MOT-88910',
    platform_no: 'WAS-2026-00478',
    customer_name: 'سعود الفايز',
    national_id: '1088776655',
    product_name: 'تأمين مركبات ضد الغير',
    coverage_type: 'tpl',
    asset_details: 'هيونداي إلنترا 2021 - س ع ص 9911',
    net_premium: 748.0,
    total_paid_by_customer: 850.0,
    start_date: '2026-09-18',
    end_date: '2027-09-17',
    status: 'active'
  },
  {
    id: 'c-pol-3',
    company_policy_no: 'TAW-HOM-22910',
    platform_no: 'WAS-2026-00412',
    customer_name: 'فيصل الغامدي',
    national_id: '1055443322',
    product_name: 'تأمين منازل وممتلكات',
    coverage_type: 'comprehensive',
    asset_details: 'فيلا سكنية - حي النرجس، الرياض',
    net_premium: 1400.0,
    total_paid_by_customer: 1600.0,
    start_date: '2025-08-01',
    end_date: '2026-07-31',
    status: 'expired'
  }
]

export function useCompanyPolicyList() {
  return useQuery({
    queryKey: ['company-issued-policies'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return [...INITIAL_COMPANY_POLICIES]
    }
  })
}
