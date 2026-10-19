import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ColDef } from 'ag-grid-community'
import { CheckCircle2, Clock, Download } from 'lucide-react'
import type { CompanySettlementItem } from '../api/useCompanySettlements'

interface ColumnDefsProps {
  t: (key: string) => string
  onDownloadStatementClick: (item: CompanySettlementItem) => void
}

export function getCompanySettlementColumnDefs({
  t,
  onDownloadStatementClick
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('settlementPeriod') || 'دورة التسوية',
      field: 'settlement_period',
      filter: false,
      minWidth: 160,
      cellRenderer: (params: any) => {
        const item = params.data as CompanySettlementItem
        if (!item) return null
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-xs text-gray-900 dark:text-zinc-100">{item.settlement_period}</span>
            <span className="text-[10px] text-gray-400 font-semibold">{item.policies_sold} بوليصة مصدرة</span>
          </div>
        )
      }
    },
    {
      headerName: 'إجمالي المبيعات',
      field: 'gross_sales',
      filter: false,
      width: 160,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono text-xs font-bold text-gray-900">
            {params.value?.toLocaleString()} ر.س
          </div>
        )
      }
    },
    {
      headerName: 'عمولة المنصة المقتطعة',
      field: 'platform_commission',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono text-xs font-semibold text-rose-600">
            -{params.value?.toLocaleString()} ر.س
          </div>
        )
      }
    },
    {
      headerName: 'الصافي المودع في الحساب',
      field: 'net_received',
      filter: false,
      width: 180,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono text-xs font-bold text-emerald-600">
            +{params.value?.toLocaleString()} ر.س
          </div>
        )
      }
    },
    {
      headerName: t('status') || 'الحالة',
      field: 'status',
      filter: false,
      width: 150,
      cellRenderer: (params: any) => {
        const item = params.data as CompanySettlementItem
        if (!item) return null
        if (item.status === 'transferred') {
          return (
            <div className="flex flex-col py-1">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 w-fit">
                <CheckCircle2 className="h-3 w-3" /> تم الإيداع
              </Badge>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">{item.transfer_reference}</span>
            </div>
          )
        }
        return (
          <div className="flex items-center h-full">
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
              <Clock className="h-3 w-3" /> جاري المعالجة
            </Badge>
          </div>
        )
      }
    },
    {
      headerName: t('actions') || 'العمليات',
      filter: false,
      sortable: false,
      width: 120,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data as CompanySettlementItem
        if (!item) return null
        return (
          <div className="flex items-center justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadStatementClick(item)}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> كشف الحساب
            </Button>
          </div>
        )
      }
    }
  ]
}
