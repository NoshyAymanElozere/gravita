import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledSearchableSelect } from '@/components/shared/form-fields'
import { useAllCities } from '@/features/settings/api/useCities'

interface CitySelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
  countryId?: string | number
}

export function CitySelect<T extends FieldValues>({
  name = 'city_id' as Path<T>,
  control,
  disabled,
  required = true,
  label,
  countryId
}: CitySelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: cities = [] } = useAllCities()

  let filteredCities = cities
  if (countryId) {
    filteredCities = cities.filter((c: any) => String(c.country_id) === String(countryId))
  }

  const options = filteredCities.map((c: any) => {
    const nameVal = c.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || c.name || ''
    return { value: String(c.id), label: nameVal }
  })

  return (
    <ControlledSearchableSelect
      name={name}
      control={control}
      label={label !== undefined ? label : `${t('city') || 'City'} ${required ? '*' : ''}`}
      options={options}
      placeholder={t('chooseCity') || 'Choose city...'}
      disabled={disabled}
      required={required}
    />
  )
}
