import { useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ModalStatus } from '@/components/shared/modal-status'
import { BaseInputField } from '@/components/shared/base-input-field'
import { BaseTextAreaField } from '@/components/shared/base-textarea-field'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import type { CompanyPlan } from '../api/usePlans'

export interface PlanFormData {
  name_ar: string
  name_en: string
  category: string
  coverage_type: 'comprehensive' | 'tpl'
  base_price: number
  deductible: number
  features_string: string
  is_active: boolean
}

interface PlanFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: CompanyPlan | null
  onSave: (data: PlanFormData) => void
  loading: boolean
  isViewOnly?: boolean
}

export function PlanFormModal({
  open,
  onOpenChange,
  editingItem,
  onSave,
  loading,
  isViewOnly = false
}: PlanFormModalProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'

  const methods = useForm<PlanFormData>({
    defaultValues: {
      name_ar: '',
      name_en: '',
      category: 'مركبات',
      coverage_type: 'comprehensive',
      base_price: 1000,
      deductible: 500,
      features_string: 'إصلاح وكالة معتمد، مساعدة على الطريق، سيارة بديلة',
      is_active: true
    }
  })

  const { reset, handleSubmit, control, register } = methods

  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          name_ar: editingItem.name_ar || '',
          name_en: editingItem.name_en || '',
          category: editingItem.category || 'مركبات',
          coverage_type: editingItem.coverage_type || 'comprehensive',
          base_price: editingItem.base_price ?? 1000,
          deductible: editingItem.deductible ?? 500,
          features_string: editingItem.features?.join('، ') || '',
          is_active: editingItem.status === 'active'
        })
      } else {
        reset({
          name_ar: '',
          name_en: '',
          category: 'مركبات',
          coverage_type: 'comprehensive',
          base_price: 1000,
          deductible: 500,
          features_string: 'إصلاح وكالة معتمد، مساعدة على الطريق، سيارة بديلة',
          is_active: true
        })
      }
    }
  }, [open, editingItem, reset])

  const modalTitle = isViewOnly
    ? (t('viewPlan') || 'عرض بيانات الباقة التأمينية')
    : editingItem
      ? (t('editPlan') || 'تعديل بيانات الباقة التأمينية')
      : (t('addPlan') || 'إضافة باقة تأمينية جديدة')

  const agreeLabel = isViewOnly
    ? undefined
    : editingItem
      ? (t('save') || 'حفظ التغييرات')
      : (t('add') || 'إضافة الباقة')

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
      size="lg"
    >
      <FormProvider {...methods}>
        <div className="space-y-4 py-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInputField
              name="name_ar"
              label={t('nameAr') || 'اسم الباقة بالعربية *'}
              placeholder="مثال: التأمين الشامل الماسي"
              disabled={isViewOnly}
            />
            <BaseInputField
              name="name_en"
              label={t('nameEn') || 'اسم الباقة بالإنجليزية *'}
              placeholder="e.g. Diamond Comprehensive Motor"
              disabled={isViewOnly}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {t('category') || 'فئة التأمين *'}
              </label>
              <select
                {...register('category')}
                disabled={isViewOnly}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main disabled:bg-gray-100/80 disabled:cursor-not-allowed"
              >
                <option value="مركبات">تأمين مركبات</option>
                <option value="طبي">تأمين طبي</option>
                <option value="سفر">تأمين سفر</option>
                <option value="ممتلكات">تأمين ممتلكات</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {t('coverageType') || 'نوع التغطية *'}
              </label>
              <select
                {...register('coverage_type')}
                disabled={isViewOnly}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main disabled:bg-gray-100/80 disabled:cursor-not-allowed"
              >
                <option value="comprehensive">شامل (Comprehensive)</option>
                <option value="tpl">ضد الغير (TPL)</option>
              </select>
            </div>

            <BaseInputField
              name="base_price"
              label={t('basePrice') || 'السعر الأساسي (ر.س) *'}
              type="number"
              placeholder="1250"
              disabled={isViewOnly}
            />

            <BaseInputField
              name="deductible"
              label={t('deductible') || 'مبلغ التحمل (ر.س) *'}
              type="number"
              placeholder="500"
              disabled={isViewOnly}
            />
          </div>

          <BaseTextAreaField
            name="features_string"
            label={t('features') || 'المزايا والتغطيات الإضافية (افصل بينها بفواصل) *'}
            placeholder="إصلاح وكالة معتمد، مساعدة على الطريق 24/7، سيارة بديلة..."
            disabled={isViewOnly}
            rows={3}
          />

          <div className="flex flex-col gap-1.5 justify-center items-start border-t border-gray-100 dark:border-zinc-800 pt-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              {t('status') || 'حالة الباقة'}
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
      </FormProvider>
    </ModalStatus>
  )
}
