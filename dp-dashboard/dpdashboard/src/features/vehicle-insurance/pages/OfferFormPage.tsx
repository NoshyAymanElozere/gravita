import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFieldArray, useForm, useWatch, type FieldErrors, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Car, FileSignature, Gift, Plus, Save, Send, ShieldBan, Trash2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import type { ApiEnvelope } from '@/features/auth/types/auth.types'
import { useOfferDetail, useRequestDetail, useSendOffer, useUpdateOffer } from '../api/useVehicleInsurance'
import { Info, InfoGrid, Notice, PageError, PageHeader, PageSkeleton, Section, isNotFound, useIsRtl } from '../components/Blocks'
import { PriceBreakdown, canChangeOffer, offerRef } from '../components/OfferCard'
import { computePrice, formatDay, formatMoney, isoDayFromToday } from '../lib/format'
import {
  DEFAULT_VAT_RATE,
  MAX_ITEMS,
  MAX_VALIDITY_DAYS,
  emptyOfferForm,
  formToPayload,
  makeOfferSchema,
  mapOfferErrorKey,
  offerToForm,
  type OfferFormValues,
} from '../lib/offerForm'
import {
  INSURANCE_TYPES,
  REPAIR_METHODS,
  needsRepairMethod,
  type Offer,
  type OfferPayload,
  type RequestDetail,
} from '../types/vehicleInsurance.types'
import { requestRef } from './VehicleRequestDetail'

/** `/vehicle-requests/:id/offer` sends a new offer, `/vehicle-offers/:id/edit` edits one */
export default function OfferFormPage({ mode }: { mode: 'send' | 'edit' }) {
  return mode === 'send' ? <SendOfferLoader /> : <EditOfferLoader />
}

function SendOfferLoader() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: request, isLoading, error, refetch } = useRequestDetail(id)
  const send = useSendOffer(id ?? '')

  if (isLoading) return <PageSkeleton />
  if (error || !request) {
    return (
      <PageError
        notFound={isNotFound(error)}
        message={t(isNotFound(error) ? 'vehicleInsurance.notFound' : 'vehicleInsurance.loadError')}
        onRetry={() => refetch()}
      />
    )
  }

  const blocked = !request.is_open_for_offers
    ? t('vehicleInsurance.closedNotice')
    : request.my_response.status.value === 'declined'
      ? t('vehicleInsurance.detail.declinedNotice')
      : null

  return (
    <OfferForm
      mode="send"
      request={request}
      // Existing offers carry the admin VAT setting; fall back to the documented default
      vatRate={request.my_offers[0]?.price.vat_rate ?? DEFAULT_VAT_RATE}
      initial={emptyOfferForm(request.insurance_type.value)}
      blocked={blocked}
      backTo={`/vehicle-requests/${request.id}`}
      submit={send.mutateAsync}
      submitting={send.isPending}
    />
  )
}

function EditOfferLoader() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: offer, isLoading, error, refetch } = useOfferDetail(id)
  const update = useUpdateOffer(id ?? '')

  if (isLoading) return <PageSkeleton />
  if (error || !offer) {
    return (
      <PageError
        notFound={isNotFound(error)}
        message={t(isNotFound(error) ? 'vehicleInsurance.offerNotFound' : 'vehicleInsurance.loadError')}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <OfferForm
      mode="edit"
      offer={offer}
      vatRate={offer.price.vat_rate ?? DEFAULT_VAT_RATE}
      initial={offerToForm(offer)}
      blocked={canChangeOffer(offer) ? null : t('vehicleInsurance.offers.readOnly')}
      backTo={`/vehicle-offers/${offer.id}`}
      submit={update.mutateAsync}
      submitting={update.isPending}
    />
  )
}

interface OfferFormProps {
  mode: 'send' | 'edit'
  request?: RequestDetail
  offer?: Offer
  vatRate: number
  initial: OfferFormValues
  /** Reason the form can't be submitted (closed request, declined, inactive offer) */
  blocked: string | null
  backTo: string
  submit: (payload: OfferPayload) => Promise<ApiEnvelope<Offer>>
  submitting: boolean
}

