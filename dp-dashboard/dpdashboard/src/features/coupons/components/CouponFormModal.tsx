import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ControlledInput, FormField } from '@/components/shared/form-fields'
import { Switch } from '@/components/shared/controls'
import { cn } from '@/utils/utils'
import { toDateInput } from '@/utils/format'
import type { Coupon } from '@/types/api'
import { useSaveCoupon, type CouponPayload } from '../api/useCoupons'

const optNum = z.string().trim().refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'validation.nonNegativeNumber')
const optInt = z.string().trim().refine((v) => v === '' || /^\d+$/.test(v), 'validation.nonNegativeInteger')

// Mirrors gravuta-backend/validations/coupon.validation.js
const schema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,40}$/, 'coupons.codeRule'),
    discountType: z.enum(['percentage', 'fixed']),
    value: z.string().trim().refine((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0, 'validation.nonNegativeNumber'),
    minOrderAmount: optNum,
    maxDiscount: optNum,
    expiresAt: z.string(),
    usageLimit: optInt,
    perUserLimit: z.string().trim().refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 1), 'validation.positiveInteger'),
    descriptionEn: z.string().max(300, 'validation.max300'),
    descriptionAr: z.string().max(300, 'validation.max300'),
    isActive: z.boolean(),
  })
  .refine((d) => d.discountType !== 'percentage' || Number(d.value) <= 100, { path: ['value'], message: 'coupons.percentMax' })
type FormValues = z.infer<typeof schema>

export function CouponFormModal({ open, onOpenChange, coupon }: { open: boolean; onOpenChange: (o: boolean) => void; coupon: Coupon | null }) {
  const { t } = useTranslation()
  const save = useSaveCoupon()
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      value: '',
      minOrderAmount: '0',
      maxDiscount: '',
      expiresAt: '',
      usageLimit: '',
      perUserLimit: '1',
      descriptionEn: '',
      descriptionAr: '',
      isActive: true,
    },
  })
  const type = watch('discountType')

  useEffect(() => {
    if (!open) return
    reset({
      code: coupon?.code ?? '',
      discountType: coupon?.discountType ?? 'percentage',
      value: coupon ? String(coupon.value) : '',
      minOrderAmount: String(coupon?.minOrderAmount ?? 0),
      maxDiscount: coupon?.maxDiscount == null ? '' : String(coupon.maxDiscount),
      expiresAt: toDateInput(coupon?.expiresAt),
      usageLimit: coupon?.usageLimit == null ? '' : String(coupon.usageLimit),
      perUserLimit: String(coupon?.perUserLimit ?? 1),
      descriptionEn: coupon?.descriptionEn ?? '',
      descriptionAr: coupon?.descriptionAr ?? '',
      isActive: coupon?.isActive ?? true,
    })
  }, [open, coupon, reset])

  const onSubmit = (v: FormValues) => {
    const payload: CouponPayload = {
      code: v.code.trim().toUpperCase(),
      discountType: v.discountType,
      value: Number(v.value),
      minOrderAmount: v.minOrderAmount === '' ? 0 : Number(v.minOrderAmount),
      // Empty = no cap / never expires / unlimited (null clears a previous value)
      maxDiscount: v.maxDiscount === '' ? null : Number(v.maxDiscount),
      expiresAt: v.expiresAt ? new Date(`${v.expiresAt}T23:59:59`).toISOString() : null,
      usageLimit: v.usageLimit === '' ? null : Number(v.usageLimit),
      perUserLimit: v.perUserLimit === '' ? 1 : Number(v.perUserLimit),
      descriptionEn: v.descriptionEn.trim(),
      descriptionAr: v.descriptionAr.trim(),
      isActive: v.isActive,
    }
    save.mutate({ id: coupon?._id, payload }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? t('coupons.edit') : t('coupons.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <FormField label={t('coupons.code')} required error={fieldState.error?.message} hint={t('coupons.codeHint')}>
                  <input
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    dir="ltr"
                    className={cn(
                      'flex h-10 w-full rounded-xl border border-input bg-background px-3.5 font-mono text-sm uppercase tracking-wider shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                      fieldState.error && 'border-destructive'
                    )}
                    placeholder="SUMMER20"
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="discountType"
              render={({ field }) => (
                <FormField label={t('coupons.type')}>
                  <div className="grid h-10 grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
                    {(['percentage', 'fixed'] as const).map((k) => (
                      <button key={k} type="button" onClick={() => field.onChange(k)} className={cn('rounded-lg text-xs font-semibold', field.value === k ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
                        {t(`coupons.${k}`)}
                      </button>
                    ))}
                  </div>
                </FormField>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ControlledInput<FormValues> name="value" control={control} type="number" required label={type === 'percentage' ? `${t('coupons.value')} (%)` : `${t('coupons.value')} (SAR)`} />
            <ControlledInput<FormValues> name="minOrderAmount" control={control} type="number" label={`${t('coupons.minOrder')} (SAR)`} />
            <ControlledInput<FormValues> name="maxDiscount" control={control} type="number" label={`${t('coupons.maxDiscount')} (SAR)`} hint={t('coupons.emptyNoLimit')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ControlledInput<FormValues> name="expiresAt" control={control} type="date" label={t('coupons.expiresAt')} hint={t('coupons.emptyNever')} />
            <ControlledInput<FormValues> name="usageLimit" control={control} type="number" label={t('coupons.usageLimit')} hint={t('coupons.emptyUnlimited')} />
            <ControlledInput<FormValues> name="perUserLimit" control={control} type="number" label={t('coupons.perUserLimit')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledInput<FormValues> name="descriptionEn" control={control} label={`${t('common.description')} (English)`} />
            <div dir="rtl">
              <ControlledInput<FormValues> name="descriptionAr" control={control} label={`${t('common.description')} (العربية)`} />
            </div>
          </div>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={save.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
