import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import {
  useSupportMessagesList,
  useDeleteSupportMessage
} from '../../api/useSupport'
import { getSupportColumnDefs } from './ColumnDefs'
import { SupportViewModal } from './SupportViewModal'

export default function SupportPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const label = t('supportMessages') || 'Support Messages'
  const isRtl = i18n.language === 'ar'

  const [viewingItem, setViewingItem] = useState<any | null>(null)
  const [deletingItem, setDeletingItem] = useState<any | null>(null)

  const { data: paginatedData, isLoading } = useSupportMessagesList(page, search, statusFilter)
  const items = paginatedData?.data || []

  const deleteMutation = useDeleteSupportMessage()

  const columnDefs = getSupportColumnDefs({
    t,
    setViewingItem,
    setDeletingItem
  })

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
        <CardTitle className="text-lg font-bold text-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex-1">
            <SearchInput
              placeholder={`${t('search') || 'Search'} ${label}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="unread">{t('unread') || 'Unread'}</option>
              <option value="read">{t('read') || 'Read'}</option>
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
            setViewingItem(data)
          }}
          isServerSide
          currentPage={page}
          totalPages={paginatedData?.meta?.last_page || paginatedData?.last_page || 1}
          onPageChange={setPage}
          paginationLinks={paginatedData?.meta?.links || paginatedData?.links}
        />
      </CardContent>

      <SupportViewModal
        open={!!viewingItem}
        onOpenChange={(open) => !open && setViewingItem(null)}
        messageId={viewingItem?.id || null}
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
  )
}
