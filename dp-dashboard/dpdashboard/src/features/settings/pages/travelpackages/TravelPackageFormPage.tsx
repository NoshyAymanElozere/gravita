import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { BaseTextAreaField } from '@/components/shared/base-textarea-field'
import { ImageUpload } from '@/components/shared/image-upload'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { CountrySelect } from '@/features/settings/components/selects/CountrySelect'
import { CitySelect } from '@/features/settings/components/selects/CitySelect'
import { TouristDestinationSelect } from '@/features/settings/components/selects/TouristDestinationSelect'
import { TouristProgramSelect } from '@/features/settings/components/selects/TouristProgramSelect'
import { GroundServiceSelect } from '@/features/settings/components/selects/GroundServiceSelect'
import { TripTypeSelect } from '@/features/settings/components/selects/TripTypeSelect'
import { useAllGroundServices } from '../../api/useGroundServices'
import {
  useTravelPackage,
  useCreateTravelPackage,
  useUpdateTravelPackage
} from '../../api/useTravelPackages'
import { useAllTouristPrograms } from '../../api/useTouristPrograms'
import { schema, getInitialValues } from './validationSchema'
import { ArrowLeft, Plus, X, DollarSign, CalendarDays, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import ModalStatus from '@/components/shared/modal-status'

const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  const filename = url.substring(url.lastIndexOf('/') + 1) || 'image.jpg'
  return new File([blob], filename, { type: blob.type })
}

