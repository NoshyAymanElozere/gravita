import { Button } from '@/components/ui/button'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import type { ColDef } from 'ag-grid-community'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { CompanyPlan } from '../api/usePlans'

interface ColumnDefsProps {
  t: (key: string) => string
  onViewClick: (item: CompanyPlan) => void
  onEditClick: (item: CompanyPlan) => void
  onDeleteClick: (item: CompanyPlan) => void
  onToggleStatus?: (item: CompanyPlan) => Promise<unknown>
}

export function getPlanColumnDefs({
  t,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('planName') || 'اسم الباقة',
      field: 'name_ar',
      filter: false,
      minWidth: 240,
      flex: 1.5,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyPlan
        if (!item) return null
        return (
          <div className="flex flex-col py-1">
            <span className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">
              {item.name_ar}
            </span>
            <span className="text-[11px] text-gray-400 font-mono truncate">
              {item.name_en}
            </span>
          </div>
        )
      }
    },
    {
      headerName: 'الفئة والتغطية',
      field: 'category',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyPlan
        if (!item) return null
        return (
          <div className="flex items-center gap-1.5 h-full">
            <span className="font-semibold text-xs text-gray-700 dark:text-zinc-300">{item.category}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
              {item.coverage_type === 'comprehensive' ? 'شامل' : 'ضد الغير'}
            </span>
          </div>
        )
      }
    },
    {
      headerName: t('basePrice') || 'السعر الأساسي',
      field: 'base_price',
      filter: false,
      width: 140,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono text-xs font-bold text-gray-900 dark:text-zinc-100">
            {params.value?.toLocaleString()} ر.س
          </div>
        )
      }
    },
    {
      headerName: t('deductible') || 'مبلغ التحمل',
      field: 'deductible',
      filter: false,
      width: 130,
      cellRenderer: (params: any) => {
        const d = params.value as number
        return (
          <div className="flex items-center h-full text-xs font-semibold text-gray-600 dark:text-zinc-400">
            {d === 0 ? 'لا يوجد (0 ر.س)' : `${d} ر.س`}
          </div>
        )
      }
    },
    {
      headerName: 'مبيعات الباقة',
      field: 'policies_sold',
      filter: false,
      width: 130,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {params.value?.toLocaleString()} وثيقة
          </div>
        )
      }
    },
    {
      headerName: t('status') || 'الحالة',
      field: 'status',
      filter: false,
      width: 140,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyPlan
        if (!item) return null
        return (
          <div className="flex items-center h-full">
            <StatusDropdown
              value={item.status === 'active'}
              onChange={async () => {
                if (onToggleStatus) {
                  await onToggleStatus(item)
                }
              }}
            />
          </div>
        )
      }
    },
    {
      headerName: t('actions') || 'العمليات',
      filter: false,
      sortable: false,
      width: 140,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data as CompanyPlan
        if (!item) return null
        return (
          <div className="flex items-center justify-start gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onViewClick(item)}
              title={t('view') || 'عرض التفاصيل'}
            >
              <Eye className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEditClick(item)}
              title={t('edit') || 'تعديل'}
            >
              <Pencil className="h-4 w-4 text-gray-500 hover:text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteClick(item)}
              title={t('delete') || 'حذف'}
            >
              <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-700" />
            </Button>
          </div>
        )
      }
    }
  ]
}
