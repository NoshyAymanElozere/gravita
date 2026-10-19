import { useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ModalStatus } from '@/components/shared/modal-status'
import { BaseInputField } from '@/components/shared/base-input-field'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import type { CompanyStaffMember } from '../api/useCompanyTeam'

export interface TeamFormData {
  name: string
  email: string
  phone: string
  role: CompanyStaffMember['role']
  is_active: boolean
}

interface TeamFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: CompanyStaffMember | null
  onSave: (data: TeamFormData) => void
  loading: boolean
  isViewOnly?: boolean
}

export function TeamFormModal({
  open,
  onOpenChange,
  editingItem,
  onSave,
  loading,
  isViewOnly = false
}: TeamFormModalProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'

  const methods = useForm<TeamFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'claims_officer',
      is_active: true
    }
  })

  const { reset, handleSubmit, control, register } = methods

  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          name: editingItem.name || '',
          email: editingItem.email || '',
          phone: editingItem.phone || '',
          role: editingItem.role || 'claims_officer',
          is_active: editingItem.status === 'active'
        })
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          role: 'claims_officer',
          is_active: true
        })
      }
    }
  }, [open, editingItem, reset])

  const modalTitle = isViewOnly
    ? (t('viewTeamMember') || 'عرض بيانات موظف الشركة')
    : editingItem
      ? (t('editTeamMember') || 'تعديل بيانات موظف الشركة')
      : (t('addTeamMember') || 'إضافة موظف جديد لفريق الشركة')

  const agreeLabel = isViewOnly
    ? undefined
    : editingItem
      ? (t('save') || 'حفظ التغييرات')
      : (t('add') || 'إضافة الموظف')

  const cancelLabel = isViewOnly
    ? (t('close') || 'إغلاق')
    : (t('cancel') || 'إلغاء')

  return (
    <ModalStatus
      open={open}
      onOpenChange={onOpenChange}
      title={modalTitle}
      agreeLabel={agreeLabel}
      cancelLabel={cancelLabel}
      onAgreeButtonClick={isViewOnly ? undefined : handleSubmit(onSave)}
      onCancelButtonClick={() => onOpenChange(false)}
      loading={loading}
      size="md"
    >
      <FormProvider {...methods}>
        <div className="space-y-4 py-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <BaseInputField
            name="name"
            label={t('name') || 'اسم الموظف *'}
            placeholder="مثال: عبدالرحمن الدخيل"
            disabled={isViewOnly}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInputField
              name="email"
              label={t('email') || 'البريد الإلكتروني للعمل *'}
              placeholder="name@company.com.sa"
              disabled={isViewOnly}
            />
            <BaseInputField
              name="phone"
              label={t('phone') || 'رقم الجوال *'}
              placeholder="+966 50 000 0000"
              disabled={isViewOnly}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {t('role') || 'الدور والصلاحية *'}
              </label>
              <select
                {...register('role')}
                disabled={isViewOnly}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main disabled:bg-gray-100/80 disabled:cursor-not-allowed"
              >
                <option value="admin">مدير حساب الشركة (Company Admin)</option>
                <option value="claims_officer">أخصائي تسوية مطالبات (Claims Officer)</option>
                <option value="accountant">محاسب ومسؤول مالي (Accountant)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 justify-center items-start">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {t('status') || 'حالة الحساب'}
              </label>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <StatusDropdown
                    value={field.value}
                    onChange={async (val) => field.onChange(val)}
                    disabled={isViewOnly}
                    usePortal={false}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </FormProvider>
    </ModalStatus>
  )
}