function OfferForm({ mode, request, offer, vatRate, initial, blocked, backTo, submit, submitting }: OfferFormProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const isRtl = useIsRtl()
  const navigate = useNavigate()

  const schema = React.useMemo(() => makeOfferSchema(vatRate), [vatRate])
  const form = useForm<OfferFormValues>({ resolver: zodResolver(schema), defaultValues: initial })
  const { control, register, handleSubmit, setValue, setError, formState } = form
  const benefits = useFieldArray({ control, name: 'benefits' })
  const exclusions = useFieldArray({ control, name: 'exclusions' })

  const [insuranceType, repairMethod, basePremium, originalPrice] = useWatch({
    control,
    name: ['insurance_type', 'repair_method', 'base_premium', 'original_price'],
  })
  const price = computePrice(Number(basePremium), vatRate)
  const showRepair = needsRepairMethod(insuranceType)

  // Only one active offer per insurance type + repair method on the same request
  const activeCombos = React.useMemo(
    () =>
      new Set(
        (request?.my_offers ?? [])
          .filter((o) => o.status.value === 'active')
          .map((o) => `${o.insurance_type.value}:${o.repair_method?.value ?? ''}`)
      ),
    [request]
  )
  const isDuplicate = activeCombos.has(`${insuranceType}:${showRepair ? repairMethod : ''}`)

  const selectType = (type: OfferFormValues['insurance_type']) => {
    setValue('insurance_type', type, { shouldDirty: true })
    if (!needsRepairMethod(type)) setValue('repair_method', '', { shouldDirty: true })
    else if (!repairMethod) setValue('repair_method', 'agency', { shouldDirty: true })
  }

  const onSubmit = async (values: OfferFormValues) => {
    try {
      const res = await submit(formToPayload(values))
      toast.success(res.message || t(mode === 'send' ? 'vehicleInsurance.form.sent' : 'vehicleInsurance.form.updated'))
      navigate(backTo)
    } catch (err) {
      // The interceptor already toasts the 422 message; also show field errors inline
      const errors = (err as AxiosError<ApiEnvelope>)?.response?.data?.errors ?? {}
      let first = true
      for (const [key, messages] of Object.entries(errors)) {
        const field = mapOfferErrorKey(key)
        if (!field || !messages?.length) continue
        setError(field as keyof OfferFormValues, { type: 'server', message: messages[0] }, { shouldFocus: first })
        first = false
      }
    }
  }

  const money = (n: number) => `${formatMoney(n, lang)} ${t('vehicleInsurance.currency')}`
  const disabled = !!blocked
  const reference = mode === 'send' ? requestRef(request!) : offerRef(offer!)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pb-10 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        icon={FileSignature}
        backTo={backTo}
        backLabel={t('vehicleInsurance.form.back')}
        title={mode === 'send' ? t('vehicleInsurance.form.sendTitle') : t('vehicleInsurance.form.editTitle', { reference })}
        subtitle={mode === 'send' ? t('vehicleInsurance.form.sendSubtitle', { reference }) : t('vehicleInsurance.form.editSubtitle')}
      />

      {blocked && <Notice tone="warning">{blocked}</Notice>}

      <fieldset disabled={disabled} className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <Section title={t('vehicleInsurance.form.sections.cover')} icon={ShieldBan}>
            <div className="space-y-5">
              <div>
                <FieldLabel>{t('vehicleInsurance.form.fields.insuranceType')}</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-3">
                  {INSURANCE_TYPES.map((type) => (
                    <Choice key={type} active={insuranceType === type} onClick={() => selectType(type)}>
                      {t(`vehicleInsurance.insuranceType.${type}`)}
                    </Choice>
                  ))}
                </div>
                {request && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t('vehicleInsurance.form.requestedHint', { type: request.insurance_type.label })}
                  </p>
                )}
              </div>

              {showRepair && (
                <div>
                  <FieldLabel>{t('vehicleInsurance.form.fields.repairMethod')}</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {REPAIR_METHODS.map((m) => (
                      <Choice
                        key={m}
                        active={repairMethod === m}
                        onClick={() => setValue('repair_method', m, { shouldDirty: true, shouldValidate: formState.isSubmitted })}
                      >
                        {t(`vehicleInsurance.repairMethod.${m}`)}
                      </Choice>
                    ))}
                  </div>
                  <FieldError form={form} name="repair_method" />
                </div>
              )}
              <FieldError form={form} name="insurance_type" />

              {mode === 'send' && isDuplicate && (
                <Notice tone="warning">{t('vehicleInsurance.form.duplicate')}</Notice>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField form={form} name="coverage_limit" label={t('vehicleInsurance.form.fields.coverageLimit')} />
                <NumberField
                  form={form}
                  name="deductible"
                  label={t('vehicleInsurance.form.fields.deductible')}
                  hint={t('vehicleInsurance.form.fields.deductibleHint')}
                />
              </div>
            </div>
          </Section>

          <Section title={t('vehicleInsurance.form.sections.pricing')} icon={Wallet}>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField form={form} name="base_premium" label={t('vehicleInsurance.form.fields.basePremium')} step="0.01" />
              <NumberField
                form={form}
                name="original_price"
                step="0.01"
                label={t('vehicleInsurance.form.fields.originalPrice')}
                hint={t('vehicleInsurance.form.fields.originalPriceHint')}
                errorValues={{ total: formatMoney(price.total, lang) }}
              />
              <div>
                <FieldLabel htmlFor="valid_until">{t('vehicleInsurance.form.fields.validUntil')}</FieldLabel>
                <input
                  id="valid_until"
                  type="date"
                  min={isoDayFromToday(0)}
                  max={isoDayFromToday(MAX_VALIDITY_DAYS)}
                  {...register('valid_until')}
                  className={inputClass(!!formState.errors.valid_until)}
                />
                <FieldError form={form} name="valid_until" hint={t('vehicleInsurance.form.fields.validUntilHint')} />
              </div>
            </div>
          </Section>

          <Section
            title={t('vehicleInsurance.form.sections.benefits')}
            icon={Gift}
            hint={t('vehicleInsurance.form.sections.benefitsHint')}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={benefits.fields.length >= MAX_ITEMS}
                onClick={() => benefits.append({ title_en: '', title_ar: '', price: '0' })}
              >
                <Plus /> {t('vehicleInsurance.form.addBenefit')}
              </Button>
            }
          >
            {benefits.fields.length === 0 && <EmptyRows>{t('vehicleInsurance.form.emptyBenefits')}</EmptyRows>}
            <div className="space-y-3">
              {benefits.fields.map((field, i) => (
                <ItemRow key={field.id} index={i} onRemove={() => benefits.remove(i)} removeLabel={t('vehicleInsurance.form.remove')}>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_130px]">
                    <TextField form={form} name={`benefits.${i}.title_en`} label={t('vehicleInsurance.form.fields.titleEn')} dir="ltr" />
                    <TextField form={form} name={`benefits.${i}.title_ar`} label={t('vehicleInsurance.form.fields.titleAr')} dir="rtl" />
                    <NumberField form={form} name={`benefits.${i}.price`} label={t('vehicleInsurance.form.fields.price')} step="0.01" />
                  </div>
                </ItemRow>
              ))}
            </div>
          </Section>

          <Section
            title={t('vehicleInsurance.form.sections.exclusions')}
            icon={ShieldBan}
            hint={t('vehicleInsurance.form.sections.exclusionsHint')}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={exclusions.fields.length >= MAX_ITEMS}
                onClick={() => exclusions.append({ title_en: '', title_ar: '' })}
              >
                <Plus /> {t('vehicleInsurance.form.addExclusion')}
              </Button>
            }
          >
            {exclusions.fields.length === 0 && <EmptyRows>{t('vehicleInsurance.form.emptyExclusions')}</EmptyRows>}
            <div className="space-y-3">
              {exclusions.fields.map((field, i) => (
                <ItemRow key={field.id} index={i} onRemove={() => exclusions.remove(i)} removeLabel={t('vehicleInsurance.form.remove')}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField form={form} name={`exclusions.${i}.title_en`} label={t('vehicleInsurance.form.fields.titleEn')} dir="ltr" />
                    <TextField form={form} name={`exclusions.${i}.title_ar`} label={t('vehicleInsurance.form.fields.titleAr')} dir="rtl" />
                  </div>
                </ItemRow>
              ))}
            </div>
          </Section>
        </div>

        {/* Sticky summary: live price preview + request context */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Section title={t('vehicleInsurance.form.preview.title')} icon={Wallet}>
            <PriceBreakdown
              rows={[
                [t('vehicleInsurance.form.preview.base'), money(price.base)],
                [t('vehicleInsurance.form.preview.vat', { rate: formatMoney(vatRate, lang) }), money(price.vat)],
              ]}
              totalLabel={t('vehicleInsurance.form.preview.total')}
              total={money(price.total)}
              original={Number(originalPrice) > price.total ? money(Number(originalPrice)) : undefined}
              footnote={t('vehicleInsurance.form.preview.note')}
            />
            <Button type="submit" disabled={disabled || submitting} className="mt-4 h-11 w-full gap-2 rounded-xl font-bold">
              {mode === 'send' ? <Send className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {submitting ? '…' : t(mode === 'send' ? 'vehicleInsurance.form.submitSend' : 'vehicleInsurance.form.submitEdit')}
            </Button>
          </Section>

          {request && (
            <Section title={t('vehicleInsurance.detail.vehicle')} icon={Car}>
              <InfoGrid cols={2}>
                <Info label={t('vehicleInsurance.detail.makeModel')} value={[request.vehicle.make, request.vehicle.model].filter(Boolean).join(' ')} />
                <Info label={t('vehicleInsurance.detail.year')} value={request.vehicle.manufacture_year} />
                <Info
                  label={t('vehicleInsurance.detail.estimatedValue')}
                  value={request.vehicle.estimated_value !== null ? money(request.vehicle.estimated_value) : null}
                />
                <Info label={t('vehicleInsurance.detail.usage')} value={request.vehicle.usage_purpose?.label} />
                <Info label={t('vehicleInsurance.detail.policyStart')} value={formatDay(request.policy_start_date, lang)} />
                <Info
                  label={t('vehicleInsurance.detail.driver')}
                  value={request.has_additional_driver ? t('vehicleInsurance.yes') : t('vehicleInsurance.no')}
                />
              </InfoGrid>
            </Section>
          )}
        </aside>
      </fieldset>
    </form>
  )
}

