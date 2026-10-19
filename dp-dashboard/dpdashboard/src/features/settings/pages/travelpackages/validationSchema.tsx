import { z } from 'zod'

export const schema = z.object({
  nameAr: z.string().min(1, 'requiredField'),
  nameEn: z.string().min(1, 'requiredField'),
  descAr: z.string().min(1, 'requiredField'),
  descEn: z.string().min(1, 'requiredField'),
  country_id: z.string().min(1, 'requiredField'),
  city_id: z.string().min(1, 'requiredField'),
  tourist_destination_id: z.string().min(1, 'requiredField'),
  start_date: z.string().min(1, 'requiredField'),
  end_date: z.string().min(1, 'requiredField'),
  number_of_individuals: z.string().min(1, 'requiredField'),
  custom_price: z.string().optional(),
  is_active: z.boolean(),
  image: z.any().optional(),
  gallery: z.any().optional(),
  tourist_program_id: z.string().min(1, 'requiredField'),
  ground_handling_service_ids: z.array(z.string()).optional(),
  trip_type_id: z.string().min(1, 'requiredField'),
  is_special: z.boolean(),
  duration_days: z.string().min(1, 'requiredField')
})

export type TravelPackagesFormValues = z.infer<typeof schema>

export const getInitialValues = (editingItem: any | null) => {
  if (!editingItem) {
    return {
      nameAr: '',
      nameEn: '',
      descAr: '',
      descEn: '',
      country_id: '',
      city_id: '',
      tourist_destination_id: '',
      start_date: '',
      end_date: '',
      number_of_individuals: '',
      custom_price: '',
      is_active: true,
      image: null,
      gallery: [],
      tourist_program_id: '',
      ground_handling_service_ids: [],
      trip_type_id: '',
      is_special: false,
      duration_days: ''
    }
  }

  const nameAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.name || ''
  const nameEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.name || editingItem.name || ''
  const descAr = editingItem.translations?.find((t: any) => t.language_id === 2)?.description || ''
  const descEn = editingItem.translations?.find((t: any) => t.language_id === 1)?.description || editingItem.description || ''

  const ground_handling_service_ids = editingItem.ground_handling_services?.map((s: any) => String(s.id)) || []

  return {
    nameAr,
    nameEn,
    descAr,
    descEn,
    country_id: String(editingItem.tourist_destination?.city?.country_id || ''),
    city_id: String(editingItem.tourist_destination?.city_id || ''),
    tourist_destination_id: String(editingItem.tourist_destination_id || ''),
    start_date: editingItem.start_date || '',
    end_date: editingItem.end_date || '',
    number_of_individuals: String(editingItem.number_of_individuals || ''),
    custom_price: editingItem.custom_price ? String(editingItem.custom_price) : '',
    is_active: editingItem.is_active ?? true,
    image: editingItem.image?.file_path || editingItem.image_url || null,
    gallery: editingItem.gallery || [],
    tourist_program_id: editingItem.tourist_program?.id ? String(editingItem.tourist_program.id) : (editingItem.tourist_program_id ? String(editingItem.tourist_program_id) : ''),
    ground_handling_service_ids,
    trip_type_id: editingItem.trip_type_id ? String(editingItem.trip_type_id) : '',
    is_special: editingItem.is_special ? (Number(editingItem.is_special) === 1 || editingItem.is_special === true) : false,
    duration_days: editingItem.duration_days ? String(editingItem.duration_days) : ''
  }
}
