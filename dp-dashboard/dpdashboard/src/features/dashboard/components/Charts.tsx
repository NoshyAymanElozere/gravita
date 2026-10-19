import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { formatMoney, formatNum, formatShortDate } from '@/utils/format'
import { useTheme } from '@/hooks/useTheme'
import { ORDER_STATUSES, type AdminStats, type OrderStatus } from '@/types/api'

// Brand palette (storefront tokens) — one hue per chart, so no categorical palette is needed.
// SVG presentation attributes don't resolve CSS variables reliably, so pick hex values per theme.
function useChartColors() {
  useTheme() // re-render on theme change
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  return dark
    ? { brand: '#BAD1B8', sage: '#748972', grid: '#27272a', axis: '#a1a1aa', alert: '#F59E0B', dot: '#131316' }
    : { brand: '#374037', sage: '#748972', grid: '#e4e4e7', axis: '#71717a', alert: '#B45309', dot: '#ffffff' }
}

/** Fill every day of the period so gaps show as zero instead of being interpolated */
export function fillDays(daily: AdminStats['dailySales'], days: number) {
  const byDate = new Map(daily.map((d) => [d.date, d]))
  const out: AdminStats['dailySales'] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    const key = d.toISOString().slice(0, 10)
    out.push(byDate.get(key) ?? { date: key, revenue: 0, orders: 0 })
  }
  return out
}

function ChartTooltip({ active, payload, label, kind }: TooltipProps<number, string> & { kind: 'money' | 'count' }) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const value = Number(payload[0].value ?? 0)
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-0.5 text-muted-foreground">{formatShortDate(String(label))}</p>
      <p className="font-semibold text-foreground">
        {kind === 'money' ? formatMoney(value) : `${formatNum(value)} ${t('overview.ordersUnit')}`}
      </p>
    </div>
  )
}


export function RevenueChart({ data }: { data: AdminStats['dailySales'] }) {
  const { i18n } = useTranslation()
  const c = useChartColors()
  const tickStyle = { fontSize: 11, fill: c.axis }
  const rtl = i18n.language === 'ar'
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.sage} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.sage} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} tick={tickStyle} tickLine={false} axisLine={false} minTickGap={24} reversed={rtl} />
        <YAxis
          tickFormatter={(v) => formatNum(v, { notation: 'compact' })}
          tick={tickStyle}
          tickLine={false}
          axisLine={false}
          width={44}
          orientation={rtl ? 'right' : 'left'}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip kind="money" />} cursor={{ stroke: c.sage, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="revenue" stroke={c.brand} strokeWidth={2} fill="url(#revFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OrdersChart({ data }: { data: AdminStats['dailySales'] }) {
  const { i18n } = useTranslation()
  const c = useChartColors()
  const tickStyle = { fontSize: 11, fill: c.axis }
  const rtl = i18n.language === 'ar'
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} tick={tickStyle} tickLine={false} axisLine={false} minTickGap={24} reversed={rtl} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={32} allowDecimals={false} orientation={rtl ? 'right' : 'left'} />
        <Tooltip content={<ChartTooltip kind="count" />} cursor={{ fill: 'hsl(var(--accent))' }} />
        <Bar dataKey="orders" fill={c.sage} radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Orders by status — a single-hue horizontal bar chart (status is identity; the bar length is the magnitude) */
export function StatusBreakdown({ data, onSelect }: { data: AdminStats['ordersByStatus']; onSelect?: (s: OrderStatus) => void }) {
  const { t, i18n } = useTranslation()
  const c = useChartColors()
  const rtl = i18n.language === 'ar'
  const rows = ORDER_STATUSES.map((s) => ({ status: s, label: t(`orderStatus.${s}`), count: data[s] ?? 0 }))
  const highlight: OrderStatus[] = ['pending', 'return_requested']
  return (
    <ResponsiveContainer width="100%" height={ORDER_STATUSES.length * 34 + 8}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }} barCategoryGap={8}>
        <XAxis type="number" hide allowDecimals={false} reversed={rtl} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: c.axis }}
          tickLine={false}
          axisLine={false}
          width={118}
          orientation={rtl ? 'right' : 'left'}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--accent))' }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                <p className="text-muted-foreground">{payload[0].payload.label}</p>
                <p className="font-semibold">{formatNum(Number(payload[0].value))}</p>
              </div>
            ) : null
          }
        />
        <Bar
          dataKey="count"
          radius={rtl ? [4, 0, 0, 4] : [0, 4, 4, 0]}
          maxBarSize={20}
          minPointSize={2}
          label={{ position: rtl ? 'left' : 'right', fontSize: 11, fill: c.axis }}
          className={onSelect ? 'cursor-pointer' : undefined}
          onClick={(d: any) => onSelect?.(d?.payload?.status ?? d?.status)}
        >
          {rows.map((r) => (
            <Cell key={r.status} fill={highlight.includes(r.status) && r.count > 0 ? c.alert : c.brand} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
