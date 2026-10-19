import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import {
  useTouristDestinationsList,
  useDeleteTouristDestination,
  useToggleTouristDestinationStatus
} from '../../api/useTouristDestinations'
import { useAllCities } from '../../api/useCities'
import { getTouristDestinationsColumnDefs } from './ColumnDefs'

export default function TouristDestinationsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [page, setPage] = useState(1)
  const label = t('touristDestinations') || 'Tourist Destinations'

  const [deletingItem, setDeletingItem] = useState<any | null>(null)

  const { data: cities = [] } = useAllCities()
  const { data: paginatedData, isLoading } = useTouristDestinationsList(page, selectedCityId || undefined, search)
  const items = paginatedData?.data || []

  const deleteMutation = useDeleteTouristDestination()
  const toggleMutation = useToggleTouristDestinationStatus()

  const columnDefs = getTouristDestinationsColumnDefs({
    t,
    i18n,
    toggleMutation,
    navigate,
    setDeletingItem
  })

  const isRtl = i18n.language === 'ar'

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
        <CardTitle className="text-lg font-bold text-foreground">{label}</CardTitle>
        <Button onClick={() => navigate('/settings/touristdestinations/new')} className="h-9 px-4 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> {t('add') || 'Add New'}
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex max-w-sm w-full">
            <SearchInput
              placeholder={`${t('search') || 'Search'} ${label}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCityId}
              onChange={(e) => {
                setSelectedCityId(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-xl border border-gray-200 bg-white text-xs px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-main"
            >
              <option value="">{t('allCities') || 'All Cities'}</option>
              {cities
                .map((city: any) => {
                  const cityName = city.translations?.find((trans: any) => trans.language_id === (isRtl ? 2 : 1))?.name || city.name || ''
                  return { id: city.id, name: cityName }
                })
                .filter((c: any) => c.name.trim() !== '')
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <GenericDataGrid
          rowData={items}
          columnDefs={columnDefs}
          rowHeight={50}
          headerHeight={50}
          loading={isLoading}
          onViewRow={(data) => {
            navigate(`/settings/touristdestinations/${data.id}`)
          }}
          isServerSide
          currentPage={page}
          totalPages={paginatedData?.meta?.last_page || paginatedData?.last_page || 1}
          onPageChange={setPage}
          paginationLinks={paginatedData?.meta?.links || paginatedData?.links}
        />
      </CardContent>

      <ModalStatus
        open={!!deletingItem}
        onOpenChange={(v) => !v && setDeletingItem(null)}
        title={`${t('delete') || 'Delete'} ${label}`}
        description={t('deleteConfirmation') || "Are you sure you want to delete this item? This action cannot be undone."}
        agreeLabel={t('delete') || 'Delete'}
        cancelLabel={t('cancel') || 'Cancel'}
        onAgreeButtonClick={() => {
          if (deletingItem) {
            deleteMutation.mutate(deletingItem.id, {
              onSuccess: () => setDeletingItem(null)
            })
          }
        }}
        onCancelButtonClick={() => setDeletingItem(null)}
        loading={deleteMutation.isPending}
        type="delete"
      />
    </Card>
  )
}
