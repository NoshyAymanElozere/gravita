import { z } from 'zod'

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  is_active: z.boolean()
})

export type TravelerTypesFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return { nameAr: '', nameEn: '', is_active: true }
  }
  const nameAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.name || ''
  const nameEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.name || editingItem.name || ''
  return {
    nameAr,
    nameEn,
    is_active: editingItem.is_active ?? true
  }
}
