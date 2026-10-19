import { z } from 'zod'

export const touristProgramDaySchema = z.object({
  id: z.any().optional(),
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  descAr: z.string().min(1, 'requiredField'),
  descEn: z.string().min(1, 'requiredField'),
  sort_order: z.coerce.number().min(0)
})

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  country_id: z.string().min(1, 'requiredField'),
  city_id: z.string().min(1, 'requiredField'),
  tourist_destination_id: z.string().min(1, 'requiredField'),
  price: z.coerce.number().min(0),
  steps: z.array(touristProgramDaySchema).min(1, 'atLeastOneDayRequired')
})

export type TouristProgramFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return {
      nameAr: '',
      nameEn: '',
      country_id: '',
      city_id: '',
      tourist_destination_id: '',
      price: 0,
      steps: [
        {
          id: Math.random(),
          nameAr: '',
          nameEn: '',
          descAr: '',
          descEn: '',
          sort_order: 1
        }
      ]
    }
  }

  const nameAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.name || ''
  const nameEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.name || editingItem.name || ''

  const steps = editingItem.steps?.map((step: any) => {
    const dNameAr = step.translations?.find((t: any) => t.language_id === 2)?.name || ''
    const dNameEn = step.translations?.find((t: any) => t.language_id === 1)?.name || step.name || ''
    const dDescAr = step.translations?.find((t: any) => t.language_id === 2)?.description || ''
    const dDescEn = step.translations?.find((t: any) => t.language_id === 1)?.description || step.description || ''
    return {
      id: step.id || Math.random(),
      nameAr: dNameAr,
      nameEn: dNameEn,
      descAr: dDescAr,
      descEn: dDescEn,
      sort_order: step.sort_order ?? 1
    }
  }) || []

  return {
    nameAr,
    nameEn,
    country_id: String(editingItem.country_id || editingItem.tourist_destination?.city?.country_id || ''),
    city_id: String(editingItem.city_id || editingItem.tourist_destination?.city_id || ''),
    tourist_destination_id: String(editingItem.tourist_destination_id || ''),
    price: editingItem.price ?? 0,
    steps
  }
}
