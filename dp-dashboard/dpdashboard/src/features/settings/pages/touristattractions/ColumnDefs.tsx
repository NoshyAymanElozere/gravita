import { Button } from '@/components/ui/button'
import { ColDef } from 'ag-grid-community'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ColumnDefsProps {
  t: (key: string) => string
  i18n: any
  navigate: (path: string) => void
  setDeletingItem: (item: any) => void
}

export function getTouristAttractionsColumnDefs({
  t,
  i18n,
  navigate,
  setDeletingItem
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('arabicName') || 'Arabic Name',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 2)?.name || ''
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('englishName') || 'English Name',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 1)?.name || params.data?.name || ''
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('touristDestination') || 'Tourist Destination',
      valueGetter: (params) => {
        const dest = params.data?.tourist_destination
        if (!dest) return '-'
        return (
          dest.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name ||
          dest.name ||
          '-'
        )
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('price') || 'Price',
      field: 'price',
      filter: false,
      width: 120,
      valueFormatter: (params) => {
        return params.value ? `${params.value}` : '-'
      }
    },
    {
      headerName: t('actions') || 'Actions',
      filter: false,
      width: 150,
      cellClass: 'flex items-center justify-start h-full',
      cellRenderer: (params: any) => {
        const item = params.data
        if (!item) return null
        return (
          <div className="flex items-center justify-start gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                navigate(`/settings/touristattractions/${item.id}`)
              }}
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                navigate(`/settings/touristattractions/${item.id}/edit`)
              }}
            >
              <Pencil className="h-4 w-4 text-amber-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeletingItem(item)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )
      }
    }
  ]
}
