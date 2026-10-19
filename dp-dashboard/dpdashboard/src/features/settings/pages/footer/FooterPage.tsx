import React from 'react'
import { Save } from 'lucide-react'
import { FormProvider, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useZodForm } from '@/components/shared/form-fields'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { TableSkeleton } from '@/components/ui/table'
// @ts-ignore
import { CKEditor } from '@ckeditor/ckeditor5-react'
// @ts-ignore
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useSettings, useUpdateSettings } from '../../api/useSettings'

const schema = z.object({
  footer_text: z.string().min(1, 'Footer text is required'),
  footer_number: z.string().min(1, 'Footer number is required')
})

export default function FooterPage() {
  const { t, i18n } = useTranslation()
  const { data: settings, isLoading } = useSettings()
  const saveMutation = useUpdateSettings()

  const methods = useZodForm(schema, {
    footer_text: '',
    footer_number: ''
  })

  React.useEffect(() => {
    if (settings) {
      methods.reset({
        footer_text: settings.footer_text || '',
        footer_number: settings.footer_number || ''
      })
    }
  }, [settings, methods.reset])

  const onSubmit = (formData: any) => {
    saveMutation.mutate({
      footer_text: formData.footer_text,
      footer_number: formData.footer_number
    })
  }

  const isRtl = i18n.language === 'ar'

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm rounded-2xl p-6 bg-white">
        <TableSkeleton rows={4} cols={1} />
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-gray-50 px-6 py-5">
        <CardTitle className="text-lg font-bold text-gray-800">{t('footer') || 'Footer'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 flex flex-col text-start" dir={isRtl ? 'rtl' : 'ltr'}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {isRtl ? 'نص التذييل (Footer Text)' : 'Footer Text'} <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="footer_text"
                control={methods.control}
                render={({ field }) => (
                  <div className="prose max-w-none text-start w-full">
                    {/* @ts-ignore */}
                    <CKEditor
                      editor={ClassicEditor}
                      config={{
                        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo']
                      }}
                      data={field.value || ''}
                      onChange={(_, editor) => {
                        field.onChange(editor.getData())
                      }}
                    />
                  </div>
                )}
              />
            </div>

            <div className="max-w-md">
              <BaseInputField
                name="footer_number"
                label={isRtl ? 'رقم الهاتف (Footer Number)' : 'Footer Number'}
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <Button type="submit" loading={saveMutation.isPending} className="px-6 h-10 rounded-xl">
                <Save className="mr-2 h-4 w-4" /> {t('saveChanges') || 'Save Changes'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
