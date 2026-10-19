import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import type { ColDef } from 'ag-grid-community'
import { Eye, Pencil, Trash2, Shield } from 'lucide-react'
import type { CompanyStaffMember } from '../api/useCompanyTeam'

interface ColumnDefsProps {
  t: (key: string) => string
  onViewClick: (item: CompanyStaffMember) => void
  onEditClick: (item: CompanyStaffMember) => void
  onDeleteClick: (item: CompanyStaffMember) => void
  onToggleStatus?: (item: CompanyStaffMember) => Promise<unknown>
}

export function getCompanyTeamColumnDefs({
  t,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: 'اسم الموظف',
      field: 'name',
      filter: false,
      minWidth: 200,
      flex: 1.2,
      cellRenderer: (params: any) => {
        const item = params.data as CompanyStaffMember
        if (!item) return null
        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className="h-8 w-8 rounded-full bg-main/10 text-main flex items-center justify-center font-bold text-xs shrink-0">
              {item.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate">
                {item.name}
              </span>
              <span className="text-[11px] text-gray-400 font-mono truncate">
                {item.email}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      headerName: 'رقم الجوال',
      field: 'phone',
      filter: false,
      width: 160,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full font-mono text-xs text-gray-700 dark:text-zinc-300">
            {params.value}
          </div>
        )
      }
    },
    {
      headerName: 'الدور الوظيفي',
      field: 'role',
      filter: false,
      width: 170,
      cellRenderer: (params: any) => {
        const role = params.value as CompanyStaffMember['role']
        if (role === 'admin') {
          return (
            <div className="flex items-center h-full">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                <Shield className="h-3 w-3" /> مدير حساب الشركة
              </Badge>
            </div>
          )
        }
        if (role === 'claims_officer') {
          return (
            <div className="flex items-center h-full">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                أخصائي مطالبات
              </Badge>
            </div>
          )
        }
        return (
          <div className="flex items-center h-full">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              محاسب مالي
            </Badge>
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
        const item = params.data as CompanyStaffMember
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
      headerName: 'تاريخ الإضافة',
      field: 'created_at',
      filter: false,
      width: 130,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center h-full text-xs text-gray-400 font-mono">
            {params.value}
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
        const item = params.data as CompanyStaffMember
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
