import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Boxes, PackagePlus, ExternalLink } from 'lucide-react'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { ControlledInput, ControlledTextarea, FormField } from '@/components/shared/form-fields'
import { ImageUpload, GalleryUpload, type ImageValue } from '@/components/shared/image-upload'
import { StringListField } from '@/components/shared/list-field'
import { Switch } from '@/components/shared/controls'
import { Skeleton } from '@/components/shared/misc'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatMoney, pickLang } from '@/utils/format'
import { storefrontUrl } from '@/utils/media'
import type { Product } from '@/types/api'
import { useCategoryOptions } from '@/features/categories/api/useCategories'
import { useProduct, useSaveProduct } from '../api/useProducts'
import { StockBadge } from '../components/StockBadge'
import { StockDialog } from '../components/StockDialog'

const money = z
  .string()
  .trim()
  .refine((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0, 'validation.nonNegativeNumber')
const optionalMoney = z
  .string()
  .trim()
  .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'validation.nonNegativeNumber')
const int = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v), 'validation.nonNegativeInteger')

// Mirrors gravuta-backend/validations/product.validation.js
const schema = z
  .object({
    nameEn: z.string().trim().min(3, 'validation.min3').max(150, 'validation.max150'),
    nameAr: z.string().trim().min(2, 'validation.min2').max(150, 'validation.max150'),
    slug: z
      .string()
      .trim()
      .refine((v) => v === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), 'validation.slug'),
    subtitleEn: z.string().max(300, 'validation.max300'),
    subtitleAr: z.string().max(300, 'validation.max300'),
    descriptionEn: z.string().trim().min(5, 'validation.min5').max(3000, 'validation.max3000'),
    descriptionAr: z.string().max(3000, 'validation.max3000'),
    ingredientsEn: z.string().max(3000, 'validation.max3000'),
    ingredientsAr: z.string().max(3000, 'validation.max3000'),
    howToUseEn: z.string().max(3000, 'validation.max3000'),
    howToUseAr: z.string().max(3000, 'validation.max3000'),
    skinTypeEn: z.string().max(200, 'validation.max200'),
    skinTypeAr: z.string().max(200, 'validation.max200'),
    benefitsEn: z.array(z.string()),
    benefitsAr: z.array(z.string()),
    price: money,
    discountPrice: optionalMoney,
    size: z.string().max(50, 'validation.max50'),
    category: z.string().min(1, 'validation.required'),
    stock: int,
    lowStockThreshold: int,
    isBestSeller: z.boolean(),
    isNew: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((d) => d.discountPrice === '' || Number(d.discountPrice) < Number(d.price), {
    path: ['discountPrice'],
    message: 'products.discountBelowPrice',
  })

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  nameEn: '',
  nameAr: '',
  slug: '',
  subtitleEn: '',
  subtitleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  ingredientsEn: '',
  ingredientsAr: '',
  howToUseEn: '',
  howToUseAr: '',
  skinTypeEn: '',
  skinTypeAr: '',
  benefitsEn: [],
  benefitsAr: [],
  price: '',
  discountPrice: '',
  size: '',
  category: '',
  stock: '0',
  lowStockThreshold: '5',
  isBestSeller: false,
  isNew: false,
  isActive: true,
}

function toForm(p: Product): FormValues {
  return {
    nameEn: p.nameEn ?? '',
    nameAr: p.nameAr ?? '',
    slug: p.slug ?? '',
    subtitleEn: p.subtitleEn ?? '',
    subtitleAr: p.subtitleAr ?? '',
    descriptionEn: p.descriptionEn ?? '',
    descriptionAr: p.descriptionAr ?? '',
    ingredientsEn: p.ingredientsEn ?? '',
    ingredientsAr: p.ingredientsAr ?? '',
    howToUseEn: p.howToUseEn ?? '',
    howToUseAr: p.howToUseAr ?? '',
    skinTypeEn: p.skinTypeEn ?? '',
    skinTypeAr: p.skinTypeAr ?? '',
    benefitsEn: p.benefitsEn ?? [],
    benefitsAr: p.benefitsAr ?? [],
    price: String(p.price ?? ''),
    discountPrice: p.discountPrice == null ? '' : String(p.discountPrice),
    size: p.size ?? '',
    category: typeof p.category === 'string' ? p.category : (p.category?._id ?? ''),
    stock: String(p.stock ?? 0),
    lowStockThreshold: String(p.lowStockThreshold ?? 5),
    isBestSeller: !!p.isBestSeller,
    isNew: !!p.isNew,
    isActive: p.isActive !== false,
  }
}

function SwitchRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useProduct(id)
  const { data: categories = [] } = useCategoryOptions()
  const save = useSaveProduct()
  const [image, setImage] = useState<ImageValue>(null)
  const [gallery, setGallery] = useState<Array<File | string>>([])
  const [stockOpen, setStockOpen] = useState(false)

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const { control, handleSubmit, reset, watch, formState } = form

  const loadedId = useRef<string | null>(null)
  useEffect(() => {
    // Load once per product, and refresh after saves — but never wipe unsaved edits (e.g. after a stock adjustment)
    if (data?.product && (loadedId.current !== data.product._id || !formState.isDirty)) {
      loadedId.current = data.product._id
      reset(toForm(data.product))
      setImage(data.product.image || null)
      setGallery(data.product.galleryImages ?? [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reset])

  const product = data?.product
  const price = Number(watch('price')) || 0
  const discount = watch('discountPrice')

  const onSubmit = (v: FormValues) => {
    const payload: Record<string, unknown> = {
      nameEn: v.nameEn.trim(),
      nameAr: v.nameAr.trim(),
      subtitleEn: v.subtitleEn.trim(),
      subtitleAr: v.subtitleAr.trim(),
      descriptionEn: v.descriptionEn.trim(),
      descriptionAr: v.descriptionAr.trim(),
      ingredientsEn: v.ingredientsEn.trim(),
      ingredientsAr: v.ingredientsAr.trim(),
      howToUseEn: v.howToUseEn.trim(),
      howToUseAr: v.howToUseAr.trim(),
      skinTypeEn: v.skinTypeEn.trim(),
      skinTypeAr: v.skinTypeAr.trim(),
      benefitsEn: v.benefitsEn.map((b) => b.trim()).filter(Boolean),
      benefitsAr: v.benefitsAr.map((b) => b.trim()).filter(Boolean),
      price: Number(v.price),
      size: v.size.trim(),
      category: v.category,
      lowStockThreshold: Number(v.lowStockThreshold),
      isBestSeller: v.isBestSeller,
      isNew: v.isNew,
      isActive: v.isActive,
    }
    if (v.slug.trim()) payload.slug = v.slug.trim()
    if (v.discountPrice !== '') payload.discountPrice = Number(v.discountPrice)
    else if (isEdit && product?.discountPrice != null) payload.discountPrice = null // clear the sale price
    // Stock is only sent when it was edited (quick adjustments use the stock dialog)
    if (!isEdit || formState.dirtyFields.stock) payload.stock = Number(v.stock)
    if (image === null && isEdit && product?.image) payload.image = ''

    save.mutate(
      {
        id,
        payload,
        image: image instanceof File ? image : null,
        gallery: gallery.filter((g): g is File => g instanceof File),
        keptGallery: gallery.filter((g): g is string => typeof g === 'string'),
      },
      {
        onSuccess: (res) => {
          if (!isEdit && res.data?._id) navigate(`/products/${res.data._id}/edit`, { replace: true })
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
  if (isEdit && !isLoading && !product) {
    return <EmptyState icon={Package} title={t('products.notFound')} action={<Button asChild variant="outline"><Link to="/products">{t('products.title')}</Link></Button>} />
  }

  const bilingual = (base: string, label: string, opts: { textarea?: boolean; rows?: number; required?: boolean } = {}) => (
    <div className="grid gap-4 md:grid-cols-2">
      {(['En', 'Ar'] as const).map((lang) => {
        const name = `${base}${lang}` as keyof FormValues
        const fullLabel = `${label} (${lang === 'En' ? 'English' : 'العربية'})`
        return (
          <div key={lang} dir={lang === 'Ar' ? 'rtl' : 'ltr'}>
            {opts.textarea ? (
              <ControlledTextarea<FormValues> name={name} control={control} label={fullLabel} rows={opts.rows ?? 4} required={opts.required && (lang === 'En' || base === 'name')} />
            ) : (
              <ControlledInput<FormValues> name={name} control={control} label={fullLabel} required={opts.required && (lang === 'En' || base === 'name')} />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" noValidate>
      <PageHeader
        backTo="/products"
        title={isEdit ? product?.nameEn : t('products.add')}
        description={isEdit ? t('products.editSubtitle') : t('products.createSubtitle')}
        actions={
          <>
            {isEdit && product?.isActive && (
              <Button asChild variant="outline" type="button">
                <a href={storefrontUrl(`/product-details?type=product&id=${product._id}`)} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t('common.viewOnStore')}
                </a>
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={save.isPending}>
              {isEdit ? t('common.saveChanges') : t('products.create')}
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
              {bilingual('name', t('products.name'), { required: true })}
              {bilingual('subtitle', t('products.subtitleField'))}
              {bilingual('description', t('products.description'), { textarea: true, rows: 5, required: true })}
            </div>
          </SectionCard>

          <SectionCard title={t('products.details')}>
            <Tabs defaultValue="ingredients">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="ingredients">{t('products.ingredients')}</TabsTrigger>
                <TabsTrigger value="howToUse">{t('products.howToUse')}</TabsTrigger>
                <TabsTrigger value="skinType">{t('products.skinType')}</TabsTrigger>
                <TabsTrigger value="benefits">{t('products.benefits')}</TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients">{bilingual('ingredients', t('products.ingredients'), { textarea: true })}</TabsContent>
              <TabsContent value="howToUse">{bilingual('howToUse', t('products.howToUse'), { textarea: true })}</TabsContent>
              <TabsContent value="skinType">{bilingual('skinType', t('products.skinType'))}</TabsContent>
              <TabsContent value="benefits">
                <div className="grid gap-6 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="benefitsEn"
                    render={({ field }) => <StringListField label={`${t('products.benefits')} (English)`} value={field.value} onChange={field.onChange} dir="ltr" />}
                  />
                  <Controller
                    control={control}
                    name="benefitsAr"
                    render={({ field }) => <StringListField label={`${t('products.benefits')} (العربية)`} value={field.value} onChange={field.onChange} dir="rtl" />}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </SectionCard>

          <SectionCard title={t('products.media')}>
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <ImageUpload label={t('products.mainImage')} value={image} onChange={setImage} />
              <GalleryUpload label={t('products.gallery')} value={gallery} onChange={setGallery} hint={t('products.galleryHint')} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title={t('products.pricing')}>
            <div className="space-y-4">
              <ControlledInput<FormValues> name="price" control={control} label={`${t('products.price')} (SAR)`} type="number" required />
              <ControlledInput<FormValues> name="discountPrice" control={control} label={`${t('products.salePrice')} (SAR)`} type="number" hint={t('products.salePriceHint')} />
              {discount !== '' && price > 0 && Number(discount) < price && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {t('products.saleSummary', { pct: Math.round((1 - Number(discount) / price) * 100), price: formatMoney(Number(discount)) })}
                </p>
              )}
              {isEdit && data?.bundles?.length ? <p className="text-xs text-muted-foreground">{t('products.priceSyncHint')}</p> : null}
            </div>
          </SectionCard>

          <SectionCard title={t('products.organization')}>
            <div className="space-y-4">
              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <FormField label={t('products.category')} required error={fieldState.error?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger error={!!fieldState.error}>
                        <SelectValue placeholder={t('products.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {pickLang(c, 'name')}
                            {!c.isActive ? ` (${t('common.inactive')})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
              <ControlledInput<FormValues> name="size" control={control} label={t('products.size')} placeholder="50 ml" />
              <ControlledInput<FormValues> name="slug" control={control} label={t('products.slug')} hint={t('common.slugHint')} placeholder="ocean-glow-serum" />
            </div>
          </SectionCard>

          <SectionCard
            title={t('products.inventory')}
            actions={
              isEdit && product ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setStockOpen(true)}>
                  <PackagePlus className="h-3.5 w-3.5" />
                  {t('products.adjustStock')}
                </Button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {isEdit && product && (
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t('products.sold')}: <b className="text-foreground">{product.soldCount}</b></span>
                  <StockBadge status={product.stockStatus} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <ControlledInput<FormValues> name="stock" control={control} label={t('products.stock')} type="number" />
                <ControlledInput<FormValues> name="lowStockThreshold" control={control} label={t('products.lowStockThreshold')} type="number" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t('products.visibility')}>
            <div className="space-y-2">
              <Controller control={control} name="isActive" render={({ field }) => <SwitchRow label={t('common.active')} hint={t('products.activeHint')} checked={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="isBestSeller" render={({ field }) => <SwitchRow label={t('products.bestSeller')} checked={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="isNew" render={({ field }) => <SwitchRow label={t('products.newArrival')} checked={field.value} onChange={field.onChange} />} />
            </div>
          </SectionCard>

          {isEdit && (
            <SectionCard title={<span className="flex items-center gap-2"><Boxes className="h-4 w-4" />{t('products.inBundles')}</span>} bodyClassName="p-2">
              {data?.bundles?.length ? (
                <ul className="divide-y divide-border">
                  {data.bundles.map((b) => (
                    <li key={b._id}>
                      <Link to={`/bundles/${b._id}/edit`} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-accent">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{pickLang(b, 'name')}</span>
                          <span className="text-xs text-muted-foreground">{formatMoney(b.bundlePrice)}</span>
                        </span>
                        {!b.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{t('common.inactive')}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t('products.noBundles')}</p>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </form>
    {/* Outside the <form>: React events from portals bubble through the component tree */}
    {product && <StockDialog product={stockOpen ? product : null} onClose={() => setStockOpen(false)} />}
    </>
  )
}
