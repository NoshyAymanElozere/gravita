import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/utils/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from './misc'

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  format?: 'currency' | 'number' | 'percent' | 'raw'
  icon?: React.ReactNode
  iconBg?: string
  loading?: boolean
  trend?: 'up-good' | 'down-good'
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  format = 'raw',
  icon,
  iconBg = 'bg-primary/10',
  loading,
  trend = 'up-good',
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </Card>
    )
  }

  const formattedValue =
    typeof value === 'number'
      ? format === 'currency'
        ? formatCurrency(value)
        : format === 'number'
        ? formatNumber(value)
        : format === 'percent'
        ? `${value}%`
        : String(value)
      : value

  const isPositive = (change ?? 0) >= 0
  const isGood = trend === 'up-good' ? isPositive : !isPositive
  const changeColor = isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
  const TrendIcon = isPositive ? TrendingUp : change === 0 ? Minus : TrendingDown

  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{formattedValue}</p>
          {change !== undefined && (
            <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', changeColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {isPositive ? '+' : ''}
                {change}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Mini Stat ────────────────────────────────────────────────────────────────

interface MiniStatProps {
  label: string
  value: string | number
  className?: string
}

export function MiniStat({ label, value, className }: MiniStatProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
