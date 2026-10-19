import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledMultiSelect } from '@/components/shared/form-fields'
import { useAllTouristAttractions } from '@/features/settings/api/useTouristAttractions'

interface TouristAttractionSelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
  touristDestinationId?: number | string
}

export function TouristAttractionSelect<T extends FieldValues>({
  name = 'attractions' as Path<T>,
  control,
  disabled,
  required = false,
  label,
  touristDestinationId
}: TouristAttractionSelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: attractions = [] } = useAllTouristAttractions(touristDestinationId)

  const options = attractions.map((a: any) => {
    const nameVal = a.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || a.name || ''
    return { value: String(a.id), label: `${nameVal} (${a.price} USD)` }
  })

  const placeholder = touristDestinationId
    ? (t('selectAttractions') || 'Select attractions...')
    : (t('chooseDestinationFirst') || 'Select destination first')

  return (
    <ControlledMultiSelect
      name={name}
      control={control}
      label={label !== undefined ? label : t('touristAttractions') || 'Tourist Attractions'}
      options={options}
      placeholder={placeholder}
      disabled={disabled || !touristDestinationId}
      required={required}
    />
  )
}
export default TouristAttractionSelect
