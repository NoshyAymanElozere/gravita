import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { BaseTextAreaField } from '@/components/shared/base-textarea-field'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { ImageUpload } from '@/components/shared/image-upload'
import { CountrySelect } from '@/features/settings/components/selects/CountrySelect'
import { CitySelect } from '@/features/settings/components/selects/CitySelect'
import {
  useTouristDestination,
  useCreateTouristDestination,
  useUpdateTouristDestination
} from '../../api/useTouristDestinations'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft, Plus, X } from 'lucide-react'

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  const filename = url.substring(url.lastIndexOf('/') + 1) || 'image.jpg'
  return new File([blob], filename, { type: blob.type })
}

export default function TouristDestinationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const isEdit = !!id

  const { data: destination, isLoading: isFetching } = useTouristDestination(id ? Number(id) : null)

  const createMutation = useCreateTouristDestination()
  const updateMutation = useUpdateTouristDestination()

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, handleSubmit, reset, setValue, watch } = methods

  const selectedCountryId = watch('country_id')

  // Reset city when country changes (except on initial load of edit mode)
  const lastCountryIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastCountryIdRef.current !== null && lastCountryIdRef.current !== selectedCountryId) {
      setValue('city_id', '')
    }
    if (selectedCountryId) {
      lastCountryIdRef.current = selectedCountryId
    }
  }, [selectedCountryId, setValue])

  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEdit && destination) {
      const initial = getInitialValues(destination)
      reset(initial)
      setGalleryItems(initial.gallery || [])
    } else if (!isEdit) {
      reset(getInitialValues(null))
      setGalleryItems([])
    }
  }, [destination, isEdit, reset])

  const isRtl = i18n.language === 'ar'

  const handleAddGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newItems = Array.from(files).map((file) => ({
        id: Math.random(),
        file,
        file_path: URL.createObjectURL(file)
      }))
      const updated = [...galleryItems, ...newItems]
      setGalleryItems(updated)
      setValue('gallery', updated.map(item => item.file || item))
    }
  }

  const handleRemoveGalleryItem = (index: number) => {
    const updated = [...galleryItems]
    updated.splice(index, 1)
    setGalleryItems(updated)
    setValue('gallery', updated.map(item => item.file || item))
  }

  const onSubmit = async (formData: any) => {
    const dataToSend = new FormData()
    dataToSend.append('city_id', String(formData.city_id))
    dataToSend.append('is_active', formData.is_active ? '1' : '0')

    dataToSend.append('translations[0][language_id]', '1')
    dataToSend.append('translations[0][name]', formData.nameEn)
    dataToSend.append('translations[0][description]', formData.descEn)

    dataToSend.append('translations[1][language_id]', '2')
    dataToSend.append('translations[1][name]', formData.nameAr)
    dataToSend.append('translations[1][description]', formData.descAr)

    if (formData.image instanceof FileList && formData.image.length > 0) {
      dataToSend.append('image', formData.image[0])
    } else if (formData.image instanceof File) {
      dataToSend.append('image', formData.image)
    }

    // Gallery modification logic
    const initialIds = destination?.gallery?.map((g: any) => g.id) || []
    const currentIds = galleryItems
      .map((g: any) => g.id)
      .filter((id) => typeof id === 'number' && Number.isInteger(id))

    // Check if gallery has changes
    const hasGalleryChanges =
      initialIds.length !== currentIds.length ||
      !initialIds.every((id: any) => currentIds.includes(id)) ||
      galleryItems.some((item) => item.file instanceof File)

    if (hasGalleryChanges) {
      // Send new uploads
      galleryItems.forEach((item) => {
        if (item.file instanceof File) {
          dataToSend.append('gallery[]', item.file)
        }
      })
      // Send keep IDs
      if (currentIds.length > 0) {
        currentIds.forEach((id) => {
          dataToSend.append('keep_gallery_ids[]', String(id))
        })
      } else {
        dataToSend.append('keep_gallery_ids[]', '')
      }
    }

    if (isEdit) {
      dataToSend.append('_method', 'PUT')
      updateMutation.mutate(
        { id: Number(id), formData: dataToSend },
        {
          onSuccess: () => {
            navigate('/settings/touristdestinations')
          }
        }
      )
    } else {
      createMutation.mutate(dataToSend, {
        onSuccess: () => {
          navigate('/settings/touristdestinations')
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
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings/touristdestinations')}
              className="h-8 w-8 rounded-lg"
            >
              <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
            </Button>
            <CardTitle className="text-lg font-bold text-foreground">
              {isEdit ? `${t('edit')} ${t('touristDestinations')}` : `${t('add')} ${t('touristDestinations')}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <ImageUpload
                  name="image"
                  label={t('mainImage') || 'Main Image'}
                  currentImageUrl={typeof watch('image') === 'string' ? watch('image') : undefined}
                  aspectRatio="h-40 w-full"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {t('gallery') || 'Gallery Images'}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryItems.map((item, idx) => (
                    <div key={item.id || idx} className="relative h-40 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                      <img src={item.file_path} alt="gallery-item" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-main hover:border-main bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] font-bold mt-1">{t('add') || 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <CountrySelect control={control} />
              <CitySelect control={control} countryId={selectedCountryId} />

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
                      usePortal={false}
                    />
                  )}
                />
              </div>
            </div>

            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleAddGalleryFiles}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => navigate('/settings/touristdestinations')}>
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
