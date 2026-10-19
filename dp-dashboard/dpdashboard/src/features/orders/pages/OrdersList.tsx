import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { ShoppingBag, Eye, X, Undo2 } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { SearchInput, Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatDate, formatMoney, formatNum } from '@/utils/format'
import { ORDER_STATUSES, type Order } from '@/types/api'
import { useOrderList } from '../api/useOrders'
import { OrderStatusBadge, PaymentStatusBadge } from '../lib/status'

const LIMIT = 15

export default function OrdersList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { values, page, set } = useSearchParamsState(['q', 'status', 'from', 'to'] as const)
  const [search, setSearch] = useState(values.q)
  const debounced = useDebounce(search)

  useEffect(() => {
    if (debounced !== values.q) set({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { data, isLoading, isFetching } = useOrderList({
    page,
    limit: LIMIT,
    q: values.q,
    status: values.status,
    from: values.from,
    to: values.to,
  })

  const hasFilters = !!(values.q || values.status || values.from || values.to)

  const columns = useMemo<ColDef<Order>[]>(
    () => [
      {
        headerName: t('orders.order'),
        minWidth: 170,
        cellRenderer: ({ data: o }: { data: Order }) => (
          <div className="flex h-full flex-col justify-center leading-tight">
            <span className="flex items-center gap-1.5 font-semibold" dir="ltr">
              {o.status === 'return_requested' && <Undo2 className="h-3.5 w-3.5 text-rose-500" />}
              {o.orderNumber}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(o.createdAt, true)}</span>
          </div>
        ),
      },
      {
        headerName: t('orders.customer'),
        minWidth: 200,
        flex: 1.4,
        cellRenderer: ({ data: o }: { data: Order }) => {
          const user = typeof o.user === 'object' && o.user ? o.user : null
          return (
            <div className="flex h-full flex-col justify-center leading-tight">
              <span className="truncate font-medium">{o.contact?.name || user?.name || '—'}</span>
              <span className="truncate text-xs text-muted-foreground" dir="ltr">
                {o.contact?.email || user?.email || o.contact?.phone}
              </span>
            </div>
          )
        },
      },
      {
        headerName: t('orders.items'),
        width: 90,
        flex: 0,
        valueGetter: ({ data: o }) => (o ? o.items.reduce((s, i) => s + i.quantity, 0) : 0),
        cellRenderer: ({ value }: { value: number }) => <span className="tabular">{formatNum(value)}</span>,
      },
      {
        headerName: t('orders.total'),
        width: 130,
        flex: 0,
        cellRenderer: ({ data: o }: { data: Order }) => <span className="font-semibold tabular">{formatMoney(o.total)}</span>,
      },
      {
        headerName: t('orders.payment'),
        minWidth: 150,
        cellRenderer: ({ data: o }: { data: Order }) => (
          <div className="flex h-full flex-col items-start justify-center gap-0.5 leading-tight">
            <span className="text-xs text-muted-foreground">{t(`paymentMethod.${o.paymentMethod}`)}</span>
            <PaymentStatusBadge status={o.paymentStatus} />
          </div>
        ),
      },
      {
        headerName: t('common.status'),
        minWidth: 170,
        cellRenderer: ({ data: o }: { data: Order }) => (
          <div className="flex h-full items-center">
            <OrderStatusBadge status={o.status} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 70,
        flex: 0,
        cellRenderer: ({ data: o }: { data: Order }) => (
          <div className="flex h-full items-center">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/orders/${o._id}`)} aria-label={t('common.view')}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, navigate]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader icon={ShoppingBag} title={t('orders.title')} description={t('orders.subtitle')} />

      <FilterBar>
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('orders.searchPlaceholder')} />
        </div>
        <Select value={values.status || 'all'} onValueChange={(v) => set({ status: v })}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`orderStatus.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">{t('common.from')}</label>
          <Input type="date" value={values.from} max={values.to || undefined} onChange={(e) => set({ from: e.target.value })} className="w-40" />
          <label className="text-xs font-medium text-muted-foreground">{t('common.to')}</label>
          <Input type="date" value={values.to} min={values.from || undefined} onChange={(e) => set({ to: e.target.value })} className="w-40" />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              set({ q: null, status: null, from: null, to: null })
            }}
          >
            <X className="h-3.5 w-3.5" />
            {t('common.clearFilters')}
          </Button>
        )}
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Order>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading || (isFetching && !data)}
          domLayout="autoHeight"
          height="auto"
          rowHeight={60}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data?.status === 'return_requested' ? 'bg-rose-50/70 dark:bg-rose-500/5' : undefined)}
          defaultColDef={{ sortable: false }}
          onRowDoubleClicked={(e) => e.data && navigate(`/orders/${e.data._id}`)}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>
    </div>
  )
}
