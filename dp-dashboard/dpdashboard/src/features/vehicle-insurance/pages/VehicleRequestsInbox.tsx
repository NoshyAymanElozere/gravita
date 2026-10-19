import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Inbox, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { cn } from '@/utils/utils'
import { useInboxRequests } from '../api/useVehicleInsurance'
import { getInboxColumnDefs } from '../components/ColumnDefs'
import { PageHeader, card, useIsRtl } from '../components/Blocks'
import { DebouncedSearch, FilterSelect, StatusTabs } from '../components/ListControls'
import {
  INSURANCE_TYPES,
  REQUEST_STATUS_FILTERS,
  RESPONSE_TABS,
  type InboxFilters,
  type InsuranceType,
  type MyResponseStatus,
  type RequestStatus,
} from '../types/vehicleInsurance.types'

const PER_PAGE = 15

const ROW_CLASS = ['cursor-pointer', 'transition-colors']

/** Filters live in the URL so the tab / page survive opening a request and coming back */
function useInboxFilters(): [InboxFilters, (patch: Partial<InboxFilters>) => void] {
  const [params, setParams] = useSearchParams()
  const filters: InboxFilters = {
    response_status: (RESPONSE_TABS.find((s) => s === params.get('tab')) ?? 'pending') as MyResponseStatus,
    status: (params.get('status') ?? '') as RequestStatus | '',
    insurance_type: (params.get('type') ?? '') as InsuranceType | '',
    search: params.get('q') ?? '',
    page: Math.max(1, Number(params.get('page')) || 1),
    per_page: PER_PAGE,
  }

  const update = React.useCallback(
    (patch: Partial<InboxFilters>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const set = (key: string, v: string | number | undefined) => (v ? next.set(key, String(v)) : next.delete(key))
          if ('response_status' in patch) set('tab', patch.response_status)
          if ('status' in patch) set('status', patch.status)
          if ('insurance_type' in patch) set('type', patch.insurance_type)
          if ('search' in patch) set('q', patch.search)
          // Any filter change goes back to the first page
          set('page', 'page' in patch && patch.page! > 1 ? patch.page : undefined)
          return next
        },
        { replace: true }
      ),
    [setParams]
  )

  return [filters, update]
}

export default function VehicleRequestsInbox() {
  const { t, i18n } = useTranslation()
  const isRtl = useIsRtl()
  const navigate = useNavigate()
  const [filters, setFilters] = useInboxFilters()
  const { data, isLoading, isFetching, refetch } = useInboxRequests(filters)

  const meta = data?.meta
  const columnDefs = React.useMemo(
    () => getInboxColumnDefs({ t, lang: i18n.language, onOpen: (r) => navigate(`/vehicle-requests/${r.id}`) }),
    [t, i18n.language, navigate]
  )
  const onSearch = React.useCallback((search: string) => setFilters({ search }), [setFilters])

  return (
    <div className="space-y-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        icon={Inbox}
        title={t('vehicleInsurance.inbox.title')}
        subtitle={t('vehicleInsurance.inbox.subtitle')}
        actions={
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 gap-2 rounded-xl border-transparent bg-primary/10 px-4 font-bold text-primary hover:bg-primary/20"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            {t('vehicleInsurance.refresh')}
          </Button>
        }
      />

      <div className={cn(card, 'flex flex-col gap-3 p-3.5 xl:flex-row xl:items-center xl:justify-between')}>
        <StatusTabs
          value={filters.response_status}
          onChange={(response_status) => setFilters({ response_status })}
          options={RESPONSE_TABS.map((s) => ({ value: s, label: t(`vehicleInsurance.inbox.tabs.${s}`) }))}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <DebouncedSearch value={filters.search} onChange={onSearch} placeholder={t('vehicleInsurance.inbox.searchPlaceholder')} />
          <FilterSelect
            value={filters.status}
            onChange={(status) => setFilters({ status })}
            placeholder={t('vehicleInsurance.inbox.allStatuses')}
            options={REQUEST_STATUS_FILTERS.map((s) => ({ value: s, label: t(`vehicleInsurance.requestStatus.${s}`) }))}
          />
          <FilterSelect
            value={filters.insurance_type}
            onChange={(insurance_type) => setFilters({ insurance_type })}
            placeholder={t('vehicleInsurance.inbox.allTypes')}
            options={INSURANCE_TYPES.map((s) => ({ value: s, label: t(`vehicleInsurance.insuranceType.${s}`) }))}
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-xs">
        <CardContent className="p-5">
          <GenericDataGrid
            rowData={data?.data ?? []}
            columnDefs={columnDefs}
            loading={isLoading}
            height={600}
            rowHeight={52}
            headerHeight={44}
            defaultColDef={{ sortable: false }}
            getRowId={({ data: row }) => String(row.id)}
            getRowClass={() => ROW_CLASS}
            onRowClicked={({ data: row }) => row && navigate(`/vehicle-requests/${row.id}`)}
            isServerSide
            currentPage={meta?.current_page ?? 1}
            totalPages={meta?.last_page ?? 1}
            onPageChange={(page) => setFilters({ page })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
