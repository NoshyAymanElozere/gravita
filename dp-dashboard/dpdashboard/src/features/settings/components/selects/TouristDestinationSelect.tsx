import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledSearchableSelect } from '@/components/shared/form-fields'
import { useAllTouristDestinations } from '@/features/settings/api/useTouristDestinations'

interface TouristDestinationSelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
  cityId?: string | number
}

export function TouristDestinationSelect<T extends FieldValues>({
  name = 'tourist_destination_id' as Path<T>,
  control,
  disabled,
  required = true,
  label,
  cityId
}: TouristDestinationSelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: destinations = [] } = useAllTouristDestinations()

  let filteredDestinations = destinations
  if (cityId) {
    filteredDestinations = destinations.filter((d: any) => String(d.city_id) === String(cityId))
  }

  const options = filteredDestinations.map((d: any) => {
    const nameVal = d.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || d.name || ''
    return { value: String(d.id), label: nameVal }
  })

  return (
    <ControlledSearchableSelect
      name={name}
      control={control}
      label={label !== undefined ? label : `${t('touristDestination') || 'Tourist Destination'} ${required ? '*' : ''}`}
      options={options}
      placeholder={t('chooseDestination') || 'Choose destination...'}
      disabled={disabled}
      required={required}
    />
  )
}
