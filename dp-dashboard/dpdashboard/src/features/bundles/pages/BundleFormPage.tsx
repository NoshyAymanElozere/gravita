import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Boxes, Plus, RefreshCw, Trash2, AlertTriangle, ExternalLink } from 'lucide-react'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { ControlledInput, ControlledTextarea, FormField } from '@/components/shared/form-fields'
import { ImageUpload, type ImageValue } from '@/components/shared/image-upload'
import { StringListField } from '@/components/shared/list-field'
import { Switch } from '@/components/shared/controls'
import { Skeleton } from '@/components/shared/misc'
import { Thumb } from '@/components/shared/thumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/utils'
import { formatMoney } from '@/utils/format'
import { storefrontUrl } from '@/utils/media'
import type { Bundle, Product } from '@/types/api'
import { useProductOptions } from '@/features/products/api/useProducts'
import { useBundle, useRecalculateBundle, useSaveBundle } from '../api/useBundles'

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const itemSchema = z.object({
  product: z.string().min(1, 'bundles.pickProduct'),
  stepEn: z.string().trim().min(1, 'validation.required'),
  stepAr: z.string().trim().min(1, 'validation.required'),
  benefitEn: z.string().trim().min(1, 'validation.required'),
  benefitAr: z.string().trim().min(1, 'validation.required'),
  quantity: z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= 1, 'validation.positiveInteger'),
})

// Mirrors gravuta-backend/validations/bundle.validation.js
const schema = z
  .object({
    nameEn: z.string().trim().min(3, 'validation.min3'),
    nameAr: z.string().trim().min(3, 'validation.min3'),
    slug: z
      .string()
      .trim()
      .refine((v) => v === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), 'validation.slug'),
    subtitleEn: z.string(),
    subtitleAr: z.string(),
    descriptionEn: z.string().trim().min(1, 'validation.required'),
    descriptionAr: z.string().trim().min(1, 'validation.required'),
    benefitsEn: z.array(z.string()),
    benefitsAr: z.array(z.string()),
    items: z.array(itemSchema).min(2, 'bundles.minTwo'),
    pricingMode: z.enum(['discount', 'manual']),
    discountPercentage: z.string(),
    bundlePrice: z.string(),
    sortOrder: z.string().refine((v) => v === '' || /^-?\d+$/.test(v), 'validation.integer'),
    isActive: z.boolean(),
  })
  .superRefine((d, ctx) => {
    const seen = new Set<string>()
    d.items.forEach((it, i) => {
      if (it.product && seen.has(it.product)) ctx.addIssue({ code: 'custom', path: ['items', i, 'product'], message: 'bundles.duplicateProduct' })
      seen.add(it.product)
    })
    if (d.pricingMode === 'discount') {
      const n = Number(d.discountPercentage)
      if (d.discountPercentage.trim() === '' || Number.isNaN(n) || n < 0 || n > 99) ctx.addIssue({ code: 'custom', path: ['discountPercentage'], message: 'bundles.discountRange' })
    } else {
      const n = Number(d.bundlePrice)
      if (d.bundlePrice.trim() === '' || Number.isNaN(n) || n < 0) ctx.addIssue({ code: 'custom', path: ['bundlePrice'], message: 'validation.nonNegativeNumber' })
    }
  })
type FormValues = z.infer<typeof schema>
type ItemValues = z.infer<typeof itemSchema>

const EMPTY_ITEM: ItemValues = { product: '', stepEn: '', stepAr: '', benefitEn: '', benefitAr: '', quantity: '1' }

const EMPTY: FormValues = {
  nameEn: '',
  nameAr: '',
  slug: '',
  subtitleEn: '',
  subtitleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  benefitsEn: [],
  benefitsAr: [],
  items: [{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }],
  pricingMode: 'discount',
  discountPercentage: '15',
  bundlePrice: '',
  sortOrder: '0',
  isActive: true,
}

