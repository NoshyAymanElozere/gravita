import { z } from 'zod'

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  descAr: z.string().min(1, 'requiredField'),
  descEn: z.string().min(1, 'requiredField'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'requiredField')),
  is_active: z.boolean(),
  image: z.any().optional()
})

export type GroundServicesFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return { nameAr: '', nameEn: '', descAr: '', descEn: '', price: 0, is_active: true, image: null }
  }
  const nameAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.name || ''
  const nameEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.name || editingItem.name || ''
  const descAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.description || ''
  const descEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.description || editingItem.description || ''
  return {
    nameAr,
    nameEn,
    descAr,
    descEn,
    price: editingItem.price || 0,
    is_active: editingItem.is_active ?? true,
    image: null
  }
}
