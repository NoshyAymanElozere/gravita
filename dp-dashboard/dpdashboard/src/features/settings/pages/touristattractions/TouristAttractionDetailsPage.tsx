import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { BaseTextAreaField } from '@/components/shared/base-textarea-field'
import { TouristDestinationSelect } from '@/features/settings/components/selects/TouristDestinationSelect'
import { useTouristAttraction } from '../../api/useTouristAttractions'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft, Edit3 } from 'lucide-react'

export default function TouristAttractionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()

  const { data: attraction, isLoading } = useTouristAttraction(id ? Number(id) : null) as any

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, reset } = methods

  useEffect(() => {
    if (attraction) {
      reset(getInitialValues(attraction))
    }
  }, [attraction, reset])

  const isRtl = i18n.language === 'ar'
  const name = attraction?.translations?.find((trans) => trans.language_id === (isRtl ? 2 : 1))?.name || attraction?.name || ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
      </div>
    )
  }

  if (!attraction) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('noData') || 'No Data Found'}
      </div>
    )
  }

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
                onClick={() => navigate('/settings/touristattractions')}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
              </Button>
              <CardTitle className="text-lg font-bold text-foreground">{name}</CardTitle>
            </div>
            <Button onClick={() => navigate(`/settings/touristattractions/${attraction.id}/edit`)} className="h-9 px-4 rounded-xl">
              <Edit3 className="mr-2 h-4 w-4" /> {t('edit') || 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required disabled />
              <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseTextAreaField
                name="descAr"
                label={t('arabicDescription') || 'Arabic Description'}
                required
                disabled
              />
              <BaseTextAreaField
                name="descEn"
                label={t('englishDescription') || 'English Description'}
                required
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <TouristDestinationSelect
                  control={control}
                  disabled
                />
              </div>

              <div>
                <BaseInputField
                  name="price"
                  type="number"
                  step="0.01"
                  label={`${t('price') || 'Price'} *`}
                  required
                  disabled
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
