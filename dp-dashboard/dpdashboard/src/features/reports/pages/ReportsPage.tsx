import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileBarChart,
  Banknote,
  ShoppingBag,
  Receipt,
  Package,
  Users,
  TicketPercent,
  Truck,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Skeleton } from '@/components/shared/misc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/utils/utils'
import { formatMoney, formatNum, pickLang } from '@/utils/format'
import { getApiErrorMessage } from '@/services/axios'
import { ORDER_STATUSES, type OrderStatus, type PaymentMethod } from '@/types/api'
import { OrderStatusBadge } from '@/features/orders/lib/status'
import { RevenueChart } from '@/features/dashboard/components/Charts'
import { useSalesReport, downloadReportCsv } from '../api/useReport'

const iso = (d: Date) => d.toISOString().slice(0, 10)

type PresetId = 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth'

function presetRange(id: PresetId): { from: string; to: string } {
  const now = new Date()
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  switch (id) {
    case 'last7':
      return { from: iso(new Date(today.getTime() - 6 * 86400000)), to: iso(today) }
    case 'last30':
      return { from: iso(new Date(today.getTime() - 29 * 86400000)), to: iso(today) }
    case 'last90':
      return { from: iso(new Date(today.getTime() - 89 * 86400000)), to: iso(today) }
    case 'thisMonth':
      return { from: iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))), to: iso(today) }
    case 'lastMonth':
      return {
        from: iso(new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1))),
        to: iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0))),
      }
  }
}

/** Fill every day between from and to so the chart shows gaps as zero */
function fillRange(byDay: Array<{ date: string; revenue: number; orders: number }>, from: string, to: string) {
  const byDate = new Map(byDay.map((d) => [d.date, d]))
  const out: Array<{ date: string; revenue: number; orders: number }> = []
  const end = new Date(`${to}T00:00:00Z`).getTime()
  for (let t = new Date(`${from}T00:00:00Z`).getTime(); t <= end; t += 86400000) {
    const key = new Date(t).toISOString().slice(0, 10)
    out.push(byDate.get(key) ?? { date: key, revenue: 0, orders: 0 })
  }
  return out
}

const PRESETS: PresetId[] = ['last7', 'last30', 'last90', 'thisMonth', 'lastMonth']

