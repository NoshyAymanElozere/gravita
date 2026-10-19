import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ControlledInput, ControlledTextarea } from '@/components/shared/form-fields'
import { ImageUpload, type ImageValue } from '@/components/shared/image-upload'
import { Switch } from '@/components/shared/controls'
import type { Category } from '@/types/api'
import { useSaveCategory, type CategoryPayload } from '../api/useCategories'

// Mirrors gravuta-backend/validations/category.validation.js
const schema = z.object({
  nameEn: z.string().trim().min(2, 'validation.min2').max(80, 'validation.max80'),
  nameAr: z.string().trim().min(2, 'validation.min2').max(80, 'validation.max80'),
  descriptionEn: z.string().max(500, 'validation.max500'),
  descriptionAr: z.string().max(500, 'validation.max500'),
  slug: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), 'validation.slug'),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === '' || /^-?\d+$/.test(v), 'validation.integer'),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function CategoryFormModal({ open, onOpenChange, category }: { open: boolean; onOpenChange: (o: boolean) => void; category: Category | null }) {
  const { t } = useTranslation()
  const save = useSaveCategory()
  const [image, setImage] = useState<ImageValue>(null)
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', slug: '', sortOrder: '0', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    reset({
      nameEn: category?.nameEn ?? '',
      nameAr: category?.nameAr ?? '',
      descriptionEn: category?.descriptionEn ?? '',
      descriptionAr: category?.descriptionAr ?? '',
      slug: category?.slug ?? '',
      sortOrder: String(category?.sortOrder ?? 0),
      isActive: category?.isActive ?? true,
    })
    setImage(category?.image || null)
  }, [open, category, reset])

  const onSubmit = (v: FormValues) => {
    const payload: CategoryPayload = {
      nameEn: v.nameEn.trim(),
      nameAr: v.nameAr.trim(),
      descriptionEn: v.descriptionEn.trim(),
      descriptionAr: v.descriptionAr.trim(),
      sortOrder: v.sortOrder === '' ? 0 : Number(v.sortOrder),
      isActive: v.isActive,
    }
    if (v.slug.trim()) payload.slug = v.slug.trim()
    if (image === null && category?.image) payload.image = ''
    save.mutate(
      { id: category?._id, payload, file: image instanceof File ? image : null },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? t('categories.edit') : t('categories.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <ImageUpload label={t('common.image')} value={image} onChange={setImage} />
            <div className="space-y-4">
              <ControlledInput<FormValues> name="nameEn" control={control} label={`${t('common.name')} (English)`} required />
              <div dir="rtl">
                <ControlledInput<FormValues> name="nameAr" control={control} label={`${t('common.name')} (العربية)`} required />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledTextarea<FormValues> name="descriptionEn" control={control} label={`${t('common.description')} (English)`} rows={3} />
            <div dir="rtl">
              <ControlledTextarea<FormValues> name="descriptionAr" control={control} label={`${t('common.description')} (العربية)`} rows={3} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ControlledInput<FormValues> name="slug" control={control} label={t('products.slug')} hint={t('common.slugHint')} className="sm:col-span-2" />
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
