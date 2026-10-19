import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledSearchableSelect } from '@/components/shared/form-fields'
import { useAllTouristPrograms } from '@/features/settings/api/useTouristPrograms'

interface TouristProgramSelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
  touristDestinationId?: number | string
}

export function TouristProgramSelect<T extends FieldValues>({
  name = 'tourist_program_id' as Path<T>,
  control,
  disabled,
  required = true,
  label,
  touristDestinationId
}: TouristProgramSelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: programs = [] } = useAllTouristPrograms()

  // Filter programs by destination if touristDestinationId is provided
  const filteredPrograms = touristDestinationId
    ? programs.filter((p: any) => String(p.tourist_destination_id) === String(touristDestinationId))
    : programs

  const options = filteredPrograms.map((p: any) => {
    const nameVal = p.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || p.name || ''
    return { value: String(p.id), label: `${nameVal} (${p.price} USD)` }
  })

  const placeholder = touristDestinationId
    ? (t('chooseTouristProgram') || 'Choose tourist program...')
    : (t('chooseDestinationFirst') || 'Select destination first')

  return (
    <ControlledSearchableSelect
      name={name}
      control={control}
      label={label !== undefined ? label : `${t('touristProgram') || 'Tourist Program'} ${required ? '*' : ''}`}
      options={options}
      placeholder={placeholder}
      disabled={disabled || !touristDestinationId}
      required={required}
    />
  )
}

export default TouristProgramSelect