export default function TravelPackageFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const isEdit = !!id

  const { data: travelPackage, isLoading: isFetching } = useTravelPackage(id ? Number(id) : null)

  const createMutation = useCreateTravelPackage()
  const updateMutation = useUpdateTravelPackage()

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(null)
  })

  const { control, handleSubmit, reset, setValue, watch } = methods

  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Watch fields for pricing & attraction logic
  const selectedCountryId = watch('country_id')
  const selectedCityId = watch('city_id')
  const selectedDestinationId = watch('tourist_destination_id')
  const selectedProgramId = watch('tourist_program_id')
  const selectedGroundServiceIds = watch('ground_handling_service_ids') || []
  const customPriceValue = watch('custom_price')

  // Fetch relevant programs and ground services
  const { data: programs = [] } = useAllTouristPrograms()
  const { data: groundServices = [] } = useAllGroundServices()

  // Reset city, destination, program, ground services, and custom price when country changes
  const lastCountryIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastCountryIdRef.current !== null && lastCountryIdRef.current !== selectedCountryId) {
      setValue('city_id', '')
      setValue('tourist_destination_id', '')
      setValue('tourist_program_id', '')
      setValue('ground_handling_service_ids', [])
      setValue('custom_price', '')
    }
    if (selectedCountryId) {
      lastCountryIdRef.current = selectedCountryId
    }
  }, [selectedCountryId, setValue])

  // Reset destination, program, ground services, and custom price when city changes
  const lastCityIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastCityIdRef.current !== null && lastCityIdRef.current !== selectedCityId) {
      setValue('tourist_destination_id', '')
      setValue('tourist_program_id', '')
      setValue('ground_handling_service_ids', [])
      setValue('custom_price', '')
    }
    if (selectedCityId) {
      lastCityIdRef.current = selectedCityId
    }
  }, [selectedCityId, setValue])

  // Reset tourist program, ground services, and custom price when destination changes (except on initial load of edit mode)
  const lastDestinationIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastDestinationIdRef.current !== null && lastDestinationIdRef.current !== selectedDestinationId) {
      setValue('tourist_program_id', '')
      setValue('ground_handling_service_ids', [])
      setValue('custom_price', '')
    }
    if (selectedDestinationId) {
      lastDestinationIdRef.current = selectedDestinationId
    }
  }, [selectedDestinationId, setValue])

  // Handle Edit initial load
  useEffect(() => {
    if (isEdit && travelPackage) {
      const initial = getInitialValues(travelPackage)
      reset(initial)
      setGalleryItems(initial.gallery || [])
    } else if (!isEdit) {
      reset(getInitialValues(null))
      setGalleryItems([])
    }
  }, [travelPackage, isEdit, reset, setValue])

  // Dynamic pricing calculation
  const calculatedBasePrice = (() => {
    let sum = 0
    const chosenProgram = programs.find((p: any) => String(p.id) === String(selectedProgramId))
    if (chosenProgram) {
      sum += Number(chosenProgram.price || 0)
    }
    selectedGroundServiceIds.forEach((gsId: string) => {
      const item = groundServices.find((g: any) => String(g.id) === String(gsId))
      if (item) sum += Number(item.price || 0)
    })
    return sum
  })()

  const finalPrice = customPriceValue ? parseFloat(customPriceValue) : calculatedBasePrice

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
    const updated = galleryItems.filter((_, i) => i !== index)
    setGalleryItems(updated)
    setValue('gallery', updated.map(item => item.file || item))
  }

  const onSubmit = async (formData: any) => {
    const dataToSend = new FormData()
    dataToSend.append('tourist_destination_id', String(formData.tourist_destination_id))
    dataToSend.append('start_date', formData.start_date)
    dataToSend.append('end_date', formData.end_date)
    dataToSend.append('number_of_individuals', String(formData.number_of_individuals))
    dataToSend.append('is_active', formData.is_active ? '1' : '0')
    dataToSend.append('tourist_program_id', String(formData.tourist_program_id))
    dataToSend.append('trip_type_id', String(formData.trip_type_id))
    dataToSend.append('is_special', formData.is_special ? '1' : '0')
    dataToSend.append('duration', String(formData.duration_days))

    if (formData.custom_price) {
      dataToSend.append('custom_price', formData.custom_price)
    }

    dataToSend.append('translations[0][language_id]', '1')
    dataToSend.append('translations[0][name]', formData.nameEn)
    dataToSend.append('translations[0][description]', formData.descEn)

    dataToSend.append('translations[1][language_id]', '2')
    dataToSend.append('translations[1][name]', formData.nameAr)
    dataToSend.append('translations[1][description]', formData.descAr)

    if (Array.isArray(formData.ground_handling_service_ids)) {
      formData.ground_handling_service_ids.forEach((gsId: string) => {
        dataToSend.append('ground_handling_service_ids[]', gsId)
      })
    }

    if (formData.image instanceof FileList && formData.image.length > 0) {
      dataToSend.append('image', formData.image[0])
    } else if (formData.image instanceof File) {
      dataToSend.append('image', formData.image)
    }

    // Gallery modification logic
    const initialIds = travelPackage?.gallery?.map((g: any) => g.id) || []
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
            navigate('/settings/travelpackages')
          }
        }
      )
    } else {
      createMutation.mutate(dataToSend, {
        onSuccess: () => {
          navigate('/settings/travelpackages')
        }
      })
    }
  }

  const isRtl = i18n.language === 'ar'

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
              onClick={() => navigate('/settings/travelpackages')}
              className="h-8 w-8 rounded-lg"
            >
              <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
            </Button>
            <CardTitle className="text-lg font-bold text-foreground">
              {isEdit ? `${t('edit')} ${t('travelPackage')}` : `${t('add')} ${t('travelPackage')}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit, (errors) => console.error('Zod Validation Errors:', errors))} className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'} noValidate>

            {/* 1. Media showcase Section */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('mediaShowcase') || 'Media Showcase'}
              </h3>
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
                      className="h-40 rounded-xl border border-dashed border-gray-300 hover:border-main bg-gray-50/50 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all text-gray-500"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-xs font-semibold">{t('add') || 'Add New'}</span>
                    </button>
                  </div>
                </div>
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

            {/* 2. Basic Info Section */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('basicInfo') || 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInputField name="nameAr" label={t('arabicName') || 'Arabic Name'} required />
                <BaseInputField name="nameEn" label={t('englishName') || 'English Name'} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseTextAreaField name="descAr" label={t('arabicDescription') || 'Arabic Description'} required />
                <BaseTextAreaField name="descEn" label={t('englishDescription') || 'English Description'} required />
              </div>
            </div>

            {/* 3. Package Schedule & Target Section */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('packageDetails') || 'Package Details'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <BaseInputField name="start_date" type="date" label={`${t('startDate') || 'Start Date'} *`} required className="w-full" />
                <BaseInputField name="end_date" type="date" label={`${t('endDate') || 'End Date'} *`} required className="w-full" />
                <BaseInputField name="number_of_individuals" type="number" label={`${t('numberOfIndividuals') || 'Number of Individuals'} *`} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <BaseInputField
                  name="duration_days"
                  type="number"
                  label={`${t('durationDays') || 'Number of Days'} *`}
                  required
                  placeholder={t('durationDays') || 'e.g. 6'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <CountrySelect control={control} />
                <CitySelect control={control} countryId={selectedCountryId} />
                <TouristDestinationSelect control={control} cityId={selectedCityId} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <TripTypeSelect control={control} />
                
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

                <div className="flex flex-col gap-1.5 justify-center items-start w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {t('packageClassification') || 'تصنيف الباقة'}
                  </label>
                  <Controller
                    name="is_special"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-6 h-10">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                          <input
                            type="radio"
                            name="is_special"
                            checked={field.value === false}
                            onChange={() => field.onChange(false)}
                            className="h-4 w-4 text-main border-gray-300 focus:ring-main"
                          />
                          <span>{t('standardPackage') || 'الباقات'}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                          <input
                            type="radio"
                            name="is_special"
                            checked={field.value === true}
                            onChange={() => field.onChange(true)}
                            className="h-4 w-4 text-main border-gray-300 focus:ring-main"
                          />
                          <span>{t('featuredPackage') || 'الباقات المميزة'}</span>
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 4. Attractions and Ground Services */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('packageItems') || 'Package Items'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TouristProgramSelect
                  control={control}
                  touristDestinationId={selectedDestinationId}
                />

                <GroundServiceSelect
                  control={control}
                  name="ground_handling_service_ids"
                />
              </div>
            </div>

            {/* 5. Pricing Details */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-150 space-y-5">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-main"></span>
                {t('pricingDetails') || 'Pricing Details'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Calculated Base Price */}
                <div className="w-full space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('basePrice') || 'Base Price'}
                  </p>
                  <div className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between text-sm text-gray-800 font-semibold">
                    <span>{calculatedBasePrice.toFixed(2)} USD</span>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Custom Override Price Input */}
                <BaseInputField
                  name="custom_price"
                  type="number"
                  step="0.01"
                  label={t('customPrice') || 'Custom Override Price'}
                  placeholder="0.00"
                />

                {/* Final Calculated Price */}
                <div className="w-full space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-main uppercase tracking-wider">
                      {t('finalPrice') || 'Final Price'}
                    </p>
                    {customPriceValue && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-semibold tracking-wide">
                        {t('overrideActive') || 'Override Active'}
                      </span>
                    )}
                  </div>
                  <div className="w-full h-10 px-3.5 rounded-xl border border-main/20 bg-main/5 flex items-center justify-between text-sm text-main font-bold">
                    <span>{finalPrice.toFixed(2)} USD</span>
                    <DollarSign className="h-4 w-4 text-main/80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => navigate('/settings/travelpackages')}>
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
