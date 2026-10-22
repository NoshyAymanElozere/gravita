import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { Images, Plus, Pencil, Trash2 } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader } from '@/components/shared/page-header'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { BiName, Thumb } from '@/components/shared/thumb'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import type { Banner } from '@/types/api'
import { useBannerList, useDeleteBanner, useToggleBanner } from '../api/useBanners'
import { BannerFormModal } from '../components/BannerFormModal'

export default function BannersList() {
  const { t } = useTranslation()
  const { page, set } = useSearchParamsState([] as const)
  const { data, isLoading } = useBannerList({ page, limit: 20 })
  const toggle = useToggleBanner()
  const del = useDeleteBanner()
  const [editing, setEditing] = useState<Banner | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Banner | null>(null)

  const columns = useMemo<ColDef<Banner>[]>(
    () => [
      {
        headerName: t('banners.banner'),
        minWidth: 300,
        flex: 2,
        cellRenderer: ({ data: b }: { data: Banner }) => (
          <div className="flex h-full items-center gap-3">
            <Thumb src={b.image} />
            <BiName en={b.titleEn || '—'} ar={b.titleAr || '—'} />
          </div>
        ),
      },
      {
        headerName: t('banners.link'),
        minWidth: 180,
        flex: 1,
        cellRenderer: ({ data: b }: { data: Banner }) =>
          b.link ? (
            <span className="truncate font-mono text-xs text-muted-foreground">{b.link}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        headerName: t('common.sortOrder'),
        width: 110,
        flex: 0,
        cellRenderer: ({ data: b }: { data: Banner }) => <span className="tabular">{b.sortOrder}</span>,
      },
      {
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: ({ data: b }: { data: Banner }) => (
          <div className="flex h-full items-center">
            <StatusDropdown value={b.isActive} onChange={(isActive) => toggle.mutateAsync({ id: b._id, isActive })} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 100,
        flex: 0,
        cellRenderer: ({ data: b }: { data: Banner }) => (
          <div className="flex h-full items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditing(b)
                setFormOpen(true)
              }}
              aria-label={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(b)} aria-label={t('common.delete')}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Images}
        title={t('banners.title')}
        description={t('banners.subtitle')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            {t('banners.add')}
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Banner>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={64}
          getRowId={(p) => p.data._id}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <BannerFormModal open={formOpen} onOpenChange={setFormOpen} banner={editing} />

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('banners.deleteTitle')}
        description={t('banners.deleteText')}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
