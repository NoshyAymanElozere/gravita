import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Check,
  CircleDollarSign,
  ExternalLink,
  FileSignature,
  History,
  Lock,
  Pencil,
  ReceiptText,
  ShieldCheck,
  ShieldMinus,
  ShieldX,
  Sparkles,
  Undo2,
  Wrench,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { useOfferDetail } from '../api/useVehicleInsurance'
import { PageError, PageSkeleton, card, isNotFound, useIsRtl } from '../components/Blocks'
import { canChangeOffer, offerRef } from '../components/OfferCard'
import { OfferStatusBadge } from '../components/StatusBadges'
import { WithdrawDialog } from '../components/ActionDialogs'
import { formatDateTime, formatDay, formatMoney } from '../lib/format'
import type { Offer } from '../types/vehicleInsurance.types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days from today until `YYYY-MM-DD` (negative once past) */
function daysUntil(day: string) {
  const end = new Date(day.length === 10 ? `${day}T00:00:00` : day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / DAY_MS)
}

export default function VehicleOfferDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const isRtl = useIsRtl()
  const { data: offer, isLoading, error, refetch } = useOfferDetail(id)

  if (isLoading) return <PageSkeleton />
  if (error || !offer) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        <PageError
          notFound={isNotFound(error)}
          message={t(isNotFound(error) ? 'vehicleInsurance.offerNotFound' : 'vehicleInsurance.loadError')}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return <OfferView offer={offer} />
}

