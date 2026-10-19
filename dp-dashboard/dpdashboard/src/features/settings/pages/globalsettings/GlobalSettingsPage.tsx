import React from 'react'
import { Save, Building2, Percent, Loader2 } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useZodForm } from '@/components/shared/form-fields'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { useGlobalSettings, useUpdateGlobalSettings } from '../../api/useGlobalSettings'

const schema = z.object({
  site_name: z.string().min(1, 'requiredField'),
  commercial_register: z.string().min(1, 'requiredField'),
  tax_number: z.string().min(1, 'requiredField'),
  hotel_commission: z.string().min(1, 'requiredField'),
  flight_commission: z.string().min(1, 'requiredField'),
})

export default function GlobalSettingsPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const { data: settings, isLoading } = useGlobalSettings()
  const saveMutation = useUpdateGlobalSettings()

  const methods = useZodForm(schema, {
    site_name: '',
    commercial_register: '',
    tax_number: '',
    hotel_commission: '',
    flight_commission: '',
  })

  React.useEffect(() => {
    if (settings) {
      methods.reset({
        site_name: settings.site_name || '',
        commercial_register: settings.commercial_register || '',
        tax_number: settings.tax_number || '',
        hotel_commission: settings.hotel_commission || '0',
        flight_commission: settings.flight_commission || '0',
      })
    }
  }, [settings, methods.reset])

  const onSubmit = (formData: any) => {
    saveMutation.mutate({
      site_name: formData.site_name,
      commercial_register: formData.commercial_register,
      tax_number: formData.tax_number,
      hotel_commission: formData.hotel_commission,
      flight_commission: formData.flight_commission,
    })
  }

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm rounded-2xl p-6 bg-white">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-main" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 px-6 py-5">
        <CardTitle className="text-lg font-bold text-gray-800">
          {t('globalSettings') || 'Global Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* General Settings */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-main" />
                {t('generalSettings') || 'General Settings'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BaseInputField
                  name="site_name"
                  label={isRtl ? 'اسم الموقع / الشركة' : 'Company / Site Name'}
                  required
                />
                <BaseInputField
                  name="commercial_register"
                  label={isRtl ? 'السجل التجاري' : 'Commercial Register'}
                  required
                />
                <BaseInputField
                  name="tax_number"
                  label={isRtl ? 'الرقم الضريبي' : 'Tax Number / VAT'}
                  required
                />
              </div>
            </div>

            {/* Commissions Settings */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Percent className="h-4 w-4 text-main" />
                {t('commissionsSettings') || 'Commissions Settings'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInputField
                  name="hotel_commission"
                  type="number"
                  label={isRtl ? 'عمولة الفنادق (%)' : 'Hotel Commission (%)'}
                  required
                />
                <BaseInputField
                  name="flight_commission"
                  type="number"
                  label={isRtl ? 'عمولة الطيران (%)' : 'Flight Commission (%)'}
                  required
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button type="submit" loading={saveMutation.isPending} className="px-6 h-10 rounded-xl">
                <Save className="mr-2 h-4 w-4" />
                {t('saveChanges') || 'Save Changes'}
              </Button>
            </div>

          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
