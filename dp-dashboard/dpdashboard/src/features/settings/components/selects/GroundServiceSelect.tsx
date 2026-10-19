import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ControlledMultiSelect } from '@/components/shared/form-fields'
import { useAllGroundServices } from '@/features/settings/api/useGroundServices'

interface GroundServiceSelectProps<T extends FieldValues> {
  name?: Path<T>
  control: Control<T>
  disabled?: boolean
  required?: boolean
  label?: string
}

export function GroundServiceSelect<T extends FieldValues>({
  name = 'ground_handling_services' as Path<T>,
  control,
  disabled,
  required = false,
  label
}: GroundServiceSelectProps<T>) {
  const { i18n, t } = useTranslation()
  const { data: groundServices = [] } = useAllGroundServices()

  const options = groundServices.map((g: any) => {
    const nameVal = g.translations?.find((trans: any) => trans.language_id === (i18n.language === 'ar' ? 2 : 1))?.name || g.name || ''
    return { value: String(g.id), label: `${nameVal} (${g.price} USD)` }
  })

  return (
    <ControlledMultiSelect
      name={name}
      control={control}
      label={label !== undefined ? label : t('groundServices') || 'Ground Services'}
      options={options}
      placeholder={t('selectGroundServices') || 'Select ground services...'}
      disabled={disabled}
      required={required}
    />
  )
}
export default GroundServiceSelect
