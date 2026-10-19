import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import {
  useTouristProgramsList,
  useDeleteTouristProgram
} from '../../api/useTouristPrograms'
import { getTouristProgramColumnDefs } from './ColumnDefs'

export default function TouristProgramsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const label = t('touristPrograms') || 'Tourist Programs'

  const [deletingItem, setDeletingItem] = useState<any | null>(null)

  const { data: paginatedData, isLoading } = useTouristProgramsList(page, search)
  const items = paginatedData?.data || []

  const deleteMutation = useDeleteTouristProgram()

  const columnDefs = getTouristProgramColumnDefs({
    t,
    i18n,
    setDeletingItem,
    navigate
  })

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
        <CardTitle className="text-lg font-bold text-foreground">{label}</CardTitle>
        <Button onClick={() => navigate('/settings/touristprograms/new')} className="h-9 px-4 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> {t('add') || 'Add New'}
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex max-w-sm">
          <SearchInput
            placeholder={`${t('search') || 'Search'} ${label}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <GenericDataGrid
          rowData={items}
          columnDefs={columnDefs}
          rowHeight={50}
          headerHeight={50}
          loading={isLoading}
          onViewRow={(data) => navigate(`/settings/touristprograms/${data.id}`)}
          isServerSide
          currentPage={page}
          totalPages={paginatedData?.last_page || paginatedData?.meta?.last_page || 1}
          onPageChange={setPage}
          paginationLinks={paginatedData?.links || paginatedData?.meta?.links}
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
