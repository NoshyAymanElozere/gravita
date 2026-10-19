import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  ShoppingBag,
  Receipt,
  Users,
  Package,
  Boxes,
  LayoutDashboard,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { Thumb } from '@/components/shared/thumb'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/shared/misc'
import { cn } from '@/utils/utils'
import { formatDate, formatMoney, formatNum, pickLang } from '@/utils/format'
import { useStats } from '../api/useStats'
import { fillDays, OrdersChart, RevenueChart, StatusBreakdown } from '../components/Charts'
import { useOrderList } from '@/features/orders/api/useOrders'
import { OrderStatusBadge } from '@/features/orders/lib/status'
import type { Order } from '@/types/api'

const PERIODS = [7, 30, 90] as const

function customerName(o: Order) {
  return o.contact?.name || (typeof o.user === 'object' && o.user ? o.user.name : '') || '—'
}

export default function Overview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30)
  const { data: stats, isLoading, isFetching, refetch } = useStats(days)
  const recent = useOrderList({ limit: 5 })

  const daily = useMemo(() => (stats ? fillDays(stats.dailySales, days) : []), [stats, days])
  const hasSales = daily.some((d) => d.orders > 0)

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={LayoutDashboard}
        title={t('overview.title')}
        description={t('overview.subtitle')}
        actions={
          <>
            <div className="flex rounded-xl border border-border bg-card p-1 shadow-xs" role="tablist">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={days === p}
                  onClick={() => setDays(p)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                    days === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('overview.lastDays', { count: p })}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()} aria-label={t('common.refresh')}>
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard loading={isLoading} title={t('overview.revenue')} value={formatMoney(stats?.revenue.total)} icon={<Banknote className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('overview.orders')} value={formatNum(stats?.revenue.orders)} icon={<ShoppingBag className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('overview.aov')} value={formatMoney(stats?.revenue.averageOrderValue)} icon={<Receipt className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('overview.customers')} value={formatNum(stats?.totals.users)} icon={<Users className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('overview.activeProducts')} value={formatNum(stats?.totals.products)} icon={<Package className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard loading={isLoading} title={t('overview.activeBundles')} value={formatNum(stats?.totals.bundles)} icon={<Boxes className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('overview.revenueNote')}</p>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title={t('overview.revenueOverTime')} description={t('overview.lastDays', { count: days })}>
          {isLoading ? <Skeleton className="h-[260px] w-full" /> : hasSales ? <RevenueChart data={daily} /> : <EmptyState icon={Banknote} title={t('overview.noSales')} className="h-[260px]" />}
        </SectionCard>
        <SectionCard title={t('overview.ordersOverTime')} description={t('overview.lastDays', { count: days })}>
          {isLoading ? <Skeleton className="h-[260px] w-full" /> : hasSales ? <OrdersChart data={daily} /> : <EmptyState icon={ShoppingBag} title={t('overview.noSales')} className="h-[260px]" />}
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title={t('overview.ordersByStatus')} description={t('overview.allTime')}>
          {isLoading || !stats ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <StatusBreakdown data={stats.ordersByStatus} onSelect={(s) => navigate(`/orders?status=${s}`)} />
          )}
        </SectionCard>

        <SectionCard
          title={t('overview.topProducts')}
          description={t('overview.bySoldCount')}
          className="xl:col-span-2"
          bodyClassName="p-0"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/products?sort=best-selling">
                {t('common.viewAll')} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('products.product')}</TableHead>
                <TableHead className="text-end">{t('products.sold')}</TableHead>
                <TableHead className="text-end">{t('products.stock')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : stats?.topProducts.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <Link to={`/products/${p._id}/edit`} className="flex items-center gap-3 hover:underline">
                          <Thumb src={p.image} className="h-9 w-9" />
                          <span className="line-clamp-1 font-medium text-foreground">{pickLang(p, 'name')}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-end font-semibold tabular">{formatNum(p.soldCount)}</TableCell>
                      <TableCell className="text-end tabular">{formatNum(p.stock)}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!isLoading && !stats?.topProducts.length && <EmptyState icon={Package} title={t('common.noData')} />}
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title={t('overview.recentOrders')}
          className="xl:col-span-2"
          bodyClassName="p-0"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/orders">
                {t('common.viewAll')} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('orders.order')}</TableHead>
                <TableHead className="text-start">{t('orders.customer')}</TableHead>
                <TableHead className="text-start">{t('common.status')}</TableHead>
                <TableHead className="text-end">{t('orders.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : recent.data?.items.map((o) => (
                    <TableRow key={o._id} className="cursor-pointer" onClick={() => navigate(`/orders/${o._id}`)}>
                      <TableCell>
                        <p className="font-semibold text-foreground" dir="ltr">
                          {o.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.createdAt, true)}</p>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{customerName(o)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-end font-semibold tabular text-foreground">{formatMoney(o.total)}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!recent.isLoading && !recent.data?.items.length && <EmptyState icon={ShoppingBag} title={t('orders.empty')} />}
        </SectionCard>

        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t('overview.lowStock')}
            </span>
          }
          description={t('overview.lowStockHint')}
          bodyClassName="p-2"
        >
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : stats?.lowStock.length ? (
            <ul className="max-h-[320px] divide-y divide-border overflow-y-auto">
              {stats.lowStock.map((p) => (
                <li key={p._id}>
                  <Link to={`/products/${p._id}/edit`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-accent">
                    <span className="line-clamp-1 text-sm font-medium">{pickLang(p, 'name')}</span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular',
                        p.stock === 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      )}
                    >
                      {p.stock} / {p.lowStockThreshold}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Package} title={t('overview.stockHealthy')} />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
