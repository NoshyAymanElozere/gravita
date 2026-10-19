import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/misc'
import { cn } from '@/utils/utils'

export const card = 'rounded-2xl border border-border/60 bg-white shadow-xs dark:bg-zinc-900'

export function useIsRtl() {
  const { i18n } = useTranslation()
  return i18n.language === 'ar'
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  backTo,
  backLabel,
  badges,
  actions,
}: {
  icon: React.ElementType
  title: React.ReactNode
  subtitle?: React.ReactNode
  backTo?: string
  backLabel?: string
  badges?: React.ReactNode
  actions?: React.ReactNode
}) {
  const navigate = useNavigate()
  const isRtl = useIsRtl()
  return (
    <div className={cn(card, 'p-5')}>
      {backTo && (
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
          {backLabel}
        </button>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-2xs">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900 dark:text-zinc-100 md:text-xl">{title}</h1>
              {badges}
            </div>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5 md:justify-end">{actions}</div>}
      </div>
    </div>
  )
}

export function Section({
  title,
  icon: Icon,
  hint,
  action,
  className,
  children,
}: {
  title: React.ReactNode
  icon?: React.ElementType
  hint?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn(card, 'p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-zinc-100">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            {title}
          </h2>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function InfoGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2',
        cols === 3 && 'lg:grid-cols-3',
        cols === 4 && 'lg:grid-cols-4'
      )}
    >
      {children}
    </dl>
  )
}

export function Info({
  label,
  value,
  ltr,
  icon: Icon,
}: {
  label: React.ReactNode
  value: React.ReactNode
  /** Numbers / IDs: kept left-to-right but still aligned with the page's reading edge */
  ltr?: boolean
  icon?: React.ElementType
}) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div className="min-w-0 rounded-xl border border-border/50 bg-gray-50/70 px-3.5 py-3 transition-colors hover:border-primary/25 dark:bg-zinc-800/40">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />}
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-bold text-gray-900 dark:text-zinc-100">
        {empty ? (
          <span className="font-medium text-muted-foreground">—</span>
        ) : ltr ? (
          <span dir="ltr" className="inline-block font-mono tracking-wide">
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

/** Key figure shown in the summary strip under a page header */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
}: {
  icon: React.ElementType
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: 'primary' | 'emerald' | 'amber' | 'sky'
}) {
  return (
    <div className={cn(card, 'flex items-center gap-3.5 p-4')}>
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          tone === 'primary' && 'bg-primary/10 text-primary',
          tone === 'emerald' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
          tone === 'amber' && 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
          tone === 'sky' && 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-[15px] font-bold text-gray-900 dark:text-zinc-100">{value}</p>
        {hint && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

/** Saudi-style plate: letters | numbers, each spaced out, laid out RTL in both languages */
export function PlateChip({ letters, numbers }: { letters: string | null; numbers: string | null }) {
  if (!letters && !numbers) return null
  const spaced = (s: string | null) => (s ?? '').replace(/\s+/g, '').split('').join(' ')
  return (
    <span
      dir="rtl"
      className="inline-flex items-stretch overflow-hidden rounded-md border-2 border-gray-800 bg-white text-sm font-bold leading-none text-gray-900 shadow-2xs dark:border-zinc-300 dark:bg-zinc-100"
    >
      <span className="border-e-2 border-gray-800 px-2 py-1 dark:border-zinc-300">{spaced(letters)}</span>
      <span dir="ltr" className="px-2 py-1 font-mono tracking-wider">
        {spaced(numbers)}
      </span>
    </span>
  )
}

export function Notice({ tone = 'muted', children }: { tone?: 'muted' | 'danger' | 'warning'; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold',
        tone === 'muted' && 'border-border/60 bg-gray-50 text-gray-600 dark:bg-zinc-800/50 dark:text-zinc-300',
        tone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
      )}
    >
      <AlertCircle className="mt-px h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function PageError({ notFound, message, onRetry }: { notFound?: boolean; message: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  const Icon = notFound ? SearchX : AlertCircle
  return (
    <div className={cn(card, 'flex flex-col items-center gap-3 p-10 text-center')}>
      <Icon className={cn('h-8 w-8', notFound ? 'text-muted-foreground' : 'text-rose-500')} />
      <p className="font-semibold text-gray-900 dark:text-zinc-100">{message}</p>
      {onRetry && !notFound && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw /> {t('vehicleInsurance.retry')}
        </Button>
      )}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

export const isNotFound = (err: unknown) => (err as { response?: { status?: number } })?.response?.status === 404
