import { z } from 'zod'

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  descAr: z.string().min(1, 'requiredField'),
  descEn: z.string().min(1, 'requiredField'),
  is_active: z.boolean()
})

export type PropertyTypesFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return { nameAr: '', nameEn: '', descAr: '', descEn: '', is_active: true }
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
    is_active: editingItem.is_active ?? true
  }
}
