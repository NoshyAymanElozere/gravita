import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  XCircle,
  Undo2,
  RotateCcw,
  Cog,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/utils'
import type { OrderStatus, PaymentStatus } from '@/types/api'

export const ORDER_STATUS_META: Record<OrderStatus, { cls: string; dot: string; icon: LucideIcon }> = {
  pending: { cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20', dot: 'bg-amber-500', icon: Clock },
  confirmed: { cls: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20', dot: 'bg-sky-500', icon: CheckCircle2 },
  processing: { cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20', dot: 'bg-indigo-500', icon: Cog },
  shipped: { cls: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20', dot: 'bg-violet-500', icon: Truck },
  delivered: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20', dot: 'bg-emerald-500', icon: PackageCheck },
  cancelled: { cls: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20', dot: 'bg-zinc-400', icon: XCircle },
  return_requested: { cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20', dot: 'bg-rose-500', icon: Undo2 },
  returned: { cls: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20', dot: 'bg-orange-500', icon: RotateCcw },
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useTranslation()
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_META.pending
  const Icon = meta.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', meta.cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {t(`orderStatus.${status}`)}
    </span>
  )
}

const PAYMENT_STATUS_CLS: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  refunded: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-300',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', PAYMENT_STATUS_CLS[status])}>
      {t(`paymentStatus.${status}`)}
    </span>
  )
}
