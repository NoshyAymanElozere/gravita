import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import type { ElementType } from 'react'
import type { TFunction } from 'i18next'
import { Eye, Pencil, Undo2 } from 'lucide-react'
import { cn } from '@/utils/utils'
import { formatDateTime, formatDay, formatMoney } from '../lib/format'
import type { InboxRequest, Offer } from '../types/vehicleInsurance.types'
import { MyResponseBadge, OfferStatusBadge, RequestStatusBadge } from './StatusBadges'
import { canChangeOffer, offerRef } from './OfferCard'

const cellCenter = 'flex items-center h-full'

export function getInboxColumnDefs({
  t,
  lang,
  onOpen,
}: {
  t: TFunction
  lang: string
  onOpen: (item: InboxRequest) => void
}): ColDef<InboxRequest>[] {
  const text = `${cellCenter} text-[13px] text-gray-700 dark:text-zinc-300`
  return [
    {
      headerName: t('vehicleInsurance.columns.reference'),
      field: 'reference',
      minWidth: 130,
      maxWidth: 170,
      cellRenderer: ({ data }: ICellRendererParams<InboxRequest>) =>
        data && (
          <span className={cn(cellCenter, 'gap-2')}>
            {data.my_response.value === 'pending' && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
            <span dir="ltr" className="font-mono text-[13px] font-semibold text-gray-900 dark:text-zinc-100">
              {data.reference ?? `#${data.id}`}
            </span>
          </span>
        ),
    },
    {
      headerName: t('vehicleInsurance.columns.vehicle'),
      field: 'vehicle_name',
      minWidth: 180,
      flex: 1.5,
      cellClass: `${cellCenter} truncate text-[13px] font-semibold text-gray-900 dark:text-zinc-100`,
    },
    {
      headerName: t('vehicleInsurance.columns.requestedType'),
      field: 'insurance_type',
      minWidth: 120,
      valueGetter: ({ data }) => data?.insurance_type.label ?? '',
      cellClass: text,
    },
    {
      headerName: t('vehicleInsurance.columns.estimatedValue'),
      field: 'estimated_value',
      minWidth: 120,
      valueFormatter: ({ value }) => (value === null ? '—' : `${formatMoney(value, lang)} ${t('vehicleInsurance.currency')}`),
      cellClass: `${text} tabular-nums`,
    },
    {
      headerName: t('vehicleInsurance.columns.policyStart'),
      field: 'policy_start_date',
      minWidth: 115,
      valueFormatter: ({ value }) => formatDay(value, lang),
      cellClass: text,
    },
    {
      headerName: t('vehicleInsurance.columns.submittedAt'),
      field: 'submitted_at',
      minWidth: 115,
      valueFormatter: ({ value }) => formatDay(value, lang),
      cellClass: `${cellCenter} text-xs text-muted-foreground`,
    },
    {
      headerName: t('vehicleInsurance.columns.myResponse'),
      field: 'my_response',
      minWidth: 110,
      cellClass: cellCenter,
      cellRenderer: ({ data }: ICellRendererParams<InboxRequest>) => data && <MyResponseBadge value={data.my_response} />,
    },
    {
      headerName: t('vehicleInsurance.columns.requestStatus'),
      field: 'status',
      minWidth: 120,
      cellClass: cellCenter,
      cellRenderer: ({ data }: ICellRendererParams<InboxRequest>) => data && <RequestStatusBadge value={data.status} />,
    },
    {
      headerName: t('vehicleInsurance.columns.actions'),
      colId: 'open',
      sortable: false,
      resizable: false,
      minWidth: 90,
      maxWidth: 90,
      cellClass: cellCenter,
      cellRenderer: ({ data }: ICellRendererParams<InboxRequest>) =>
        data && <IconAction label={t('view')} onClick={() => onOpen(data)} icon={Eye} />,
    },
  ]
}

export function getOfferColumnDefs({
  t,
  lang,
  onView,
  onEdit,
  onWithdraw,
}: {
  t: TFunction
  lang: string
  onView: (offer: Offer) => void
  onEdit: (offer: Offer) => void
  onWithdraw: (offer: Offer) => void
}): ColDef<Offer>[] {
  return [
    {
      headerName: t('vehicleInsurance.columns.offer'),
      field: 'reference',
      minWidth: 130,
      cellRenderer: ({ data }: ICellRendererParams<Offer>) =>
        data && (
          <div className="flex flex-col py-1.5 leading-tight">
            <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100">{offerRef(data)}</span>
            <span className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(data.created_at, lang)}</span>
          </div>
        ),
    },
    {
      headerName: t('vehicleInsurance.columns.request'),
      field: 'request_reference',
      minWidth: 120,
      valueGetter: ({ data }) => (data ? (data.request_reference ?? `#${data.request_id}`) : ''),
      cellClass: `${cellCenter} font-mono text-xs font-semibold`,
    },
    {
      headerName: t('vehicleInsurance.columns.type'),
      field: 'insurance_type',
      minWidth: 170,
      flex: 1.2,
      cellRenderer: ({ data }: ICellRendererParams<Offer>) =>
        data && (
          <div className="flex flex-col py-1.5 leading-tight">
            <span className="text-xs font-bold text-gray-900 dark:text-zinc-100">{data.insurance_type.label}</span>
            {data.repair_method && <span className="mt-1 text-[11px] text-muted-foreground">{data.repair_method.label}</span>}
          </div>
        ),
    },
    {
      headerName: t('vehicleInsurance.columns.total'),
      field: 'price',
      minWidth: 150,
      comparator: (a, b) => (a?.total_price ?? 0) - (b?.total_price ?? 0),
      cellRenderer: ({ data }: ICellRendererParams<Offer>) =>
        data && (
          <div className="flex flex-col py-1.5 leading-tight tabular-nums">
            <span className="text-xs font-bold text-gray-900 dark:text-zinc-100">
              {formatMoney(data.price.total_price, lang)} {t('vehicleInsurance.currency')}
            </span>
            {data.price.original_price && (
              <span className="mt-1 text-[11px] text-muted-foreground line-through">{formatMoney(data.price.original_price, lang)}</span>
            )}
          </div>
        ),
    },
    {
      headerName: t('vehicleInsurance.columns.validUntil'),
      field: 'valid_until',
      minWidth: 120,
      valueFormatter: ({ value }) => formatDay(value, lang),
      cellClass: `${cellCenter} text-xs`,
    },
    {
      headerName: t('vehicleInsurance.columns.status'),
      field: 'status',
      minWidth: 110,
      sortable: false,
      cellClass: cellCenter,
      cellRenderer: ({ data }: ICellRendererParams<Offer>) => data && <OfferStatusBadge value={data.status} />,
    },
    {
      headerName: t('vehicleInsurance.columns.actions'),
      sortable: false,
      resizable: false,
      minWidth: 130,
      maxWidth: 140,
      cellClass: cellCenter,
      cellRenderer: ({ data }: ICellRendererParams<Offer>) =>
        data && (
          <div className="flex items-center gap-1">
            <IconAction label={t('view')} onClick={() => onView(data)} icon={Eye} />
            {canChangeOffer(data) && (
              <>
                <IconAction label={t('vehicleInsurance.offers.edit')} onClick={() => onEdit(data)} icon={Pencil} />
                <IconAction label={t('vehicleInsurance.offers.withdraw')} onClick={() => onWithdraw(data)} icon={Undo2} danger />
              </>
            )}
          </div>
        ),
    },
  ]
}

function IconAction({
  label,
  onClick,
  icon: Icon,
  danger,
}: {
  label: string
  onClick: () => void
  icon: ElementType
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        // Keep the row's own click handler from firing too
        e.stopPropagation()
        onClick()
      }}
      className={
        danger
          ? 'flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30'
          : 'flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary'
      }
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
