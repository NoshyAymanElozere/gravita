import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/table'
import { useSettings, useUpdateSettings } from '../../api/useSettings'

export default function CurrenciesPage() {
  const { t, i18n } = useTranslation()
  const label = t('currencies') || 'Currencies'
  const isRtl = i18n.language === 'ar'

  const { data: settings, isLoading } = useSettings()
  const updateSettingsMutation = useUpdateSettings()
  const [defaultCurrencyInput, setDefaultCurrencyInput] = useState('')

  React.useEffect(() => {
    if (settings?.currency) {
      setDefaultCurrencyInput(settings.currency)
    }
  }, [settings?.currency])

  const handleDefaultCurrencySave = () => {
    updateSettingsMutation.mutate({
      currency: defaultCurrencyInput
    })
  }

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm rounded-2xl p-6 bg-card">
        <TableSkeleton rows={3} cols={1} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Default Currency Input Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="pb-4 border-b border-border/40 px-6 py-5">
          <CardTitle className="text-lg font-bold text-foreground">
            {isRtl ? 'إعدادات العملة الافتراضية للموقع' : 'Default Site Currency Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-3 max-w-sm" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex-1 space-y-1.5 text-start w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {isRtl ? 'العملة الافتراضية' : 'Default Currency'}
              </label>
              <input
                type="text"
                value={defaultCurrencyInput}
                onChange={(e) => setDefaultCurrencyInput(e.target.value)}
                placeholder="e.g. USD, SAR"
                className="w-full h-11 px-3.5 rounded-xl border border-border/60 bg-card text-sm font-semibold text-foreground outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <Button
              onClick={handleDefaultCurrencySave}
              loading={updateSettingsMutation.isPending}
              className="h-11 px-6 rounded-xl"
            >
              {t('save') || 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
