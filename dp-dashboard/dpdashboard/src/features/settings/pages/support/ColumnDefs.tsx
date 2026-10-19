import { Button } from '@/components/ui/button'
import { ColDef } from 'ag-grid-community'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ColumnDefsProps {
  t: (key: string) => string
  setViewingItem: (item: any) => void
  setDeletingItem: (item: any) => void
}

export function getSupportColumnDefs({
  t,
  setViewingItem,
  setDeletingItem
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('arabicName') || 'Name',
      field: 'name',
      filter:false,
      flex: 1
    },
    {
      headerName: t('email') || 'Email',
      field: 'email',
      filter:false,
      flex: 1
    },
    {
      headerName: t('phoneCode') || 'Phone',
      field: 'phone',
      filter:false,
      width: 140
    },
    {
      headerName: t('subject') || 'Subject',
      field: 'subject',
      filter:false,
      flex: 1.5
    },
    {
      headerName: t('status') || 'Status',
      field: 'status',
      filter: 'agSetColumnFilter',
      width: 130,
      cellRenderer: (params: any) => {
        const val = params.value
        const isRead = val === 'read'
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            isRead
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isRead ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isRead ? t('read') || 'Read' : t('unread') || 'Unread'}
          </span>
        )
      }
    },
    {
      headerName: t('actions') || 'Actions',
      filter: false,
      width: 120,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data
        if (!item) return null
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewingItem(item)}
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeletingItem(item)}
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        )
      }
    }
  ]
}