export default function ReportsPage() {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<PresetId | 'custom'>('last30')
  const [range, setRange] = useState(() => presetRange('last30'))
  const [exporting, setExporting] = useState(false)

  const validRange = !!range.from && !!range.to && range.from <= range.to
  const { data: report, isLoading } = useSalesReport(range.from, range.to)

  const daily = useMemo(
    () => (report && validRange ? fillRange(report.byDay, range.from, range.to) : []),
    [report, range, validRange]
  )
  const hasSales = (report?.summary.orders ?? 0) > 0

  const pickPreset = (id: PresetId) => {
    setPreset(id)
    setRange(presetRange(id))
  }

  const setCustom = (patch: Partial<{ from: string; to: string }>) => {
    setPreset('custom')
    setRange((r) => ({ ...r, ...patch }))
  }

  const onExport = async () => {
    setExporting(true)
    try {
      await downloadReportCsv(range.from, range.to)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const statuses = ORDER_STATUSES.filter((s) => report?.byStatus[s])
  const paymentMethods = Object.keys(report?.byPaymentMethod ?? {}) as PaymentMethod[]

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={FileBarChart}
        title={t('reports.title')}
        description={t('reports.subtitle')}
        actions={
          <Button onClick={onExport} loading={exporting} disabled={!validRange || !hasSales} title={t('reports.exportHint')}>
            <Download className="h-4 w-4" />
            {t('reports.exportCsv')}
          </Button>
        }
      />

      {/* Period picker */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-xl border border-border bg-card p-1 shadow-xs" role="tablist">
          {PRESETS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={preset === p}
              onClick={() => pickPreset(p)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                preset === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`reports.${p}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={range.from}
            max={range.to || undefined}
            onChange={(e) => setCustom({ from: e.target.value })}
            className="w-40"
            aria-label={t('common.from')}
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            value={range.to}
            min={range.from || undefined}
            onChange={(e) => setCustom({ to: e.target.value })}
            className="w-40"
            aria-label={t('common.to')}
          />
        </div>
        {!validRange && <p className="text-xs font-medium text-rose-600">{t('reports.invalidRange')}</p>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={isLoading} title={t('reports.revenue')} value={formatMoney(report?.summary.revenue)} icon={<Banknote className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('reports.orders')} value={formatNum(report?.summary.orders)} icon={<ShoppingBag className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('reports.aov')} value={formatMoney(report?.summary.averageOrderValue)} icon={<Receipt className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('reports.unitsSold')} value={formatNum(report?.summary.unitsSold)} icon={<Package className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard loading={isLoading} title={t('reports.newCustomers')} value={formatNum(report?.summary.newCustomers)} icon={<Users className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('reports.discounts')} value={formatMoney(report?.summary.discounts)} icon={<TicketPercent className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('reports.shippingCollected')} value={formatMoney(report?.summary.shippingCollected)} icon={<Truck className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('reports.revenueNote')}</p>

      {/* Revenue chart */}
      <div className="mt-6">
        <SectionCard title={t('reports.revenueOverTime')}>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : hasSales ? (
            <RevenueChart data={daily} />
          ) : (
            <EmptyState icon={Banknote} title={t('reports.noData')} className="h-[260px]" />
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* By payment method */}
        <SectionCard title={t('reports.byPaymentMethod')} bodyClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('orders.paymentMethod')}</TableHead>
                <TableHead className="text-end">{t('reports.orders')}</TableHead>
                <TableHead className="text-end">{t('reports.revenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((m) => (
                <TableRow key={m}>
                  <TableCell className="font-medium text-foreground">{t(`paymentMethod.${m}`)}</TableCell>
                  <TableCell className="text-end tabular">{formatNum(report?.byPaymentMethod[m]?.count)}</TableCell>
                  <TableCell className="text-end font-semibold tabular">{formatMoney(report?.byPaymentMethod[m]?.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && !paymentMethods.length && <EmptyState icon={Banknote} title={t('reports.noData')} />}
        </SectionCard>

        {/* By status */}
        <SectionCard title={t('reports.byStatus')} bodyClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('common.status')}</TableHead>
                <TableHead className="text-end">{t('reports.orders')}</TableHead>
                <TableHead className="text-end">{t('reports.revenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((s) => (
                <TableRow key={s}>
                  <TableCell>
                    <OrderStatusBadge status={s as OrderStatus} />
                  </TableCell>
                  <TableCell className="text-end tabular">{formatNum(report?.byStatus[s]?.count)}</TableCell>
                  <TableCell className="text-end font-semibold tabular">{formatMoney(report?.byStatus[s]?.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && !statuses.length && <EmptyState icon={ShoppingBag} title={t('reports.noData')} />}
        </SectionCard>
      </div>

      {/* Top sellers */}
      <div className="mt-4">
        <SectionCard title={t('reports.topProducts')} bodyClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('reports.product')}</TableHead>
                <TableHead className="text-start">{t('orders.bundle')} / {t('reports.product')}</TableHead>
                <TableHead className="text-end">{t('reports.qty')}</TableHead>
                <TableHead className="text-end">{t('reports.revenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.topProducts.map((p, i) => (
                <TableRow key={`${p.nameEn}-${i}`}>
                  <TableCell className="font-medium text-foreground">{pickLang(p, 'name')}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.itemType === 'bundle' ? t('orders.bundle') : t('reports.product')}
                  </TableCell>
                  <TableCell className="text-end tabular">{formatNum(p.quantity)}</TableCell>
                  <TableCell className="text-end font-semibold tabular">{formatMoney(p.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && !report?.topProducts.length && <EmptyState icon={Package} title={t('reports.noData')} />}
        </SectionCard>
      </div>
    </div>
  )
}
