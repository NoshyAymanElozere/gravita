import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ControlledInput } from '@/components/shared/form-fields'
import { ImageUpload, type ImageValue } from '@/components/shared/image-upload'
import { Switch } from '@/components/shared/controls'
import type { Banner } from '@/types/api'
import { useSaveBanner, type BannerPayload } from '../api/useBanners'

// Mirrors gravuta-backend/validations/banner.validation.js
const schema = z.object({
  titleEn: z.string().max(120, 'validation.max120').optional(),
  titleAr: z.string().max(120, 'validation.max120').optional(),
  link: z.string().max(500, 'validation.max500').optional(),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === '' || /^-?\d+$/.test(v), 'validation.integer'),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function BannerFormModal({ open, onOpenChange, banner }: { open: boolean; onOpenChange: (o: boolean) => void; banner: Banner | null }) {
  const { t } = useTranslation()
  const save = useSaveBanner()
  const [image, setImage] = useState<ImageValue>(null)
  const [imageError, setImageError] = useState(false)
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { titleEn: '', titleAr: '', link: '', sortOrder: '0', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    reset({
      titleEn: banner?.titleEn ?? '',
      titleAr: banner?.titleAr ?? '',
      link: banner?.link ?? '',
      sortOrder: String(banner?.sortOrder ?? 0),
      isActive: banner?.isActive ?? true,
    })
    setImage(banner?.image || null)
    setImageError(false)
  }, [open, banner, reset])

  const onSubmit = (v: FormValues) => {
    // The image is required — a new banner needs a file, an edit keeps its existing one
    if (image === null) {
      setImageError(true)
      return
    }
    const payload: BannerPayload = {
      titleEn: v.titleEn?.trim() || '',
      titleAr: v.titleAr?.trim() || '',
      link: v.link?.trim() || '',
      sortOrder: v.sortOrder === '' ? 0 : Number(v.sortOrder),
      isActive: v.isActive,
    }
    save.mutate(
      { id: banner?._id, payload, file: image instanceof File ? image : null },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{banner ? t('banners.edit') : t('banners.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <ImageUpload
            label={t('banners.image')}
            value={image}
            onChange={(v) => {
              setImage(v)
              setImageError(false)
            }}
            aspectRatio="aspect-[21/9] w-full"
            error={imageError ? t('banners.imageRequired') : undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledInput<FormValues> name="titleEn" control={control} label={`${t('banners.fieldTitle')} (English)`} />
            <div dir="rtl">
              <ControlledInput<FormValues> name="titleAr" control={control} label={`${t('banners.fieldTitle')} (العربية)`} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ControlledInput<FormValues> name="link" control={control} label={t('banners.link')} hint={t('banners.linkHint')} className="sm:col-span-2" />
            <ControlledInput<FormValues> name="sortOrder" control={control} label={t('common.sortOrder')} type="number" />
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
