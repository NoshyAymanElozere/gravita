import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react'
import { SectionCard } from '@/components/shared/page-header'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/utils'
import type { Order, OrderStatus } from '@/types/api'
import { useUpdateOrderStatus } from '../api/useOrders'
import { ORDER_STATUS_META, OrderStatusBadge } from '../lib/status'

/** Offers only the transitions the API allows for the current status (`allowedTransitions`) */
export function StatusUpdateCard({ order, allowed }: { order: Order; allowed: OrderStatus[] }) {
  const { t, i18n } = useTranslation()
  const Arrow = i18n.language === 'ar' ? ArrowLeft : ArrowRight
  const [next, setNext] = useState<OrderStatus | null>(null)
  const [note, setNote] = useState('')
  const [tracking, setTracking] = useState(order.trackingNumber ?? '')
  const [eta, setEta] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const mutation = useUpdateOrderStatus(order._id)

  useEffect(() => {
    setNext(null)
    setNote('')
    setEta('')
    setTracking(order.trackingNumber ?? '')
  }, [order.status, order.trackingNumber])

  const submit = () => {
    if (!next) return
    mutation.mutate(
      {
        status: next,
        note: note.trim() || undefined,
        trackingNumber: tracking.trim() !== (order.trackingNumber ?? '') ? tracking.trim() : undefined,
        estimatedDelivery: eta ? new Date(eta).toISOString() : undefined,
      },
      { onSuccess: () => setConfirmCancel(false) }
    )
  }

  const onApply = () => (next === 'cancelled' ? setConfirmCancel(true) : submit())
  const showShipping = next === 'shipped'

  return (
    <SectionCard title={t('orders.updateStatus')} description={t('orders.updateStatusHint')}>
      {allowed.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          {t('orders.finalStatus')}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <OrderStatusBadge status={order.status} />
            <Arrow className="h-4 w-4 text-muted-foreground" />
            {next ? <OrderStatusBadge status={next} /> : <span className="text-muted-foreground">{t('orders.chooseNext')}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allowed.map((s) => {
              const meta = ORDER_STATUS_META[s]
              const Icon = meta.icon
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNext(s)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-start text-xs font-semibold transition-all',
                    next === s ? cn('ring-2 ring-offset-1 ring-offset-card', meta.cls) : 'border-border hover:bg-accent',
                    s === 'cancelled' && next !== s && 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(`orderStatus.${s}`)}
                </button>
              )
            })}
          </div>

          {next && (
            <div className="space-y-3 animate-fade-in">
              {(showShipping || order.trackingNumber) && (
                <div className="space-y-1.5">
                  <Label htmlFor="tracking">{t('orders.trackingNumber')}</Label>
                  <Input id="tracking" dir="ltr" value={tracking} maxLength={60} onChange={(e) => setTracking(e.target.value)} placeholder={t('orders.trackingAuto')} />
                </div>
              )}
              {showShipping && (
                <div className="space-y-1.5">
                  <Label htmlFor="eta">{t('orders.estimatedDelivery')}</Label>
                  <Input id="eta" type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="note">{next === 'cancelled' ? t('orders.cancelReason') : t('orders.noteOptional')}</Label>
                <Textarea id="note" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant={next === 'cancelled' ? 'destructive' : 'default'} onClick={onApply} loading={mutation.isPending}>
                  {t('orders.applyStatus')}
                </Button>
                <Button variant="outline" onClick={() => setNext(null)} disabled={mutation.isPending}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmAction
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t('orders.confirmCancelTitle')}
        description={t('orders.confirmCancelText', { number: order.orderNumber })}
        confirmLabel={t('orders.confirmCancel')}
        onConfirm={submit}
        loading={mutation.isPending}
      />
    </SectionCard>
  )
}
