import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useZodForm } from '@/components/shared/form-fields'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  useCountriesList,
  useCreateCountry,
  useDeleteCountry,
  useToggleCountryStatus,
  useUpdateCountry
} from '../../api/useCountries'
import { getCountriesColumnDefs } from './ColumnDefs'
import { CountriesFormModal } from './CountriesFormModal'
import { getInitialValues, schema } from './validationSchema'

export default function CountriesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const label = t('countries') || 'Countries'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [deletingItem, setDeletingItem] = useState<any | null>(null)
  const [isViewOnly, setIsViewOnly] = useState(false)

  const methods = useZodForm(schema, getInitialValues(editingItem))

  const { data: paginatedData, isLoading } = useCountriesList(page, search)
  const items = paginatedData?.data || []

  const createMutation = useCreateCountry()
  const updateMutation = useUpdateCountry()
  const deleteMutation = useDeleteCountry()
  const toggleMutation = useToggleCountryStatus()

  const handleSave = (formData: any) => {
    const data = new FormData()
    data.append('code', formData.code)
    data.append('phone_code', formData.phone_code)
    data.append('is_active', formData.is_active ? '1' : '0')
    if (formData.image && formData.image[0]) {
      data.append('image', formData.image[0])
    }
    data.append('translations[0][language_id]', '1')
    data.append('translations[0][name]', formData.nameEn)
    data.append('translations[1][language_id]', '2')
    data.append('translations[1][name]', formData.nameAr)

    if (editingItem) {
      data.append('_method', 'PUT')
      updateMutation.mutate(
        { id: editingItem.id, formData: data },
        {
          onSuccess: () => {
            setIsModalOpen(false)
            setEditingItem(null)
          }
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false)
        }
      })
    }
  }

  const columnDefs = getCountriesColumnDefs({
    t,
    toggleMutation,
    setEditingItem,
    setIsModalOpen,
    setDeletingItem,
    setIsViewOnly
  })

  return (
    <FormProvider {...methods}>

      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
          <CardTitle className="text-lg font-bold text-foreground">{label}</CardTitle>
          <Button onClick={() => { setEditingItem(null); setIsViewOnly(false); setIsModalOpen(true); }} className="h-9 px-4 rounded-xl">
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
            onViewRow={(data) => {
              setEditingItem(data)
              setIsViewOnly(true)
              setIsModalOpen(true)
            }}
            isServerSide
            currentPage={page}
            totalPages={paginatedData?.meta?.last_page || paginatedData?.last_page || 1}
            onPageChange={setPage}
            paginationLinks={paginatedData?.meta?.links || paginatedData?.links}
          />

        </CardContent>

        <CountriesFormModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editingItem={editingItem}
          onSave={handleSave}
          loading={createMutation.isPending || updateMutation.isPending}
          label={label}
          isViewOnly={isViewOnly}
        />

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
    </FormProvider>
  )
}
