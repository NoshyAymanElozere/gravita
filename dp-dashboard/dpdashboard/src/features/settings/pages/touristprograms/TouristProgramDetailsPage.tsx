import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { CountrySelect } from '@/features/settings/components/selects/CountrySelect'
import { CitySelect } from '@/features/settings/components/selects/CitySelect'
import { TouristDestinationSelect } from '@/features/settings/components/selects/TouristDestinationSelect'
import { useTouristProgram } from '../../api/useTouristPrograms'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft, Edit3 } from 'lucide-react'

export default function TouristProgramDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()

  const { data: program, isLoading } = useTouristProgram(id ? Number(id) : null) as any

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, reset } = methods

  useEffect(() => {
    if (program) {
      reset(getInitialValues(program))
    }
  }, [program, reset])

  const isRtl = i18n.language === 'ar'
  const name = program?.translations?.find((trans) => trans.language_id === (isRtl ? 2 : 1))?.name || program?.name || ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('noData') || 'No Data Found'}
      </div>
    )
  }

  const sortedSteps = [...(program.steps || [])]
  sortedSteps.sort((a, b) => a.sort_order - b.sort_order)

  return (
    <FormProvider {...methods}>
      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="border-b border-border/40 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigate('/settings/touristprograms')}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
              </Button>
              <CardTitle className="text-lg font-bold text-foreground">{name}</CardTitle>
            </div>
            <Button onClick={() => navigate(`/settings/touristprograms/${program.id}/edit`)} className="h-9 px-4 rounded-xl">
              <Edit3 className="mr-2 h-4 w-4" /> {t('edit') || 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <form className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required disabled />
              <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required disabled />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
              <CountrySelect control={control} disabled />
              <CitySelect control={control} disabled />
              <TouristDestinationSelect control={control} disabled />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
              <BaseInputField name="price" type="number" step="0.01" label={t('price') || 'Price'} required disabled />
            </div>
          </form>

          {/* Read-Only Timeline */}
          <div className="space-y-6 pt-6 border-t border-gray-150" dir={isRtl ? 'rtl' : 'ltr'}>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-main"></span>
              {isRtl ? 'مخطط البرنامج السياحي' : 'Tour Program Timeline'}
            </h3>

            {sortedSteps.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                {isRtl ? 'لا يوجد أيام مضافة.' : 'No days added.'}
              </div>
            ) : (
              <div className="relative border-l-2 border-dashed border-gray-200 ml-4 pl-8 space-y-6 rtl:border-l-0 rtl:border-r-2 rtl:ml-0 rtl:mr-4 rtl:pl-0 rtl:pr-8">
                {sortedSteps.map((step: any, index) => {
                  const dayName = step.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.name || step.name || ''
                  const dayDesc = step.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.description || step.description || ''
                  return (
                    <div key={step.id} className="relative">
                      <div className="absolute -left-11 top-0 rtl:-left-0 rtl:-right-11 flex items-center justify-center">
                        <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-main to-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                          {index + 1}
                        </span>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-gray-150 shadow-sm">
                        <h4 className="text-sm font-bold text-foreground">{dayName}</h4>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line leading-relaxed">{dayDesc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
