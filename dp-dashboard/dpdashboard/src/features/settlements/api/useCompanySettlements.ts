import { useQuery } from '@tanstack/react-query'

export interface CompanySettlementItem {
  id: string
  settlement_period: string
  policies_sold: number
  gross_sales: number
  platform_commission: number
  net_received: number
  status: 'transferred' | 'processing'
  transfer_reference?: string
  payment_date?: string
}

const INITIAL_COMPANY_SETTLEMENTS: CompanySettlementItem[] = [
  {
    id: 'c-set-1',
    settlement_period: 'سبتمبر 2026',
    policies_sold: 340,
    gross_sales: 428000.0,
    platform_commission: 53500.0,
    net_received: 374500.0,
    status: 'transferred',
    transfer_reference: 'TR-SAR-99881203',
    payment_date: '2026-09-30'
  },
  {
    id: 'c-set-2',
    settlement_period: 'أغسطس 2026',
    policies_sold: 310,
    gross_sales: 390000.0,
    platform_commission: 48750.0,
    net_received: 341250.0,
    status: 'transferred',
    transfer_reference: 'TR-SAR-88771122',
    payment_date: '2026-08-31'
  }
]

export function useCompanySettlementList() {
  return useQuery({
    queryKey: ['company-settlements'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return [...INITIAL_COMPANY_SETTLEMENTS]
    }
  })
}
