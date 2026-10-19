import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { TicketPercent, Plus, Pencil, Trash2 } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatDate, formatMoney, pickLang } from '@/utils/format'
import { cn } from '@/utils/utils'
import type { Coupon } from '@/types/api'
import { useCouponList, useDeleteCoupon, useSaveCoupon } from '../api/useCoupons'
import { CouponFormModal } from '../components/CouponFormModal'

const isExpired = (c: Coupon) => !!c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()

function Usage({ c }: { c: Coupon }) {
  const { t } = useTranslation()
  const limited = c.usageLimit != null && c.usageLimit > 0
  const pct = limited ? Math.min(100, Math.round((c.usedCount / c.usageLimit!) * 100)) : 0
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1">
      <span className="text-xs tabular">
        <b>{c.usedCount}</b> / {limited ? c.usageLimit : '∞'}
      </span>
      {limited ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-sage')} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground">{t('coupons.unlimited')}</span>
      )}
    </div>
  )
}

export default function CouponsList() {
  const { t } = useTranslation()
  const { values, page, set } = useSearchParamsState(['isActive'] as const)
  const { data, isLoading } = useCouponList({ page, limit: 15, isActive: values.isActive })
  const save = useSaveCoupon()
  const del = useDeleteCoupon()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleting, setDeleting] = useState<Coupon | null>(null)

  const columns = useMemo<ColDef<Coupon>[]>(
    () => [
      {
        headerName: t('coupons.code'),
        minWidth: 220,
        flex: 1.6,
        cellRenderer: ({ data: c }: { data: Coupon }) => (
          <div className="flex h-full flex-col justify-center leading-tight">
            <span className="flex items-center gap-2">
              <span className="rounded-md border border-dashed border-brand-sage bg-brand-cream/60 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-brand-primary dark:bg-accent dark:text-accent-foreground" dir="ltr">
                {c.code}
              </span>
              {isExpired(c) && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{t('coupons.expired')}</span>}
            </span>
            <span className="mt-1 truncate text-xs text-muted-foreground">{pickLang(c, 'description')}</span>
          </div>
        ),
      },
      {
        headerName: t('coupons.discount'),
        minWidth: 150,
        cellRenderer: ({ data: c }: { data: Coupon }) => (
          <div className="flex h-full flex-col justify-center leading-tight">
            <span className="font-semibold">{c.discountType === 'percentage' ? `${c.value}%` : formatMoney(c.value)}</span>
            {c.maxDiscount != null && <span className="text-xs text-muted-foreground">{t('coupons.upTo', { amount: formatMoney(c.maxDiscount) })}</span>}
          </div>
        ),
      },
      {
        headerName: t('coupons.minOrder'),
        minWidth: 120,
        cellRenderer: ({ data: c }: { data: Coupon }) => <span className="tabular">{c.minOrderAmount ? formatMoney(c.minOrderAmount) : '—'}</span>,
      },
      {
        headerName: t('coupons.usage'),
        minWidth: 140,
        cellRenderer: ({ data: c }: { data: Coupon }) => <Usage c={c} />,
      },
      {
        headerName: t('coupons.expiresAt'),
        minWidth: 130,
        cellRenderer: ({ data: c }: { data: Coupon }) => (
          <span className={cn(isExpired(c) ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>{c.expiresAt ? formatDate(c.expiresAt) : t('coupons.never')}</span>
        ),
      },
      {
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: ({ data: c }: { data: Coupon }) => (
          <div className="flex h-full items-center">
            <StatusDropdown value={c.isActive} onChange={(isActive) => save.mutateAsync({ id: c._id, payload: { isActive } })} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 100,
        flex: 0,
        cellRenderer: ({ data: c }: { data: Coupon }) => (
          <div className="flex h-full items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditing(c)
                setFormOpen(true)
              }}
              aria-label={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(c)} aria-label={t('common.delete')}>
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
        icon={TicketPercent}
        title={t('coupons.title')}
        description={t('coupons.subtitle')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            {t('coupons.add')}
          </Button>
        }
      />

      <FilterBar>
        <Select value={values.isActive || 'all'} onValueChange={(v) => set({ isActive: v })}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
            <SelectItem value="true">{t('common.active')}</SelectItem>
            <SelectItem value="false">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Coupon>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={64}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data && (!p.data.isActive || isExpired(p.data)) ? 'opacity-70' : undefined)}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <CouponFormModal open={formOpen} onOpenChange={setFormOpen} coupon={editing} />
      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('coupons.deleteTitle')}
        description={t('coupons.deleteText', { code: deleting?.code })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
