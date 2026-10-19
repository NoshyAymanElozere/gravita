import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledSearchableSelect } from '@/components/shared/form-fields'
import { useAllCountries } from '@/features/settings/api/useCountries'

interface CountrySelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
}

export function CountrySelect<T extends FieldValues>({
  name = 'country_id' as Path<T>,
  control,
  disabled,
  required = true,
  label
}: CountrySelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: countries = [] } = useAllCountries()

  const options = countries.map((c: any) => {
    const nameVal = c.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || c.name || ''
    return { value: String(c.id), label: nameVal }
  })

  return (
    <ControlledSearchableSelect
      name={name}
      control={control}
      label={label !== undefined ? label : `${t('country') || 'Country'} ${required ? '*' : ''}`}
      options={options}
      placeholder={t('chooseCountry') || 'Choose country...'}
      disabled={disabled}
      required={required}
    />
  )
}
