import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CalendarClock, Check, Eye, FileSignature, Pencil, Plus, ShieldCheck, ShieldMinus, Undo2, Wrench, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { formatDateTime, formatDay, formatMoney } from '../lib/format'
import type { Offer } from '../types/vehicleInsurance.types'
import { OfferStatusBadge } from './StatusBadges'

export const offerRef = (o: Pick<Offer, 'id' | 'reference'>) => o.reference ?? `#${o.id}`

/** Whether the company may still edit / withdraw this offer */
export const canChangeOffer = (offer: Offer, requestOpen = true) => offer.status.value === 'active' && requestOpen

interface OfferCardProps {
  offer: Offer
  /** Request-level flag; offers on closed requests are read-only */
  requestOpen?: boolean
  onWithdraw?: (offer: Offer) => void
}

/** Offer summary shown inside the request detail, linking to the full offer page */
export function OfferCard({ offer, requestOpen = true, onWithdraw }: OfferCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const p = offer.price
  const editable = canChangeOffer(offer, requestOpen)
  const active = offer.status.value === 'active'
  const money = (v: number | null) => `${formatMoney(v, lang)} ${t('vehicleInsurance.currency')}`
  const included = offer.benefits.filter((b) => b.is_included)
  const addOns = offer.benefits.filter((b) => !b.is_included)

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg hover:shadow-gray-200/60 dark:bg-zinc-900 dark:hover:shadow-black/30',
        active ? 'border-primary/20' : 'border-border/60'
      )}
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              active
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            <FileSignature className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/vehicle-offers/${offer.id}`}
                dir="ltr"
                className="font-mono text-base font-black tracking-tight text-gray-900 hover:text-primary dark:text-zinc-50"
              >
                {offerRef(offer)}
              </Link>
              <OfferStatusBadge value={offer.status} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip icon={ShieldCheck}>{offer.insurance_type.label}</Chip>
              {offer.repair_method && <Chip icon={Wrench}>{offer.repair_method.label}</Chip>}
              <span className="text-[11px] text-muted-foreground">· {formatDateTime(offer.created_at, lang)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:text-primary">
            <Link to={`/vehicle-offers/${offer.id}`}>
              <Eye /> {t('view')}
            </Link>
          </Button>
          {editable && (
            <>
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link to={`/vehicle-offers/${offer.id}/edit`}>
                  <Pencil /> {t('vehicleInsurance.offers.edit')}
                </Link>
              </Button>
              {onWithdraw && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWithdraw(offer)}
                  className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                >
                  <Undo2 /> {t('vehicleInsurance.offers.withdraw')}
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      <div className="grid gap-5 border-t border-border/60 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* Key figures */}
          <dl className="grid gap-3 sm:grid-cols-3">
            <Figure icon={ShieldCheck} tone="primary" label={t('vehicleInsurance.offers.coverageLimit')} value={money(offer.coverage_limit)} />
            <Figure icon={ShieldMinus} tone="amber" label={t('vehicleInsurance.offers.deductible')} value={money(offer.deductible)} />
            <Figure icon={CalendarClock} tone="sky" label={t('vehicleInsurance.offers.validUntil')} value={formatDay(offer.valid_until, lang)} />
            {offer.withdrawn_at && (
              <Figure icon={Undo2} tone="rose" label={t('vehicleInsurance.offers.withdrawnAt')} value={formatDateTime(offer.withdrawn_at, lang)} />
            )}
          </dl>

          {/* Benefits & exclusions */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 p-4">
              <ListTitle count={offer.benefits.length}>{t('vehicleInsurance.offers.benefits')}</ListTitle>
              {offer.benefits.length ? (
                <div className="space-y-4">
                  {included.length > 0 && (
                    <div>
                      <GroupLabel dot="bg-emerald-500">{t('vehicleInsurance.offers.includedGroup')}</GroupLabel>
                      <ul className="space-y-1.5">
                        {included.map((b) => (
                          <li
                            key={b.id}
                            className="flex items-center gap-2.5 rounded-lg bg-emerald-50/70 px-3 py-2 text-sm font-medium text-gray-800 dark:bg-emerald-950/20 dark:text-zinc-200"
                          >
                            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                            <span className="min-w-0 flex-1">{b.title}</span>
                            <span className="shrink-0 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              {t('vehicleInsurance.offers.free')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {addOns.length > 0 && (
                    <div>
                      <GroupLabel dot="bg-primary">{t('vehicleInsurance.offers.addOnsGroup')}</GroupLabel>
                      <ul className="space-y-1.5">
                        {addOns.map((b) => (
                          <li
                            key={b.id}
                            className="flex items-center gap-2.5 rounded-lg bg-primary/[0.06] px-3 py-2 text-sm font-medium text-gray-800 dark:text-zinc-200"
                          >
                            <Plus className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                            <span className="min-w-0 flex-1">{b.title}</span>
                            <span className="shrink-0 text-xs font-bold tabular-nums text-primary">+{money(b.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyLine>{t('vehicleInsurance.offers.noBenefits')}</EmptyLine>
              )}
            </div>

            <div className="rounded-xl border border-border/60 p-4">
              <ListTitle count={offer.exclusions.length}>{t('vehicleInsurance.offers.exclusions')}</ListTitle>
              {offer.exclusions.length ? (
                <div>
                  <GroupLabel dot="bg-rose-500">{t('vehicleInsurance.offers.exclusionsHint')}</GroupLabel>
                  <ul className="space-y-1.5">
                    {offer.exclusions.map((x) => (
                      <li
                        key={x.id}
                        className="flex items-center gap-2.5 rounded-lg bg-rose-50/70 px-3 py-2 text-sm font-medium text-gray-800 dark:bg-rose-950/20 dark:text-zinc-200"
                      >
                        <X className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={3} />
                        {x.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyLine>{t('vehicleInsurance.offers.noExclusions')}</EmptyLine>
              )}
            </div>
          </div>
        </div>

        {/* Price — highlighted only while the offer is live */}
        <div
          className={cn(
            'self-start overflow-hidden rounded-2xl',
            active
              ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20'
              : 'border border-border/60 bg-gray-50 text-gray-900 dark:bg-zinc-800/50 dark:text-zinc-100'
          )}
        >
          <div className="px-5 pb-4 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{t('vehicleInsurance.offers.total')}</p>
            {p.original_price ? <p className="mt-1 text-xs tabular-nums line-through opacity-60">{money(p.original_price)}</p> : null}
            <p className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight tabular-nums">{formatMoney(p.total_price, lang)}</span>
              <span className="text-xs font-bold opacity-80">{t('vehicleInsurance.currency')}</span>
            </p>
            {p.original_price && p.original_price > p.total_price ? (
              <span
                className={cn(
                  'mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  active ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                )}
              >
                {t('vehicleInsurance.offers.youSave', { amount: money(p.original_price - p.total_price) })}
              </span>
            ) : null}
          </div>
          <dl className={cn('space-y-2 px-5 py-3.5 text-xs', active ? 'bg-black/10' : 'border-t border-border/60')}>
            <PriceRow label={t('vehicleInsurance.offers.basePremium')} value={money(p.base_premium)} />
            <PriceRow label={t('vehicleInsurance.offers.vat', { rate: formatMoney(p.vat_rate, lang) })} value={money(p.vat_amount)} />
          </dl>
        </div>
      </div>
    </article>
  )
}

type Tone = 'primary' | 'amber' | 'sky' | 'rose'

const TONE: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
}

function Chip({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-primary">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  )
}

function Figure({ icon: Icon, tone, label, value }: { icon: React.ElementType; tone: Tone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-gray-50/60 p-3 dark:bg-zinc-800/30">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONE[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-bold tabular-nums text-gray-900 dark:text-zinc-100">{value}</dd>
      </div>
    </div>
  )
}

function ListTitle({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-zinc-100">
      {children}
      <span className="rounded-full bg-gray-100 px-2 py-px text-[10px] font-bold tabular-nums text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
        {count}
      </span>
    </h3>
  )
}

function GroupLabel({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {children}
    </p>
  )
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">{children}</p>
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="opacity-75">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function PriceBreakdown({
  rows,
  totalLabel,
  total,
  original,
  footnote,
}: {
  rows: [string, string][]
  totalLabel: string
  total: string
  original?: string
  footnote?: string
}) {
  return (
    <div className="self-start rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 border-t border-primary/15 pt-3">
        <div className="flex items-end justify-between gap-3">
          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{totalLabel}</span>
          <div className="text-end">
            {original && <div className="text-xs text-muted-foreground line-through tabular-nums">{original}</div>}
            <div className="text-xl font-black text-primary tabular-nums">{total}</div>
          </div>
        </div>
        {footnote && <p className="mt-2 text-[11px] text-muted-foreground">{footnote}</p>}
      </div>
    </div>
  )
}
