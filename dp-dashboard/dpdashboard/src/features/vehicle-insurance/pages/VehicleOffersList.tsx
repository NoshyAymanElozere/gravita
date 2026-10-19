import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileSignature, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { cn } from '@/utils/utils'
import { useMyOffers } from '../api/useVehicleInsurance'
import { getOfferColumnDefs } from '../components/ColumnDefs'
import { PageHeader, card, useIsRtl } from '../components/Blocks'
import { FilterSelect, StatusTabs } from '../components/ListControls'
import { WithdrawDialog } from '../components/ActionDialogs'
import {
  INSURANCE_TYPES,
  OFFER_TABS,
  type InsuranceType,
  type Offer,
  type OfferFilters,
  type OfferStatus,
} from '../types/vehicleInsurance.types'

const PER_PAGE = 15

export default function VehicleOffersList() {
  const { t, i18n } = useTranslation()
  const isRtl = useIsRtl()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [withdrawing, setWithdrawing] = React.useState<Offer | null>(null)

  const filters: OfferFilters = {
    status: (OFFER_TABS.find((s) => s === params.get('tab')) ?? 'active') as OfferStatus,
    insurance_type: (params.get('type') ?? '') as InsuranceType | '',
    request_id: params.get('request') ?? '',
    page: Math.max(1, Number(params.get('page')) || 1),
    per_page: PER_PAGE,
  }

  const setFilter = (key: 'tab' | 'type' | 'page', value: string | number) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value && !(key === 'page' && value === 1)) next.set(key, String(value))
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true }
    )

  const { data, isLoading, isFetching, refetch } = useMyOffers(filters)
  const meta = data?.meta

  const columnDefs = React.useMemo(
    () =>
      getOfferColumnDefs({
        t,
        lang: i18n.language,
        onView: (o) => navigate(`/vehicle-offers/${o.id}`),
        onEdit: (o) => navigate(`/vehicle-offers/${o.id}/edit`),
        onWithdraw: setWithdrawing,
      }),
    [t, i18n.language, navigate]
  )

  return (
    <div className="space-y-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        icon={FileSignature}
        title={t('vehicleInsurance.offers.title')}
        subtitle={t('vehicleInsurance.offers.subtitle')}
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

      <div className={cn(card, 'flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between')}>
        <StatusTabs
          value={filters.status}
          onChange={(s) => setFilter('tab', s)}
          options={OFFER_TABS.map((s) => ({ value: s, label: t(`vehicleInsurance.offers.tabs.${s}`) }))}
        />
        <FilterSelect
          value={filters.insurance_type}
          onChange={(v) => setFilter('type', v)}
          placeholder={t('vehicleInsurance.inbox.allTypes')}
          options={INSURANCE_TYPES.map((s) => ({ value: s, label: t(`vehicleInsurance.insuranceType.${s}`) }))}
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-xs">
        <CardContent className="p-5">
          <GenericDataGrid
            rowData={data?.data ?? []}
            columnDefs={columnDefs}
            loading={isLoading}
            height={560}
            rowHeight={62}
            defaultColDef={{ sortable: false }}
            getRowId={({ data: row }) => String(row.id)}
            onViewRow={(row) => navigate(`/vehicle-offers/${row.id}`)}
            isServerSide
            currentPage={meta?.current_page ?? 1}
            totalPages={meta?.last_page ?? 1}
            onPageChange={(page) => setFilter('page', page)}
          />
        </CardContent>
      </Card>

      <WithdrawDialog offer={withdrawing} onClose={() => setWithdrawing(null)} />
    </div>
  )
}
