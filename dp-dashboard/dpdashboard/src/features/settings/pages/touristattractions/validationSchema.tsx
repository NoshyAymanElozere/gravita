import { z } from 'zod'

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  descAr: z.string().min(1, 'requiredField'),
  descEn: z.string().min(1, 'requiredField'),
  tourist_destination_id: z.string().min(1, 'requiredField'),
  price: z.string().min(1, 'requiredField'),
})

export type TouristAttractionsFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return { nameAr: '', nameEn: '', descAr: '', descEn: '', tourist_destination_id: '', price: '' }
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
    tourist_destination_id: String(editingItem.tourist_destination_id || ''),
    price: String(editingItem.price || '')
  }
}
