import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Ban,
  Banknote,
  CalendarClock,
  CalendarDays,
  Car,
  Check,
  ExternalLink,
  FileSignature,
  MessageSquareReply,
  Send,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { useRequestDetail } from '../api/useVehicleInsurance'
import {
  Info,
  InfoGrid,
  Notice,
  PageError,
  PageHeader,
  PageSkeleton,
  PlateChip,
  Section,
  StatTile,
  isNotFound,
  useIsRtl,
} from '../components/Blocks'
import { MyResponseBadge, RequestStatusBadge } from '../components/StatusBadges'
import { OfferCard } from '../components/OfferCard'
import { DeclineDialog, WithdrawDialog } from '../components/ActionDialogs'
import { formatDateTime, formatDay, formatMoney } from '../lib/format'
import type { Offer, RequestDetail } from '../types/vehicleInsurance.types'

export const requestRef = (r: Pick<RequestDetail, 'id' | 'reference'>) => r.reference ?? `#${r.id}`

export default function VehicleRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const isRtl = useIsRtl()
  const { data: request, isLoading, error, refetch } = useRequestDetail(id)

  if (isLoading) return <PageSkeleton />
  if (error || !request) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        <PageError
          notFound={isNotFound(error)}
          message={t(isNotFound(error) ? 'vehicleInsurance.notFound' : 'vehicleInsurance.loadError')}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return <RequestView request={request} />
}

