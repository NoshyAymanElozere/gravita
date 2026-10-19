import { Button } from '@/components/ui/button'
import { ColDef } from 'ag-grid-community'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ColumnDefsProps {
  t: (key: string) => string
  i18n: any
  setDeletingItem: (item: any) => void
  navigate: (path: string) => void
}

export function getTouristProgramColumnDefs({
  t,
  i18n,
  setDeletingItem,
  navigate
}: ColumnDefsProps): ColDef[] {
  const isRtl = i18n?.language === 'ar'
  const langId = isRtl ? 2 : 1

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
      headerName: t('country') || 'Country',
      valueGetter: (params) => {
        const country = params.data?.tourist_destination?.city?.country
        if (!country) return '-'
        return (
          country.translations?.find((trans: any) => trans.language_id === langId)?.name ||
          country.name ||
          '-'
        )
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('city') || 'City',
      valueGetter: (params) => {
        const city = params.data?.tourist_destination?.city
        if (!city) return '-'
        return (
          city.translations?.find((trans: any) => trans.language_id === langId)?.name ||
          city.name ||
          '-'
        )
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('touristDestination') || 'Tourist City',
      valueGetter: (params) => {
        const dest = params.data?.tourist_destination
        if (!dest) return '-'
        return (
          dest.translations?.find((trans: any) => trans.language_id === langId)?.name ||
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
      valueFormatter: (params) => `${Number(params.value || 0).toFixed(2)} USD`
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
              onClick={() => navigate(`/settings/touristprograms/${item.id}`)}
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(`/settings/touristprograms/${item.id}/edit`)}
            >
              <Pencil className="h-4 w-4 text-gray-500" />
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
