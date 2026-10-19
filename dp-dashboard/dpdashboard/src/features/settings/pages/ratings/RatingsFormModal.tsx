import React, { useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BaseInputField } from '@/components/shared/base-input-field'
import ModalStatus from '@/components/shared/modal-status'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { getInitialValues } from './validationSchema'

interface RatingsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: any | null
  onSave: (data: any) => void
  loading: boolean
  label: string
  isViewOnly?: boolean
}

export function RatingsFormModal({
  open,
  onOpenChange,
  editingItem,
  onSave,
  loading,
  label,
  isViewOnly = false
}: RatingsFormModalProps) {
  const { control, reset, handleSubmit } = useFormContext()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (open) {
      reset(getInitialValues(editingItem))
    }
  }, [editingItem, open, reset])

  const isRtl = i18n.language === 'ar'

  return (
    <ModalStatus
      open={open}
      onOpenChange={onOpenChange}
      title={isViewOnly ? `${t('view')} ${label}` : editingItem ? `${t('edit')} ${label}` : `${t('add')} ${label}`}
      agreeLabel={isViewOnly ? undefined : t('save') || "Save"}
      cancelLabel={isViewOnly ? t('close') || "Close" : t('cancel') || "Cancel"}
      onAgreeButtonClick={isViewOnly ? undefined : handleSubmit(onSave)}
      onCancelButtonClick={() => onOpenChange(false)}
      loading={loading}
      size="lg"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-2 gap-4">
          <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required disabled={isViewOnly} />
          <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required disabled={isViewOnly} />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col gap-1.5 justify-center items-start">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              {t('status') || 'Status'}
            </label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <StatusDropdown
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isViewOnly}
                  usePortal={false}
                />
              )}
            />
          </div>
        </div>
      </div>
    </ModalStatus>
  )
}
