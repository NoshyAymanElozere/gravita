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
import {
  useTouristAttraction,
  useCreateTouristAttraction,
  useUpdateTouristAttraction
} from '../../api/useTouristAttractions'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft } from 'lucide-react'

export default function TouristAttractionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const isEdit = !!id

  const { data: attraction, isLoading: isFetching } = useTouristAttraction(id ? Number(id) : null)

  const createMutation = useCreateTouristAttraction()
  const updateMutation = useUpdateTouristAttraction()

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, handleSubmit, reset } = methods

  useEffect(() => {
    if (isEdit && attraction) {
      reset(getInitialValues(attraction))
    } else if (!isEdit) {
      reset(getInitialValues(null))
    }
  }, [attraction, isEdit, reset, id])

  const isRtl = i18n.language === 'ar'

  const onSubmit = (formData: any) => {
    const payload = {
      tourist_destination_id: Number(formData.tourist_destination_id),
      price: parseFloat(formData.price),
      translations: [
        {
          language_id: 1,
          name: formData.nameEn,
          description: formData.descEn
        },
        {
          language_id: 2,
          name: formData.nameAr,
          description: formData.descAr
        }
      ]
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: () => {
            navigate('/settings/touristattractions')
          }
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/settings/touristattractions')
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

  return (
    <FormProvider {...methods}>
      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="border-b border-border/40 px-6 py-5">
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
            <CardTitle className="text-lg font-bold text-foreground">
              {isEdit ? `${t('edit')} ${t('touristAttractions')}` : `${t('add')} ${t('touristAttractions')}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required />
              <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseTextAreaField
                name="descAr"
                label={t('arabicDescription') || 'Arabic Description'}
                required
              />
              <BaseTextAreaField
                name="descEn"
                label={t('englishDescription') || 'English Description'}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <TouristDestinationSelect
                  control={control}
                />
              </div>

              <div>
                <BaseInputField
                  name="price"
                  type="number"
                  step="0.01"
                  label={`${t('price') || 'Price'} *`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => navigate('/settings/touristattractions')}>
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
