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
import { StatusDropdown } from '@/components/shared/StatusDropdown'
// @ts-ignore
import { CKEditor } from '@ckeditor/ckeditor5-react'
// @ts-ignore
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useStaticPage, useUpdateStaticPage } from '../../api/useStaticPages'

const schema = z.object({
  titleAr: z.string().min(1, 'Arabic title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  contentAr: z.string().min(1, 'Arabic content is required'),
  contentEn: z.string().min(1, 'English content is required'),
  is_active: z.boolean()
})

export default function PrivacyPolicyPage() {
  const { t, i18n } = useTranslation()
  const { data: itemData, isLoading } = useStaticPage('privacy_policy')
  const saveMutation = useUpdateStaticPage('privacy_policy')

  const methods = useZodForm(schema, {
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    is_active: true
  })

  React.useEffect(() => {
    if (itemData) {
      const titleAr = itemData.translations?.find((tr: any) => tr.language_id === 2)?.title || ''
      const titleEn = itemData.translations?.find((tr: any) => tr.language_id === 1)?.title || itemData.title || ''
      const contentAr = itemData.translations?.find((tr: any) => tr.language_id === 2)?.content || ''
      const contentEn = itemData.translations?.find((tr: any) => tr.language_id === 1)?.content || itemData.content || ''
      methods.reset({
        titleAr,
        titleEn,
        contentAr,
        contentEn,
        is_active: itemData.is_active ?? true
      })
    }
  }, [itemData, methods.reset])

  const onSubmit = (formData: any) => {
    const payload = {
      is_active: formData.is_active,
      translations: [
        {
          language_id: 1,
          title: formData.titleEn,
          content: formData.contentEn
        },
        {
          language_id: 2,
          title: formData.titleAr,
          content: formData.contentAr
        }
      ]
    }
    saveMutation.mutate(payload)
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
        <CardTitle className="text-lg font-bold text-gray-800">{t('privacyPolicy') || 'Privacy Policy'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <BaseInputField name="titleAr" label="العنوان (عربي) / Arabic Title" required />
              <BaseInputField name="titleEn" label="English Title / العنوان (إنجليزي)" required />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col text-right" dir="rtl">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  سياسة الخصوصية (عربي) <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="contentAr"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="prose max-w-none text-right" dir="rtl">
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
              <div className="space-y-2 flex flex-col text-left" dir="ltr">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Privacy Policy (English) <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="contentEn"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="prose max-w-none text-left" dir="ltr">
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
            </div>

            {/* <div className="flex flex-col gap-1.5 justify-center items-start">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {t('status') || 'Status'}
              </label>
              <Controller
                name="is_active"
                control={methods.control}
                render={({ field }) => (
                  <StatusDropdown
                    value={field.value}
                    onChange={field.onChange}
                    usePortal={false}
                  />
                )}
              />
            </div> */}

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