function OfferView({ offer }: { offer: Offer }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const isRtl = useIsRtl()
  const navigate = useNavigate()
  const [withdrawing, setWithdrawing] = React.useState<Offer | null>(null)

  const editable = canChangeOffer(offer)
  const money = (v: number | null) => `${formatMoney(v, lang)} ${t('vehicleInsurance.currency')}`
  const p = offer.price
  const daysLeft = daysUntil(offer.valid_until)
  const included = offer.benefits.filter((b) => b.is_included)
  const addOns = offer.benefits.filter((b) => !b.is_included)
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="space-y-5 pb-10 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={cn(card, 'relative overflow-hidden')}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.06),transparent_50%)]"
        />
        <div className="relative p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/vehicle-offers')}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ms-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <BackIcon className="h-3.5 w-3.5" />
              {t('vehicleInsurance.offers.back')}
            </button>
            <span className="text-[11px] font-medium text-muted-foreground">
              {formatDateTime(offer.created_at, lang)}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <FileSignature className="h-6 w-6" />
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 dir="ltr" className="truncate font-mono text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-50">
                    {offerRef(offer)}
                  </h1>
                  <OfferStatusBadge value={offer.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip icon={ShieldCheck}>{offer.insurance_type.label}</Chip>
                  {offer.repair_method && <Chip icon={Wrench}>{offer.repair_method.label}</Chip>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="h-10 gap-2 rounded-xl bg-white/70 px-4 font-bold backdrop-blur dark:bg-zinc-900/70">
                <Link to={`/vehicle-requests/${offer.request_id}`}>
                  <ExternalLink className="h-4 w-4" />
                  {t('vehicleInsurance.offers.openRequest')}
                  <span dir="ltr" className="font-mono text-xs text-muted-foreground">
                    {offer.request_reference ?? `#${offer.request_id}`}
                  </span>
                </Link>
              </Button>
              {editable && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawing(offer)}
                    className="h-10 gap-2 rounded-xl border-rose-200 bg-white/70 px-4 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:bg-zinc-900/70 dark:hover:bg-rose-950/30"
                  >
                    <Undo2 className="h-4 w-4" /> {t('vehicleInsurance.offers.withdraw')}
                  </Button>
                  <Button asChild className="h-10 gap-2 rounded-xl px-5 font-bold shadow-md shadow-primary/20">
                    <Link to={`/vehicle-offers/${offer.id}/edit`}>
                      <Pencil className="h-4 w-4" /> {t('vehicleInsurance.offers.edit')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {!editable && (
          <div className="relative flex items-center gap-2 border-t border-border/60 bg-gray-50/80 px-5 py-2.5 text-xs font-semibold text-muted-foreground dark:bg-zinc-800/40 md:px-6">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {t('vehicleInsurance.offers.readOnly')}
          </div>
        )}
      </section>

      {/* ── Key figures ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={ShieldCheck} tone="primary" label={t('vehicleInsurance.offers.coverageLimit')} value={money(offer.coverage_limit)} />
        <Metric icon={ShieldMinus} tone="amber" label={t('vehicleInsurance.offers.deductible')} value={money(offer.deductible)} />
        <Metric
          icon={CalendarClock}
          tone={daysLeft < 0 ? 'rose' : daysLeft <= 3 ? 'amber' : 'sky'}
          label={t('vehicleInsurance.offers.validUntil')}
          value={formatDay(offer.valid_until, lang)}
          hint={
            offer.status.value === 'active'
              ? daysLeft < 0
                ? t('vehicleInsurance.offers.expiredAgo')
                : daysLeft === 0
                  ? t('vehicleInsurance.offers.expiresToday')
                  : t('vehicleInsurance.offers.daysLeft', { count: daysLeft })
              : undefined
          }
        />
        <Metric icon={CircleDollarSign} tone="emerald" label={t('vehicleInsurance.offers.total')} value={money(p.total_price)} />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Panel
            icon={Sparkles}
            title={t('vehicleInsurance.offers.benefits')}
            count={offer.benefits.length}
          >
            {offer.benefits.length ? (
              <div className="space-y-5">
                {included.length > 0 && (
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {included.map((b) => (
                      <li
                        key={b.id}
                        className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      >
                        <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-zinc-100">{b.title}</p>
                          <p className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {t('vehicleInsurance.offers.included')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {addOns.length > 0 && (
                  <div>
                    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('vehicleInsurance.offers.addOns')}
                    </h3>
                    <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
                      {addOns.map((b) => (
                        <li key={b.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-zinc-900">
                          <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-gray-800 dark:text-zinc-200">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Sparkles className="h-3.5 w-3.5" />
                            </span>
                            {b.title}
                          </span>
                          <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary">
                            +{money(b.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Empty icon={Sparkles}>{t('vehicleInsurance.offers.noBenefits')}</Empty>
            )}
          </Panel>

          <Panel icon={ShieldX} title={t('vehicleInsurance.offers.exclusions')} count={offer.exclusions.length} tone="rose">
            {offer.exclusions.length ? (
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {offer.exclusions.map((x) => (
                  <li
                    key={x.id}
                    className="flex items-start gap-3 rounded-xl border border-rose-200/70 bg-rose-50/40 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20"
                  >
                    <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <p className="text-sm font-medium leading-snug text-gray-800 dark:text-zinc-200">{x.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={ShieldX}>{t('vehicleInsurance.offers.noExclusions')}</Empty>
            )}
          </Panel>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20">
            <div className="flex items-center gap-2 px-5 pt-5 text-xs font-bold uppercase tracking-wider opacity-80">
              <ReceiptText className="h-4 w-4" />
              {t('vehicleInsurance.offers.priceSummary')}
            </div>
            <div className="px-5 pb-5 pt-3">
              {p.original_price ? (
                <div className="text-sm tabular-nums line-through opacity-60">{money(p.original_price)}</div>
              ) : null}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight tabular-nums">{formatMoney(p.total_price, lang)}</span>
                <span className="text-sm font-bold opacity-80">{t('vehicleInsurance.currency')}</span>
              </div>
              {p.original_price && p.original_price > p.total_price ? (
                <span className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {t('vehicleInsurance.offers.youSave', { amount: money(p.original_price - p.total_price) })}
                </span>
              ) : null}
            </div>
            <dl className="space-y-2.5 bg-black/10 px-5 py-4 text-sm">
              <Row label={t('vehicleInsurance.offers.basePremium')} value={money(p.base_premium)} />
              <Row label={t('vehicleInsurance.offers.vat', { rate: formatMoney(p.vat_rate, lang) })} value={money(p.vat_amount)} />
              <div className="border-t border-white/20 pt-2.5">
                <Row label={t('vehicleInsurance.offers.total')} value={money(p.total_price)} strong />
              </div>
            </dl>
          </div>

          <div className={cn(card, 'p-5')}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-zinc-100">
              <History className="h-4 w-4 text-primary" />
              {t('vehicleInsurance.offers.timeline')}
            </h2>
            <ol className="relative space-y-4 border-s-2 border-dashed border-border/80 ps-5">
              <TimelineItem icon={CalendarPlus} label={t('vehicleInsurance.offers.createdAt')} value={formatDateTime(offer.created_at, lang)} />
              {offer.updated_at && offer.updated_at !== offer.created_at && (
                <TimelineItem icon={Pencil} label={t('vehicleInsurance.offers.updatedAt')} value={formatDateTime(offer.updated_at, lang)} />
              )}
              {offer.withdrawn_at && (
                <TimelineItem icon={Undo2} tone="rose" label={t('vehicleInsurance.offers.withdrawnAt')} value={formatDateTime(offer.withdrawn_at, lang)} />
              )}
              <TimelineItem
                icon={CalendarClock}
                tone={daysLeft < 0 ? 'rose' : 'muted'}
                label={t('vehicleInsurance.offers.validUntil')}
                value={formatDay(offer.valid_until, lang)}
              />
            </ol>
          </div>
        </aside>
      </div>

      <WithdrawDialog offer={withdrawing} onClose={() => setWithdrawing(null)} />
    </div>
  )
}

// ─── Local building blocks ───────────────────────────────────────────────────

type Tone = 'primary' | 'emerald' | 'amber' | 'sky' | 'rose'

const TONE: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400',
}

function Chip({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.07] px-3 py-1 text-xs font-bold text-primary">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ElementType
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  tone: Tone
}) {
  return (
    <div className={cn(card, 'group p-4 transition-all hover:-translate-y-0.5 hover:shadow-md')}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', TONE[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 truncate text-xl font-black tracking-tight tabular-nums text-gray-900 dark:text-zinc-50">{value}</p>
      {hint && <p className={cn('mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-bold', TONE[tone])}>{hint}</p>}
    </div>
  )
}

function Panel({
  icon: Icon,
  title,
  count,
  tone = 'primary',
  children,
}: {
  icon: React.ElementType
  title: React.ReactNode
  count: number
  tone?: Tone
  children: React.ReactNode
}) {
  return (
    <section className={cn(card, 'p-5')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900 dark:text-zinc-100">
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', TONE[tone])}>
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function Empty({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground/50" />
      <p className="text-xs font-medium text-muted-foreground">{children}</p>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={cn(strong ? 'font-bold' : 'opacity-80')}>{label}</dt>
      <dd className={cn('tabular-nums', strong ? 'font-black' : 'font-semibold')}>{value}</dd>
    </div>
  )
}

function TimelineItem({
  icon: Icon,
  label,
  value,
  tone = 'primary',
}: {
  icon: React.ElementType
  label: string
  value: string
  tone?: 'primary' | 'rose' | 'muted'
}) {
  return (
    <li className="relative">
      <span
        className={cn(
          'absolute -start-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900',
          tone === 'primary' && 'bg-primary text-primary-foreground',
          tone === 'rose' && 'bg-rose-500 text-white',
          tone === 'muted' && 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300'
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </li>
  )
}
