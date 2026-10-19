import { Button } from '@/components/ui/button'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { ColDef } from 'ag-grid-community'
import { Pencil, Trash2, Eye, ImageIcon } from 'lucide-react'

interface ColumnDefsProps {
  t: (key: string) => string
  i18n: any
  toggleMutation: any
  navigate: (path: string) => void
  setDeletingItem: (item: any) => void
}

export function getTouristDestinationsColumnDefs({
  t,
  i18n,
  toggleMutation,
  navigate,
  setDeletingItem
}: ColumnDefsProps): ColDef[] {
  return [
    {
      headerName: t('image') || 'Image',
      filter: false,
      width: 80,
      cellRenderer: (params: any) => {
        const url = params.data?.image_url || params.data?.image
        return (
          <div className="flex items-center justify-start h-full w-full py-1">
            {url ? (
              <img src={url} alt="destination" className="h-12 w-12 object-cover rounded-lg border border-border" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-border">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        )
      }
    },
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
        const country = params.data?.city?.country
        if (!country) return '-'
        return (
          country.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name ||
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
        const city = params.data?.city
        if (!city) return '-'
        return (
          city.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name ||
          city.name ||
          '-'
        )
      },
      filter: false,
      flex: 1
    },
    {
      headerName: t('status') || 'Status',
      field: 'is_active',
      filter: 'agSetColumnFilter',
      filterParams: {
        valueFormatter: (params: any) => (params.value ? t('active') || 'Active' : t('inactive') || 'Inactive')
      },
      width: 150,
      cellRenderer: (params: any) => {
        const item = params.data
        if (!item) return null
        return (
          <StatusDropdown
            value={item.is_active}
            onChange={() => toggleMutation.mutateAsync(item.id)}
          />
        )
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
                navigate(`/settings/touristdestinations/${item.id}`)
              }}
            >
              <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                navigate(`/settings/touristdestinations/${item.id}/edit`)
              }}
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
