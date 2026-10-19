import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledSearchableSelect } from '@/components/shared/form-fields'
import { useAllTripTypes } from '@/features/settings/api/useTripTypes'

interface TripTypeSelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
}

export function TripTypeSelect<T extends FieldValues>({
  name = 'trip_type_id' as Path<T>,
  control,
  disabled,
  required = true,
  label
}: TripTypeSelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: tripTypes = [] } = useAllTripTypes()

  const options = tripTypes.map((tt: any) => {
    const nameVal = tt.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || tt.name || ''
    return { value: String(tt.id), label: nameVal }
  })

  return (
    <ControlledSearchableSelect
      name={name}
      control={control}
      label={label !== undefined ? label : `${t('tripType') || 'Travel Type'} ${required ? '*' : ''}`}
      options={options}
      placeholder={t('chooseTripType') || 'Choose travel type...'}
      disabled={disabled}
      required={required}
    />
  )
}