function toForm(b: Bundle): FormValues {
  return {
    nameEn: b.nameEn ?? '',
    nameAr: b.nameAr ?? '',
    slug: b.slug ?? '',
    subtitleEn: b.subtitleEn ?? '',
    subtitleAr: b.subtitleAr ?? '',
    descriptionEn: b.descriptionEn ?? '',
    descriptionAr: b.descriptionAr ?? '',
    benefitsEn: b.benefitsEn ?? [],
    benefitsAr: b.benefitsAr ?? [],
    items: [...(b.items ?? [])]
      .sort((a, c) => (a.order ?? 0) - (c.order ?? 0))
      .map((it) => ({
        product: typeof it.product === 'string' ? it.product : (it.product?._id ?? ''),
        stepEn: it.stepEn ?? '',
        stepAr: it.stepAr ?? '',
        benefitEn: it.benefitEn ?? '',
        benefitAr: it.benefitAr ?? '',
        quantity: String(it.quantity ?? 1),
      })),
    pricingMode: 'discount',
    discountPercentage: String(b.discountPercentage ?? 0),
    bundlePrice: String(b.bundlePrice ?? ''),
    sortOrder: String(b.sortOrder ?? 0),
    isActive: b.isActive !== false,
  }
}

function ItemError({ msg }: { msg?: string }) {
  const { t } = useTranslation()
  return msg ? <p className="mt-1 text-xs text-destructive">{t(msg)}</p> : null
}

