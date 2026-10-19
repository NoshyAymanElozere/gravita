import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { ArrowLeft, ArrowRight, Shield, Save } from 'lucide-react'
import {
  usePlanList,
  useCreatePlan,
  useUpdatePlan,
  type CompanyPlan
} from '../api/usePlans'

export interface PlanFormData {
  name_ar: string
  name_en: string
  category: string
  coverage_type: 'comprehensive' | 'tpl'
  base_price: number
  deductible: number
  description_ar?: string
  description_en?: string
  features: string[]
  is_active: boolean
}

interface PlanFormPageProps {
  mode?: 'new' | 'edit' | 'view'
}

export default function PlanFormPage({ mode }: PlanFormPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'

  const { data: plans = [] } = usePlanList()
  const plan = plans.find((p) => p.id === id) || null

  const isView = mode === 'view' || window.location.pathname.includes('/view/')
  const isEdit = mode === 'edit' || (!!id && !isView)

  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()

  const methods = useForm<PlanFormData>({
    defaultValues: {
      name_ar: '',
      name_en: '',
      category: 'مركبات',
      coverage_type: 'comprehensive',
      base_price: 1000,
      deductible: 500,
      description_ar: '',
      description_en: '',
      features: [],
      is_active: true
    }
  })

  const { reset, handleSubmit, control } = methods

  useEffect(() => {
    if (plan) {
      reset({
        name_ar: plan.name_ar || '',
        name_en: plan.name_en || '',
        category: plan.category || 'مركبات',
        coverage_type: plan.coverage_type || 'comprehensive',
        base_price: plan.base_price ?? 1000,
        deductible: plan.deductible ?? 500,
        description_ar: plan.description_ar || '',
        description_en: plan.description_en || '',
        features: plan.features || [],
        is_active: plan.status === 'active'
      })
    }
  }, [plan, reset])

  const onSubmit = (data: PlanFormData) => {
    if (isEdit && id) {
      updateMutation.mutate(
        {
          id,
          data: {
            ...data,
            base_price: Number(data.base_price),
            deductible: Number(data.deductible),
            status: data.is_active ? 'active' : 'inactive'
          }
        },
        {
          onSuccess: () => navigate('/plans')
        }
      )
    } else {
      createMutation.mutate(
        {
          ...data,
          base_price: Number(data.base_price),
          deductible: Number(data.deductible),
          status: data.is_active ? 'active' : 'inactive'
        },
        {
          onSuccess: () => navigate('/plans')
        }
      )
    }
  }

  const pageTitle = isView
    ? `عرض تفاصيل باقة التأمين: ${plan?.name_ar || ''}`
    : isEdit
      ? 'تعديل بيانات باقة التأمين'
      : 'إضافة باقة تأمين جديدة'

  return (
    <div className="space-y-4 animate-fade-in pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/plans')}
              className="bg-secondary hover:bg-secondary/80 text-foreground font-bold px-4 py-2 rounded-xl gap-2 cursor-pointer h-10 border-border/60"
            >
              {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{t('back') || 'رجوع للقائمة'}</span>
            </Button>

            {!isView && (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl gap-2 cursor-pointer h-10 shadow-xs"
              >
                <Save className="h-4 w-4" />
                <span>{isEdit ? t('saveChanges') || 'حفظ التعديلات' : t('add') || 'إضافة الباقة'}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3.5 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-zinc-100">
                {pageTitle}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isView ? 'استعراض الحقول والشروط والأسعار للباقة' : 'إدارة أسعار وتغطيات ومزايا الباقة المعروضة للعملاء'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form Content Boxes */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 border-b border-border/60 pb-3">
              مسميات وتصنيف الباقة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInputField
                name="name_ar"
                label={t('nameAr') || 'اسم الباقة بالعربية *'}
                placeholder="التأمين الشامل الماسي"
                disabled={isView}
              />
              <BaseInputField
                name="name_en"
                label={t('nameEn') || 'اسم الباقة بالإنجليزية *'}
                placeholder="Diamond Comprehensive Plan"
                disabled={isView}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <BaseInputField
                name="category"
                label="الفئة التأمينية *"
                placeholder="مركبات / طبي / منازل"
                disabled={isView}
              />
              <div className="flex flex-col gap-1.5 justify-center items-start">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  نوع التغطية *
                </label>
                <Controller
                  name="coverage_type"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isView}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-75 cursor-pointer"
                    >
                      <option value="comprehensive">تأمين شامل</option>
                      <option value="tpl">ضد الغير (طرف ثالث)</option>
                    </select>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-center items-start">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {t('status') || 'الحالة والتفعيل'}
                </label>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <StatusDropdown
                      value={field.value}
                      onChange={async (val) => field.onChange(val)}
                      disabled={isView}
                      usePortal={false}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 border-b border-border/60 pb-3">
              التسعير ومبلغ التحمل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInputField
                name="base_price"
                label="السعر الأساسي يبدأ من (ر.س) *"
                type="number"
                placeholder="1250"
                disabled={isView}
              />
              <BaseInputField
                name="deductible"
                label="مبلغ التحمل عند الحادث (ر.س) *"
                type="number"
                placeholder="500"
                disabled={isView}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 border-b border-border/60 pb-3">
              الوصف والمزايا الإضافية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInputField
                name="description_ar"
                label="شرح الباقة بالعربية"
                placeholder="تغطية كاملة مع سيارة بديلة وإصلاح وكالة..."
                disabled={isView}
              />
              <BaseInputField
                name="description_en"
                label="شرح الباقة بالإنجليزية"
                placeholder="Full coverage including agency repairs..."
                disabled={isView}
              />
            </div>
          </div>

          {!isView && (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/plans')}
                className="px-5 py-2.5 rounded-xl border-border/60 font-bold"
              >
                {t('cancel') || 'إلغاء'}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-xs gap-2"
              >
                <Save className="h-4 w-4" />
                <span>{isEdit ? t('saveChanges') || 'حفظ التعديلات' : t('add') || 'إضافة الباقة'}</span>
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
