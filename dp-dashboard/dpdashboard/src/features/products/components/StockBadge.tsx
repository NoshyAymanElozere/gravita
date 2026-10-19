import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'
import type { StockStatus } from '@/types/api'

const CLS: Record<StockStatus, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  low_stock: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  out_of_stock: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
}

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold', CLS[status] ?? CLS.in_stock, className)}>
      {t(`stockStatus.${status}`)}
    </span>
  )
}