function RequestView({ request }: { request: RequestDetail }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const isRtl = useIsRtl()
  const [declineOpen, setDeclineOpen] = React.useState(false)
  const [withdrawing, setWithdrawing] = React.useState<Offer | null>(null)

  const response = request.my_response
  const declined = response.status.value === 'declined'
  const hasOffers = request.my_offers.length > 0
  const canOffer = request.is_open_for_offers && !declined
  // Declining is only possible before any offer was sent — withdraw instead
  const canDecline = canOffer && response.status.value !== 'offered' && !hasOffers
  const v = request.vehicle
  const money = (n: number | null) => (n === null ? null : `${formatMoney(n, lang)} ${t('vehicleInsurance.currency')}`)
  const makeModel = [v.make, v.model].filter(Boolean).join(' ')

  return (
    <div className="space-y-4 pb-10 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        icon={Car}
        backTo="/vehicle-requests"
        backLabel={t('vehicleInsurance.detail.back')}
        title={<span className="font-mono">{requestRef(request)}</span>}
        badges={
          <>
            <RequestStatusBadge value={request.status} />
            <MyResponseBadge value={response.status} />
          </>
        }
        subtitle={t('vehicleInsurance.detail.receivedAt', { date: formatDateTime(request.submitted_at, lang) })}
        actions={
          canOffer && (
            <>
              {canDecline && (
                <Button
                  variant="outline"
                  onClick={() => setDeclineOpen(true)}
                  className="h-10 gap-2 rounded-xl border-rose-200 px-4 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                >
                  <Ban className="h-4 w-4" /> {t('vehicleInsurance.detail.decline')}
                </Button>
              )}
              <Button asChild className="h-10 gap-2 rounded-xl px-5 font-bold">
                <Link to={`/vehicle-requests/${request.id}/offer`}>
                  <Send className="h-4 w-4" /> {t('vehicleInsurance.detail.sendOffer')}
                </Link>
              </Button>
            </>
          )
        }
      />

      {!request.is_open_for_offers && <Notice tone="warning">{t('vehicleInsurance.closedNotice')}</Notice>}
      {declined && request.is_open_for_offers && <Notice tone="danger">{t('vehicleInsurance.detail.declinedNotice')}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Car} label={t('vehicleInsurance.detail.vehicle')} value={makeModel || '—'} hint={v.manufacture_year} />
        <StatTile
          icon={ShieldCheck}
          label={t('vehicleInsurance.detail.requestedType')}
          value={request.insurance_type.label}
          hint={request.vehicle_source.label}
          tone="sky"
        />
        <StatTile
          icon={Banknote}
          label={t('vehicleInsurance.detail.estimatedValue')}
          value={money(v.estimated_value) ?? '—'}
          hint={v.usage_purpose?.label}
          tone="emerald"
        />
        <StatTile
          icon={CalendarDays}
          label={t('vehicleInsurance.detail.policyStart')}
          value={formatDay(request.policy_start_date, lang)}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title={t('vehicleInsurance.detail.vehicle')} icon={Car}>
            <InfoGrid>
              <Info label={t('vehicleInsurance.detail.vehicleSource')} value={request.vehicle_source.label} />
              <Info
                label={v.identifier_type?.label ?? t('vehicleInsurance.detail.identifier')}
                value={v.identifier_number}
                ltr
              />
              <Info label={t('vehicleInsurance.detail.makeModel')} value={makeModel} />
              <Info label={t('vehicleInsurance.detail.year')} value={v.manufacture_year} />
              <Info label={t('vehicleInsurance.detail.plate')} value={(v.plate_letters || v.plate_number) && <PlateChip letters={v.plate_letters} numbers={v.plate_number} />} />
              <Info label={t('vehicleInsurance.detail.inspection')} value={v.inspection_status?.label} />
              <Info label={t('vehicleInsurance.detail.usage')} value={v.usage_purpose?.label} />
              <Info label={t('vehicleInsurance.detail.estimatedValue')} value={money(v.estimated_value)} />
              {v.load_capacity !== null && <Info label={t('vehicleInsurance.detail.loadCapacity')} value={v.load_capacity} />}
              <Info label={t('vehicleInsurance.detail.owner')} value={v.owner_national_id} ltr />
              <Info label={t('vehicleInsurance.detail.ownerBirthDate')} value={formatDay(v.owner_birth_date, lang)} />
              {v.document_url && (
                <Info
                  label={t('vehicleInsurance.detail.document')}
                  value={
                    <a href={v.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> {t('vehicleInsurance.detail.openDocument')}
                    </a>
                  }
                />
              )}
            </InfoGrid>
          </Section>

          <Section title={t('vehicleInsurance.detail.driver')} icon={UserPlus}>
            {request.has_additional_driver && request.additional_driver ? (
              <InfoGrid>
                <Info label={t('vehicleInsurance.detail.driverId')} value={request.additional_driver.national_id} ltr />
                <Info
                  label={t('vehicleInsurance.detail.driverBirthDate')}
                  value={
                    <>
                      <span dir="ltr">{request.additional_driver.birth_date}</span>
                      {request.additional_driver.birth_date_calendar && (
                        <span className="ms-1.5 text-xs font-medium text-muted-foreground">
                          ({request.additional_driver.birth_date_calendar.label})
                        </span>
                      )}
                    </>
                  }
                />
                <Info
                  label={t('vehicleInsurance.detail.drivingPercentage')}
                  value={
                    <span className="flex items-center gap-2.5">
                      <span className="tabular-nums">{request.additional_driver.driving_percentage}%</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, Math.max(0, request.additional_driver.driving_percentage))}%` }}
                        />
                      </span>
                    </span>
                  }
                />
              </InfoGrid>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/70 px-4 py-3.5 text-sm text-muted-foreground">
                <UserPlus className="h-4 w-4 opacity-60" />
                {t('vehicleInsurance.detail.noDriver')}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section
            title={t('vehicleInsurance.detail.myResponseTitle')}
            icon={MessageSquareReply}
            action={<MyResponseBadge value={response.status} />}
          >
            <div className="space-y-4">
              <ol className="relative space-y-5 ps-7 before:absolute before:inset-y-2 before:start-[9px] before:w-px before:bg-border">
                <TimelineStep done label={t('vehicleInsurance.columns.submittedAt')} date={formatDateTime(request.submitted_at, lang)} />
                <TimelineStep
                  done={!!response.viewed_at}
                  label={t('vehicleInsurance.detail.viewedAt')}
                  date={response.viewed_at && formatDateTime(response.viewed_at, lang)}
                />
                <TimelineStep
                  done={!!response.responded_at}
                  danger={declined}
                  label={t('vehicleInsurance.detail.respondedAt')}
                  date={response.responded_at && formatDateTime(response.responded_at, lang)}
                />
              </ol>
              {declined && response.decline_reason && (
                <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider">{t('vehicleInsurance.detail.declineReason')}</p>
                  {response.decline_reason}
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>

      <Section
        title={t('vehicleInsurance.detail.myOffers')}
        icon={FileSignature}
        action={
          hasOffers && canOffer ? (
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link to={`/vehicle-requests/${request.id}/offer`}>
                <Send /> {t('vehicleInsurance.detail.sendOffer')}
              </Link>
            </Button>
          ) : undefined
        }
      >
        {hasOffers ? (
          <div className="space-y-4">
            {request.my_offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} requestOpen={request.is_open_for_offers} onWithdraw={setWithdrawing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarClock className="h-7 w-7 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">{t('vehicleInsurance.detail.noOffers')}</p>
          </div>
        )}
      </Section>

      <DeclineDialog open={declineOpen} onOpenChange={setDeclineOpen} requestId={request.id} reference={requestRef(request)} />
      <WithdrawDialog offer={withdrawing} onClose={() => setWithdrawing(null)} />
    </div>
  )
}

function TimelineStep({ label, date, done, danger }: { label: string; date?: string | null; done?: boolean; danger?: boolean }) {
  const Icon = danger ? X : Check
  return (
    <li className="relative">
      <span
        className={cn(
          'absolute -start-7 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900',
          !done && 'border-2 border-dashed border-border bg-white dark:bg-zinc-900',
          done && !danger && 'bg-primary text-white',
          done && danger && 'bg-rose-500 text-white'
        )}
      >
        {done && <Icon className="h-3 w-3" strokeWidth={3} />}
      </span>
      <p className={cn('text-xs font-bold', done ? 'text-gray-900 dark:text-zinc-100' : 'text-muted-foreground')}>{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{date || '—'}</p>
    </li>
  )
}
