import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ColDef } from 'ag-grid-community'
import { Eye, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { CompanyAssignedClaim } from '../api/useCompanyClaims'

interface ColumnDefsProps {
  t: (key: string) => string
  onActionClick: (item: CompanyAssignedClaim) => void
}

export function getCompanyClaimColumnDefs({
  t,
  onActionClick
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('claimNumber') || 'رقم المطالبة',
      field: 'claim_number',
      filter: false,
      minWidth: 170,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyAssignedClaim
        if (!item) return null
        return (
          <div className="flex flex-col py-1 font-mono text-xs">
            <span className="font-bold text-gray-900 dark:text-zinc-100">{item.claim_number}</span>
            <span className="text-[10px] text-gray-400">وثيقة: {item.policy_number}</span>
          </div>
        )
      }
    },
    {
      headerName: t('customerName') || 'العميل',
      field: 'customer_name',
      filter: false,
      minWidth: 160,
      flex: 1.2,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyAssignedClaim
        if (!item) return null
        return (
          <div className="flex flex-col py-1 text-xs">
            <span className="font-bold text-gray-900 dark:text-zinc-100">{item.customer_name}</span>
            <span className="text-[11px] text-gray-400 font-mono">{item.phone}</span>
          </div>
        )
      }
    },
    {
      headerName: 'تقرير الحادث',
      field: 'report_number',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyAssignedClaim
        if (!item) return null
        return (
          <div className="flex flex-col py-1 text-xs">
            <span className="font-mono font-bold text-indigo-600">{item.report_number}</span>
            <span className="text-[10px] text-gray-400">{item.report_source} • {item.accident_date}</span>
          </div>
        )
      }
    },
    {
      headerName: 'مبلغ المطالبة / المعتمد',
      field: 'claimed_amount',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyAssignedClaim
        if (!item) return null
        return (
          <div className="flex flex-col py-1 text-left font-mono">
            <span className="font-bold text-xs text-gray-900">{item.claimed_amount.toLocaleString()} ر.س</span>
            {item.approved_amount && (
              <span className="text-[10px] text-emerald-600 font-bold">معتمد: {item.approved_amount.toLocaleString()} ر.س</span>
            )}
          </div>
        )
      }
    },
    {
      headerName: t('status') || 'الحالة',
      field: 'status',
      filter: false,
      width: 130,
      cellRenderer: (params: any) => {
        const status = params.value as CompanyAssignedClaim['status']
        if (status === 'approved' || status === 'disbursed') {
          return (
            <div className="flex items-center h-full">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                <CheckCircle2 className="h-3 w-3" /> معتمدة
              </Badge>
            </div>
          )
        }
        if (status === 'rejected') {
          return (
            <div className="flex items-center h-full">
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
                <XCircle className="h-3 w-3" /> مرفوضة
              </Badge>
            </div>
          )
        }
        return (
          <div className="flex items-center h-full">
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
              <Clock className="h-3 w-3" /> قيد الفحص
            </Badge>
          </div>
        )
      }
    },
    {
      headerName: t('actions') || 'العمليات',
      filter: false,
      sortable: false,
      width: 130,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data as CompanyAssignedClaim
        if (!item) return null
        return (
          <div className="flex items-center justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActionClick(item)}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5" /> فحص واتخاذ قرار
            </Button>
          </div>
        )
      }
    }
  ]
}
