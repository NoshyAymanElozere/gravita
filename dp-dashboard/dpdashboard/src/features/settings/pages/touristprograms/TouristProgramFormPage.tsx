import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { CountrySelect } from '@/features/settings/components/selects/CountrySelect'
import { CitySelect } from '@/features/settings/components/selects/CitySelect'
import { TouristDestinationSelect } from '@/features/settings/components/selects/TouristDestinationSelect'
import {
  useTouristProgram,
  useCreateTouristProgram,
  useUpdateTouristProgram
} from '../../api/useTouristPrograms'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TouristProgramFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const isEdit = !!id

  const { data: program, isLoading: isFetching } = useTouristProgram(id ? Number(id) : null)

  const createMutation = useCreateTouristProgram()
  const updateMutation = useUpdateTouristProgram()

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, handleSubmit, reset, setValue, watch } = methods

  const selectedCountryId = watch('country_id')
  const selectedCityId = watch('city_id')

  // Reset city and destination when country changes
  const lastCountryIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastCountryIdRef.current !== null && lastCountryIdRef.current !== selectedCountryId) {
      setValue('city_id', '')
      setValue('tourist_destination_id', '')
    }
    if (selectedCountryId) {
      lastCountryIdRef.current = selectedCountryId
    }
  }, [selectedCountryId, setValue])

  // Reset destination when city changes
  const lastCityIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastCityIdRef.current !== null && lastCityIdRef.current !== selectedCityId) {
      setValue('tourist_destination_id', '')
    }
    if (selectedCityId) {
      lastCityIdRef.current = selectedCityId
    }
  }, [selectedCityId, setValue])

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'steps'
  })

  // State for adding/editing individual program steps/days
  const [dayNameAr, setDayNameAr] = useState('')
  const [dayNameEn, setDayNameEn] = useState('')
  const [dayDescAr, setDayDescAr] = useState('')
  const [dayDescEn, setDayDescEn] = useState('')
  const [daySortOrder, setDaySortOrder] = useState('1')
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)

  useEffect(() => {
    if (isEdit && program) {
      const initial = getInitialValues(program)
      reset(initial)
    } else if (!isEdit) {
      reset(getInitialValues(null))
    }
    clearDayForm()
  }, [program, isEdit, reset])

  useEffect(() => {
    setDaySortOrder(String(fields.length + 1))
  }, [fields.length])

  const clearDayForm = () => {
    setDayNameAr('')
    setDayNameEn('')
    setDayDescAr('')
    setDayDescEn('')
    setDaySortOrder(String(fields.length + 1))
    setEditingDayIndex(null)
  }

  const handleAddOrUpdateDay = () => {
    if (!dayNameAr || !dayNameEn || !dayDescAr || !dayDescEn) {
      toast.error(isRtl ? 'يرجى ملء جميع الحقول المطلوبة لليوم' : 'Please fill in all required day fields.')
      return
    }

    const dayData = {
      id: editingDayIndex !== null ? fields[editingDayIndex].id : Math.random(),
      nameAr: dayNameAr,
      nameEn: dayNameEn,
      descAr: dayDescAr,
      descEn: dayDescEn,
      sort_order: Number(daySortOrder)
    }

    if (editingDayIndex !== null) {
      update(editingDayIndex, dayData)
    } else {
      append(dayData)
    }

    clearDayForm()
  }

  const handleEditDayClick = (index: number) => {
    const day = fields[index] as any
    setDayNameAr(day.nameAr || '')
    setDayNameEn(day.nameEn || '')
    setDayDescAr(day.descAr || '')
    setDayDescEn(day.descEn || '')
    setDaySortOrder(String(day.sort_order || ''))
    setEditingDayIndex(index)
  }

  const isRtl = i18n.language === 'ar'

  const onSubmit = (formData: any) => {
    const payload = {
      tourist_destination_id: Number(formData.tourist_destination_id),
      price: Number(formData.price),
      translations: [
        { language_id: 1, name: formData.nameEn },
        { language_id: 2, name: formData.nameAr }
      ],
      steps: formData.steps?.map((step: any) => ({
        sort_order: Number(step.sort_order),
        translations: [
          { language_id: 1, name: step.nameEn, description: step.descEn },
          { language_id: 2, name: step.nameAr, description: step.descAr }
        ]
      }))
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: () => {
            navigate('/settings/touristprograms')
          }
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/settings/touristprograms')
        }
      })
    }
  }

  if (isEdit && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
      </div>
    )
  }

  const sortedFields = [...fields].map((f, index) => ({ ...f, originalIndex: index }))
  sortedFields.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

  return (
    <FormProvider {...methods}>
      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings/touristprograms')}
              className="h-8 w-8 rounded-lg"
            >
              <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
            </Button>
            <CardTitle className="text-lg font-bold text-foreground">
              {isEdit ? `${t('edit')} ${t('touristProgram')}` : `${t('add')} ${t('touristProgram')}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'} noValidate>
            
            {/* 1. General Program Details */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('programInformation') || 'Program Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required />
                <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
                <CountrySelect control={control} />
                <CitySelect control={control} countryId={selectedCountryId} />
                <TouristDestinationSelect control={control} cityId={selectedCityId} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
                <BaseInputField name="price" type="number" step="0.01" label={t('price') || 'Price'} required />
              </div>
            </div>

            {/* 2. Days Management Section */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('touristPrograms') || 'Program Days / Steps'}
              </h3>

              {/* Day Subform */}
              <div className="bg-blue-50/20 p-5 rounded-2xl border border-blue-100/50 space-y-4">
                <h4 className="text-xs font-bold text-main uppercase tracking-wider block">
                  {editingDayIndex !== null 
                    ? (isRtl ? 'تعديل بيانات اليوم' : 'Edit Day Details') 
                    : (isRtl ? 'إضافة يوم جديد للبرنامج' : 'Add New Day to Program')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{isRtl ? 'اسم اليوم (عربي) *' : 'Day Title (Arabic) *'}</label>
                    <input
                      type="text"
                      value={dayNameAr}
                      onChange={(e) => setDayNameAr(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-250 bg-white focus:outline-none focus:border-main text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{isRtl ? 'اسم اليوم (انجليزي) *' : 'Day Title (English) *'}</label>
                    <input
                      type="text"
                      value={dayNameEn}
                      onChange={(e) => setDayNameEn(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-250 bg-white focus:outline-none focus:border-main text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{isRtl ? 'وصف اليوم (عربي) *' : 'Day Description (Arabic) *'}</label>
                    <textarea
                      value={dayDescAr}
                      onChange={(e) => setDayDescAr(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl border border-gray-250 bg-white focus:outline-none focus:border-main text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">{isRtl ? 'وصف اليوم (انجليزي) *' : 'Day Description (English) *'}</label>
                    <textarea
                      value={dayDescEn}
                      onChange={(e) => setDayDescEn(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl border border-gray-250 bg-white focus:outline-none focus:border-main text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500">{isRtl ? 'الترتيب *' : 'Sort Order *'}</label>
                    <input
                      type="number"
                      value={daySortOrder}
                      onChange={(e) => setDaySortOrder(e.target.value)}
                      className="w-20 h-9 px-2 rounded-lg border border-gray-250 text-center text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingDayIndex !== null && (
                      <Button type="button" variant="outline" size="sm" onClick={clearDayForm} className="h-9 px-4 rounded-xl text-xs">
                        {isRtl ? 'إلغاء' : 'Cancel'}
                      </Button>
                    )}
                    <Button type="button" onClick={handleAddOrUpdateDay} className="h-9 px-4 rounded-xl text-xs">
                      {editingDayIndex !== null 
                        ? (isRtl ? 'تحديث اليوم' : 'Update Day') 
                        : (isRtl ? 'إضافة اليوم' : 'Add Day')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Numbered Timeline List (البرنامج السياحي) */}
              <div className="space-y-6 pt-4 border-t border-gray-150">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-main"></span>
                  {isRtl ? 'مخطط البرنامج السياحي (الترتيب)' : 'Itinerary / Tour Program Timeline'}
                </h3>

                {sortedFields.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    {isRtl ? 'لا يوجد أيام مضافة بعد للبرنامج.' : 'No days added to the itinerary yet.'}
                  </div>
                ) : (
                  <div className="relative border-l-2 border-dashed border-gray-200 ml-4 pl-8 space-y-6 rtl:border-l-0 rtl:border-r-2 rtl:ml-0 rtl:mr-4 rtl:pl-0 rtl:pr-8">
                    {sortedFields.map((field: any, index) => {
                      const isItemRtl = isRtl
                      return (
                        <div key={field.id} className="relative group">
                          {/* Circle Day Index with Gradient */}
                          <div className="absolute -left-11 top-0 rtl:-left-0 rtl:-right-11 flex items-center justify-center">
                            <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-main to-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                              {index + 1}
                            </span>
                          </div>

                          {/* Day Content Card */}
                          <div className="bg-card p-4 rounded-xl border border-gray-150 hover:border-gray-250 transition-all shadow-sm flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <h4 className="text-sm font-bold text-foreground">
                                {isItemRtl ? field.nameAr : field.nameEn}
                              </h4>
                              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                                {isItemRtl ? field.descAr : field.descEn}
                              </p>
                              <div className="flex gap-2 pt-1 text-[10px] text-gray-400">
                                <span>{isRtl ? 'الترتيب الداخلي:' : 'Sort Value:'} {field.sort_order}</span>
                              </div>
                            </div>

                            {/* Day Actions */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditDayClick(field.originalIndex)}
                                className="h-8 w-8 text-gray-500 hover:text-main hover:bg-gray-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => remove(field.originalIndex)}
                                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => navigate('/settings/touristprograms')}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {t('save') || 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