// ─── Field primitives (support nested array paths, unlike BaseInputField) ────

type Form = UseFormReturn<OfferFormValues>

const inputClass = (error: boolean) =>
  cn(
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 placeholder-gray-400 transition-all',
    'focus:border-main focus:outline-none focus:ring-1 focus:ring-main dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
    'disabled:cursor-not-allowed disabled:bg-gray-100/80 disabled:text-gray-600',
    error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
  )

function errorAt(errors: FieldErrors<OfferFormValues>, path: string): string | undefined {
  const node = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], errors)
  return (node as { message?: string } | undefined)?.message
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
      {children}
    </label>
  )
}

function FieldError({
  form,
  name,
  hint,
  values,
}: {
  form: Form
  name: string
  hint?: string
  values?: Record<string, string>
}) {
  const { t } = useTranslation()
  const message = errorAt(form.formState.errors, name)
  // Client errors are i18n keys; server (422) messages are already localized text
  if (message) {
    const text = message.startsWith('vehicleInsurance.') ? t(message, values) : message
    return <p className="mt-1 text-xs font-semibold text-rose-500">{text}</p>
  }
  return hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null
}

function NumberField({
  form,
  name,
  label,
  hint,
  step = '1',
  errorValues,
}: {
  form: Form
  name: string
  label: string
  hint?: string
  step?: string
  errorValues?: Record<string, string>
}) {
  const error = !!errorAt(form.formState.errors, name)
  return (
    <div>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        dir="ltr"
        {...form.register(name as keyof OfferFormValues)}
        className={cn(inputClass(error), 'tabular-nums')}
      />
      <FieldError form={form} name={name} hint={hint} values={errorValues} />
    </div>
  )
}

function TextField({ form, name, label, dir }: { form: Form; name: string; label: string; dir: 'ltr' | 'rtl' }) {
  const error = !!errorAt(form.formState.errors, name)
  return (
    <div>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input id={name} type="text" dir={dir} maxLength={255} {...form.register(name as keyof OfferFormValues)} className={inputClass(error)} />
      <FieldError form={form} name={name} />
    </div>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-11 rounded-xl border px-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
        active
          ? 'border-primary bg-primary/10 text-primary shadow-xs'
          : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-gray-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
      )}
    >
      {children}
    </button>
  )
}

function ItemRow({
  index,
  onRemove,
  removeLabel,
  children,
}: {
  index: number
  onRemove: () => void
  removeLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-gray-50/50 p-3 dark:bg-zinc-800/30">
      <span className="mt-7 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        title={removeLabel}
        aria-label={removeLabel}
        className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function EmptyRows({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border/80 py-6 text-center text-xs text-muted-foreground">{children}</p>
}
