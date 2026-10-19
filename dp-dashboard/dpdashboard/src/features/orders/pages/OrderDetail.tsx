import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Copy, Mail, MapPin, Phone, User, Undo2, Truck, StickyNote, Boxes } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { Thumb } from '@/components/shared/thumb'
import { Skeleton } from '@/components/shared/misc'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { formatDate, formatMoney, formatNum } from '@/utils/format'
import type { Order, OrderItem } from '@/types/api'
import { useOrder } from '../api/useOrders'
import { ORDER_STATUS_META, OrderStatusBadge, PaymentStatusBadge } from '../lib/status'
import { StatusUpdateCard } from '../components/StatusUpdateCard'

function Row({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 py-1.5 text-sm', strong && 'border-t border-border pt-3 text-base font-bold')}>
      <span className={strong ? '' : 'text-muted-foreground'}>{label}</span>
      <span className={cn('tabular', negative && 'text-emerald-600 dark:text-emerald-400')}>{value}</span>
    </div>
  )
}

function ItemRow({ item }: { item: OrderItem }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const isBundle = item.itemType === 'bundle'
  const ar = i18n.language === 'ar'
  const name = (ar ? item.nameAr : item.nameEn) || item.nameEn || item.nameAr
  const productId = typeof item.product === 'object' && item.product ? item.product._id : typeof item.product === 'string' ? item.product : null
  const bundleId = typeof item.bundle === 'object' && item.bundle ? item.bundle._id : typeof item.bundle === 'string' ? item.bundle : null
  const snap = item.bundleSnapshot

  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <Thumb src={item.image} className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isBundle ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-cream px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary dark:bg-accent dark:text-accent-foreground">
                <Boxes className="h-3 w-3" />
                {t('orders.bundle')}
              </span>
            ) : null}
            {productId || bundleId ? (
              <Link to={isBundle ? `/bundles/${bundleId}/edit` : `/products/${productId}/edit`} className="font-medium hover:underline">
                {name}
              </Link>
            ) : (
              <span className="font-medium">{name}</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.size && <span>{item.size} · </span>}
            {formatMoney(item.unitPrice)} × {formatNum(item.quantity)}
          </p>
          {isBundle && snap && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-sage hover:text-brand-primary dark:hover:text-brand-sage-light">
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
              {open ? t('orders.hideComponents') : t('orders.showComponents', { count: snap.items.length })}
            </button>
          )}
        </div>
        <span className="shrink-0 font-semibold tabular">{formatMoney(item.lineTotal)}</span>
      </div>
      {isBundle && snap && open && (
        <div className="ms-[68px] mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t('bundles.originalPrice')}: <b className="text-foreground">{formatMoney(snap.originalPrice)}</b>
            </span>
            <span>
              {t('bundles.discount')}: <b className="text-foreground">{snap.discountPercentage}%</b>
            </span>
          </div>
          <ol className="space-y-2">
            {snap.items.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-brand-cream">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {(ar ? c.nameAr : c.nameEn) || c.nameEn} <span className="text-muted-foreground">× {c.quantity}</span>
                  </p>
                  {(c.stepEn || c.stepAr) && <p className="text-xs text-muted-foreground">{ar ? c.stepAr || c.stepEn : c.stepEn || c.stepAr}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  )
}

function Timeline({ order }: { order: Order }) {
  const { t } = useTranslation()
  const history = [...(order.statusHistory ?? [])].sort((a, b) => +new Date(b.at) - +new Date(a.at))
  if (!history.length) return <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
  return (
    <ol className="relative space-y-5 border-s border-border ps-5">
      {history.map((h, i) => {
        const meta = ORDER_STATUS_META[h.status] ?? ORDER_STATUS_META.pending
        return (
          <li key={h._id ?? i} className="relative">
            <span className={cn('absolute -start-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card', meta.dot)} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{t(`orderStatus.${h.status}`)}</span>
              {i === 0 && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{t('orders.current')}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(h.at, true)}</p>
            {h.note && <p className="mt-1 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs">{h.note}</p>}
          </li>
        )
      })}
    </ol>
  )
}

export default function OrderDetail() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useOrder(id)
  const order = data?.order

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }
  if (isError || !order) {
    return <EmptyState title={t('orders.notFound')} action={<Button asChild variant="outline"><Link to="/orders">{t('orders.backToOrders')}</Link></Button>} />
  }

  const user = typeof order.user === 'object' && order.user ? order.user : null
  const addr = order.shippingAddress
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success(t('common.copied')))

  return (
    <div className="animate-fade-in">
      <PageHeader
        backTo="/orders"
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span dir="ltr">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={t('orders.placedOn', { date: formatDate(order.createdAt, true) })}
        actions={
          <Button variant="outline" size="sm" onClick={() => copy(order.orderNumber)}>
            <Copy className="h-3.5 w-3.5" />
            {t('orders.copyNumber')}
          </Button>
        }
      />

      {order.status === 'return_requested' && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          <Undo2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t('orders.returnRequested')}</p>
            {order.returnReason && <p className="mt-0.5 text-sm">{order.returnReason}</p>}
          </div>
        </div>
      )}
      {order.status === 'cancelled' && order.cancelReason && (
        <div className="mb-4 rounded-2xl border border-border bg-muted/50 p-4 text-sm">
          <span className="font-semibold">{t('orders.cancelReason')}:</span> {order.cancelReason}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={t('orders.itemsCount', { count: order.items.length })} bodyClassName="py-1">
            <ul className="divide-y divide-border">
              {order.items.map((item, i) => (
                <ItemRow key={item._id ?? i} item={item} />
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={t('orders.summary')}>
            <Row label={t('orders.subtotal')} value={formatMoney(order.subtotal)} />
            {order.discount > 0 && (
              <Row
                label={order.coupon ? t('orders.discountWithCode', { code: order.coupon.code }) : t('orders.discount')}
                value={`− ${formatMoney(order.discount)}`}
                negative
              />
            )}
            <Row label={t('orders.shipping')} value={order.shippingFee ? formatMoney(order.shippingFee) : t('orders.free')} />
            {order.codFee > 0 && <Row label={t('orders.codFee')} value={formatMoney(order.codFee)} />}
            <Row label={t('orders.total')} value={formatMoney(order.total)} strong />
            {order.coupon && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t('orders.couponApplied')}: <b className="font-mono text-foreground">{order.coupon.code}</b> (
                {order.coupon.discountType === 'percentage' ? `${order.coupon.value}%` : formatMoney(order.coupon.value)})
              </p>
            )}
          </SectionCard>

          <SectionCard title={t('orders.timeline')}>
            <Timeline order={order} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <StatusUpdateCard order={order} allowed={data.allowedTransitions} />

          <SectionCard title={t('orders.customer')}>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                {user ? (
                  <Link to={`/customers/${user._id}`} className="font-medium hover:underline">
                    {order.contact?.name || user.name}
                  </Link>
                ) : (
                  <span className="font-medium">{order.contact?.name || '—'}</span>
                )}
              </li>
              {(order.contact?.email || user?.email) && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${order.contact?.email || user?.email}`} className="truncate hover:underline" dir="ltr">
                    {order.contact?.email || user?.email}
                  </a>
                </li>
              )}
              {(order.contact?.phone || user?.phone) && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.contact?.phone || user?.phone}`} className="hover:underline" dir="ltr">
                    {order.contact?.phone || user?.phone}
                  </a>
                </li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title={t('orders.shippingAddress')}>
            {addr ? (
              <div className="flex gap-2.5 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="font-medium">{addr.fullName}</p>
                  <p dir="ltr" className="text-muted-foreground rtl:text-right">{addr.phone}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</p>
                  {addr.country && <p>{addr.country}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </SectionCard>

          <SectionCard title={t('orders.paymentAndDelivery')}>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t('orders.paymentMethod')}</dt>
                <dd className="font-medium">{t(`paymentMethod.${order.paymentMethod}`)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t('orders.paymentStatus')}</dt>
                <dd>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  {t('orders.trackingNumber')}
                </dt>
                <dd className="font-mono text-xs font-semibold" dir="ltr">
                  {order.trackingNumber || '—'}
                </dd>
              </div>
              {order.estimatedDelivery && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('orders.estimatedDelivery')}</dt>
                  <dd>{formatDate(order.estimatedDelivery)}</dd>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">{t('orders.deliveredAt')}</dt>
                  <dd>{formatDate(order.deliveredAt, true)}</dd>
                </div>
              )}
            </dl>
          </SectionCard>

          {order.notes && (
            <SectionCard title={<span className="flex items-center gap-2"><StickyNote className="h-4 w-4" />{t('orders.customerNotes')}</span>}>
              <p className="whitespace-pre-line text-sm">{order.notes}</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