export default function BundleFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: bundle, isLoading } = useBundle(id)
  const { data: products = [] } = useProductOptions()
  const save = useSaveBundle()
  const recalc = useRecalculateBundle()
  const [image, setImage] = useState<ImageValue>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const { control, handleSubmit, reset, watch, setValue, formState } = form
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' })

  const loadedId = useRef<string | null>(null)
  useEffect(() => {
    if (bundle && (loadedId.current !== bundle._id || !formState.isDirty)) {
      loadedId.current = bundle._id
      reset(toForm(bundle))
      setImage(bundle.image || null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, reset])

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p._id, p])) as Record<string, Product>, [products])
  const items = watch('items')
  const mode = watch('pricingMode')
  const discount = Number(watch('discountPercentage')) || 0
  const manualPrice = watch('bundlePrice')

  // Client-side preview — the server recalculates and is the source of truth
  const preview = useMemo(() => {
    let original = 0
    let effective = 0
    let complete = true
    for (const it of items) {
      const p = productById[it.product]
      const q = Number(it.quantity) || 0
      if (!p) {
        complete = false
        continue
      }
      original += p.price * q
      effective += (p.discountPrice ?? p.price) * q
    }
    const price = mode === 'manual' ? Number(manualPrice) || 0 : Math.round(original * (1 - discount / 100))
    const pct = original > 0 ? Math.round((1 - price / original) * 100) : 0
    return { original, effective, price, pct, complete, tooHigh: mode === 'manual' && price > original, notCheaper: original > 0 && price >= effective }
  }, [items, productById, mode, discount, manualPrice])

  const onSubmit = (v: FormValues) => {
    if (preview.tooHigh) return
    const payload: Record<string, unknown> = {
      slug: v.slug.trim() || slugify(v.nameEn),
      nameEn: v.nameEn.trim(),
      nameAr: v.nameAr.trim(),
      subtitleEn: v.subtitleEn.trim(),
      subtitleAr: v.subtitleAr.trim(),
      descriptionEn: v.descriptionEn.trim(),
      descriptionAr: v.descriptionAr.trim(),
      benefitsEn: v.benefitsEn.map((b) => b.trim()).filter(Boolean),
      benefitsAr: v.benefitsAr.map((b) => b.trim()).filter(Boolean),
      items: v.items.map((it) => ({
        product: it.product,
        stepEn: it.stepEn.trim(),
        stepAr: it.stepAr.trim(),
        benefitEn: it.benefitEn.trim(),
        benefitAr: it.benefitAr.trim(),
        quantity: Number(it.quantity),
      })),
      sortOrder: v.sortOrder === '' ? 0 : Number(v.sortOrder),
      isActive: v.isActive,
    }
    if (v.pricingMode === 'discount') payload.discountPercentage = Number(v.discountPercentage)
    else {
      // The API derives the percentage from a manual price; create still requires the field
      payload.discountPercentage = Math.min(99, Math.max(0, preview.pct))
      payload.bundlePrice = Number(v.bundlePrice)
    }
    if (image === null && isEdit && bundle?.image) payload.image = ''

    save.mutate(
      { id, payload, file: image instanceof File ? image : null },
      {
        onSuccess: (res) => {
          if (!isEdit && res.data?._id) navigate(`/bundles/${res.data._id}/edit`, { replace: true })
        },
      }
    )
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }
  if (isEdit && !isLoading && !bundle) {
    return <EmptyState icon={Boxes} title={t('bundles.notFound')} action={<Button asChild variant="outline"><Link to="/bundles">{t('bundles.title')}</Link></Button>} />
  }

  const itemsError = (formState.errors.items as { message?: string; root?: { message?: string } } | undefined)
  const itemsMsg = itemsError?.message ?? itemsError?.root?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" noValidate>
      <PageHeader
        backTo="/bundles"
        title={isEdit ? bundle?.nameEn : t('bundles.add')}
        description={isEdit ? t('bundles.editSubtitle') : t('bundles.createSubtitle')}
        actions={
          <>
            {isEdit && bundle?.isActive && (
              <Button asChild variant="outline" type="button">
                <a href={storefrontUrl(`/product-details?type=bundle&id=${bundle._id}`)} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t('common.viewOnStore')}
                </a>
              </Button>
            )}
            {isEdit && (
              <Button type="button" variant="outline" onClick={() => recalc.mutate(id!)} loading={recalc.isPending}>
                <RefreshCw className="h-4 w-4" />
                {t('bundles.recalculate')}
              </Button>
            )}
            <Button type="submit" loading={save.isPending}>
              {isEdit ? t('common.saveChanges') : t('bundles.create')}
            </Button>
          </>
        }
      />

      {Object.keys(formState.errors).length > 0 && formState.isSubmitted && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{t('validation.fixErrors')}</div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard title={t('products.basicInfo')}>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ControlledInput<FormValues> name="nameEn" control={control} label={`${t('common.name')} (English)`} required />
                <div dir="rtl">
                  <ControlledInput<FormValues> name="nameAr" control={control} label={`${t('common.name')} (العربية)`} required />
                </div>
                <ControlledInput<FormValues> name="subtitleEn" control={control} label={`${t('products.subtitleField')} (English)`} />
                <div dir="rtl">
                  <ControlledInput<FormValues> name="subtitleAr" control={control} label={`${t('products.subtitleField')} (العربية)`} />
                </div>
                <ControlledTextarea<FormValues> name="descriptionEn" control={control} label={`${t('common.description')} (English)`} rows={4} required />
                <div dir="rtl">
                  <ControlledTextarea<FormValues> name="descriptionAr" control={control} label={`${t('common.description')} (العربية)`} rows={4} required />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={t('bundles.routine')}
            description={t('bundles.routineHint')}
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => append({ ...EMPTY_ITEM })} disabled={fields.length >= products.length}>
                <Plus className="h-3.5 w-3.5" />
                {t('bundles.addProduct')}
              </Button>
            }
          >
            {itemsMsg && <p className="mb-3 text-sm text-destructive">{t(itemsMsg)}</p>}
            <ol className="space-y-3">
              {fields.map((f, i) => {
                const errs = formState.errors.items?.[i]
                const selected = productById[items[i]?.product]
                const taken = new Set(items.map((it, idx) => (idx !== i ? it.product : '')))
                return (
                  <li key={f.id} className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-brand-cream">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <Controller
                          control={control}
                          name={`items.${i}.product`}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger error={!!errs?.product}>
                                <SelectValue placeholder={t('bundles.pickProduct')} />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p._id} value={p._id} disabled={taken.has(p._id) || !p.isActive}>
                                    {p.nameEn} — {formatMoney(p.price)}
                                    {!p.isActive ? ` (${t('common.inactive')})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <Controller
                        control={control}
                        name={`items.${i}.quantity`}
                        render={({ field }) => (
                          <div className="w-20 shrink-0">
                            <Input type="number" min={1} step={1} className="text-center" aria-label={t('bundles.quantity')} title={t('bundles.quantity')} {...field} />
                          </div>
                        )}
                      />
                      <div className="flex">
                        <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={t('bundles.moveUp')}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label={t('bundles.moveDown')}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" disabled={fields.length <= 2} onClick={() => remove(i)} aria-label={t('common.remove')}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                    <ItemError msg={errs?.product?.message ?? errs?.quantity?.message} />
                    {selected && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Thumb src={selected.image} className="h-8 w-8" />
                        <span>
                          {formatMoney(selected.price)}
                          {selected.discountPrice != null && <> · {t('products.salePrice')}: {formatMoney(selected.discountPrice)}</>} · {t('products.stock')}: {selected.stock}
                        </span>
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-2">
                      {(['stepEn', 'stepAr', 'benefitEn', 'benefitAr'] as const).map((k) => (
                        <div key={k} dir={k.endsWith('Ar') ? 'rtl' : 'ltr'}>
                          <ControlledInput<FormValues>
                            name={`items.${i}.${k}`}
                            control={control}
                            label={`${t(k.startsWith('step') ? 'bundles.step' : 'bundles.benefit')} (${k.endsWith('Ar') ? 'العربية' : 'English'})`}
                            placeholder={k.startsWith('step') ? (k.endsWith('Ar') ? 'الخطوة 1: التنظيف' : 'Step 1: Cleanse') : ''}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          </SectionCard>

          <SectionCard title={t('products.benefits')}>
            <div className="grid gap-6 md:grid-cols-2">
              <Controller control={control} name="benefitsEn" render={({ field }) => <StringListField label="English" value={field.value} onChange={field.onChange} dir="ltr" />} />
              <Controller control={control} name="benefitsAr" render={({ field }) => <StringListField label="العربية" value={field.value} onChange={field.onChange} dir="rtl" />} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title={t('bundles.pricing')}>
            <div className="space-y-4">
              <Controller
                control={control}
                name="pricingMode"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
                    {(['discount', 'manual'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          field.onChange(m)
                          if (m === 'manual' && !manualPrice && preview.price) setValue('bundlePrice', String(preview.price))
                        }}
                        className={cn('rounded-lg py-1.5 text-xs font-semibold', field.value === m ? 'bg-card shadow-sm' : 'text-muted-foreground')}
                      >
                        {t(m === 'discount' ? 'bundles.byDiscount' : 'bundles.manualPrice')}
                      </button>
                    ))}
                  </div>
                )}
              />
              {mode === 'discount' ? (
                <ControlledInput<FormValues> name="discountPercentage" control={control} label={t('bundles.discountPct')} type="number" hint="0 – 99" />
              ) : (
                <Controller
                  control={control}
                  name="bundlePrice"
                  render={({ field, fieldState }) => (
                    <FormField label={`${t('bundles.bundlePrice')} (SAR)`} error={fieldState.error?.message ?? (preview.tooHigh ? 'bundles.priceTooHigh' : undefined)}>
                      <Input type="number" min={0} {...field} />
                    </FormField>
                  )}
                />
              )}

              <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('bundles.originalPrice')}</span>
                  <span className="tabular line-through">{formatMoney(preview.original)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('bundles.discount')}</span>
                  <span className="tabular">{preview.pct}%</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>{t('bundles.bundlePrice')}</span>
                  <span className="tabular">{formatMoney(preview.price)}</span>
                </div>
                <p className="pt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  {t('bundles.customerSaves', { amount: formatMoney(Math.max(0, preview.original - preview.price)) })}
                </p>
                {!preview.complete && <p className="text-xs text-muted-foreground">{t('bundles.previewIncomplete')}</p>}
                {preview.notCheaper && (
                  <p className="flex items-start gap-1.5 pt-1 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t('bundles.notCheaperWarning', { amount: formatMoney(preview.effective) })}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t('bundles.serverPricing')}</p>
              {isEdit && bundle && (
                <p className="text-xs text-muted-foreground">
                  {t('bundles.savedPrice')}: <b className="text-foreground">{formatMoney(bundle.bundlePrice)}</b> ({formatMoney(bundle.originalPrice)}, {bundle.discountPercentage}%)
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title={t('common.image')}>
            <ImageUpload value={image} onChange={setImage} aspectRatio="aspect-[4/3] w-full" />
          </SectionCard>

          <SectionCard title={t('products.organization')}>
            <div className="space-y-4">
              <ControlledInput<FormValues> name="slug" control={control} label={t('products.slug')} hint={t('bundles.slugHint')} />
              <ControlledInput<FormValues> name="sortOrder" control={control} label={t('common.sortOrder')} type="number" />
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3">
                    <span className="text-sm font-medium">{t('common.active')}</span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              {isEdit && bundle?.available === false && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{t('bundles.unavailableHint')}</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </form>
  )
}
