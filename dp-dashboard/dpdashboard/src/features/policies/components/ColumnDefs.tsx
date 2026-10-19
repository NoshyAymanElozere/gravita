import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ColDef } from 'ag-grid-community'
import { Eye, Download } from 'lucide-react'
import type { CompanyIssuedPolicy } from '../api/useCompanyPolicies'

interface ColumnDefsProps {
  t: (key: string) => string
  onViewClick: (item: CompanyIssuedPolicy) => void
  onDownloadClick: (item: CompanyIssuedPolicy) => void
}

export function getCompanyPolicyColumnDefs({
  t,
  onViewClick,
  onDownloadClick
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('policyNumber') || 'رقم الوثيقة',
      field: 'company_policy_no',
      filter: false,
      minWidth: 180,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex flex-col py-1">
            <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100">
              {item.company_policy_no}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              المنصة: {item.platform_no}
            </span>
          </div>
        )
      }
    },
    {
      headerName: t('customerName') || 'المؤمن له',
      field: 'customer_name',
      filter: false,
      minWidth: 180,
      flex: 1.2,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-xs text-gray-900 dark:text-zinc-100">
              {item.customer_name}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              هوية: {item.national_id}
            </span>
          </div>
        )
      }
    },
    {
      headerName: 'نوع التغطية والأصل',
      field: 'product_name',
      filter: false,
      minWidth: 200,
      flex: 1.2,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-xs text-main">
              {item.product_name}
            </span>
            <span className="text-[11px] text-gray-500 truncate">
              {item.asset_details}
            </span>
          </div>
        )
      }
    },
    {
      headerName: t('netPremium') || 'صافي القسط للشركة',
      field: 'net_premium',
      filter: false,
      width: 160,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex flex-col py-1 text-left font-mono">
            <span className="font-bold text-xs text-emerald-600">
              {item.net_premium.toLocaleString()} ر.س
            </span>
            <span className="text-[10px] text-gray-400">
              المدفوع: {item.total_paid_by_customer.toLocaleString()} ر.س
            </span>
          </div>
        )
      }
    },
    {
      headerName: 'سريان الوثيقة',
      field: 'start_date',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex flex-col py-1 font-mono text-[11px] text-gray-500">
            <span>من: {item.start_date}</span>
            <span>إلى: {item.end_date}</span>
          </div>
        )
      }
    },
    {
      headerName: t('status') || 'الحالة',
      field: 'status',
      filter: false,
      width: 110,
      cellRenderer: (params: any) => {
        const status = params.value as CompanyIssuedPolicy['status']
        if (status === 'active') {
          return (
            <div className="flex items-center h-full">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                سارية
              </Badge>
            </div>
          )
        }
        return (
          <div className="flex items-center h-full">
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              منتهية
            </Badge>
          </div>
        )
      }
    },
    {
      headerName: t('actions') || 'العمليات',
      filter: false,
      sortable: false,
      width: 100,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data as CompanyIssuedPolicy
        if (!item) return null
        return (
          <div className="flex items-center justify-start gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onViewClick(item)}>
              <Eye className="h-4 w-4 text-gray-500 hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onDownloadClick(item)}>
              <Download className="h-4 w-4 text-gray-500 hover:text-emerald-600" />
            </Button>
          </div>
        )
      }
    }
  ]
}
