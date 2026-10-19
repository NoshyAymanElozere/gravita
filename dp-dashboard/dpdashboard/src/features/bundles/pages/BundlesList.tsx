import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { Boxes, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader } from '@/components/shared/page-header'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { BiName, Thumb } from '@/components/shared/thumb'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatMoney, formatNum } from '@/utils/format'
import type { Bundle } from '@/types/api'
import { useBundleList, useDeleteBundle, useRecalculateBundle, useToggleBundle } from '../api/useBundles'

export default function BundlesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { page, set } = useSearchParamsState([] as const)
  const { data, isLoading } = useBundleList({ page, limit: 15 })
  const toggle = useToggleBundle()
  const recalc = useRecalculateBundle()
  const del = useDeleteBundle()
  const [deleting, setDeleting] = useState<Bundle | null>(null)

  const columns = useMemo<ColDef<Bundle>[]>(
    () => [
      {
        headerName: t('bundles.bundle'),
        minWidth: 260,
        flex: 2,
        cellRenderer: ({ data: b }: { data: Bundle }) => (
          <Link to={`/bundles/${b._id}/edit`} className="flex h-full items-center gap-3">
            <Thumb src={b.image} />
            <BiName en={b.nameEn} ar={b.nameAr} className="hover:underline" />
          </Link>
        ),
      },
      {
        headerName: t('bundles.products'),
        width: 110,
        flex: 0,
        cellRenderer: ({ data: b }: { data: Bundle }) => <span className="tabular">{formatNum(b.items.length)}</span>,
      },
      {
        headerName: t('bundles.pricing'),
        minWidth: 190,
        cellRenderer: ({ data: b }: { data: Bundle }) => (
          <div className="flex h-full flex-col justify-center leading-tight">
            <span className="tabular">
              <span className="text-xs text-muted-foreground line-through">{formatMoney(b.originalPrice)}</span>
              <span className="mx-1.5 text-muted-foreground">→</span>
              <span className="font-semibold">{formatMoney(b.bundlePrice)}</span>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {t('bundles.saves', { amount: formatMoney(b.savings ?? b.originalPrice - b.bundlePrice), pct: b.discountPercentage })}
            </span>
          </div>
        ),
      },
      {
        headerName: t('bundles.availability'),
        minWidth: 140,
        cellRenderer: ({ data: b }: { data: Bundle }) =>
          b.available === false ? (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{t('bundles.unavailable')}</span>
          ) : (
            <span className="text-sm">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t('bundles.available')}</span>
              {b.maxQuantity != null && <span className="ms-2 text-xs text-muted-foreground">{t('bundles.maxQty', { count: b.maxQuantity })}</span>}
            </span>
          ),
      },
      {
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: ({ data: b }: { data: Bundle }) => (
          <div className="flex h-full items-center">
            <StatusDropdown value={b.isActive} onChange={(isActive) => toggle.mutateAsync({ id: b._id, isActive })} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 140,
        flex: 0,
        cellRenderer: ({ data: b }: { data: Bundle }) => (
          <div className="flex h-full items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/bundles/${b._id}/edit`)} aria-label={t('common.edit')}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => recalc.mutate(b._id)} title={t('bundles.recalculate')} aria-label={t('bundles.recalculate')}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(b)} aria-label={t('common.delete')}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Boxes}
        title={t('bundles.title')}
        description={t('bundles.subtitle')}
        actions={
          <Button asChild>
            <Link to="/bundles/new">
              <Plus className="h-4 w-4" />
              {t('bundles.add')}
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Bundle>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={68}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data && !p.data.isActive ? 'opacity-60' : undefined)}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('bundles.deleteTitle')}
        description={t('bundles.deleteText', { name: deleting?.nameEn })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
