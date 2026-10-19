import { useMemo, useState } from 'react'
import { Globe, Search, SlidersHorizontal, Share2, Phone, Trash2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useDeleteSetting, useSettingsList, useUpdateSettings } from '../api/useSettings'

type SettingsTab = 'general' | 'contact' | 'social' | 'platform'

const tabs: { id: SettingsTab; label: string; icon: typeof Globe }[] = [
  { id: 'general', label: 'generalSettings', icon: Globe },
  { id: 'contact', label: 'contactData', icon: Phone },
  { id: 'social', label: 'socialMedia', icon: Share2 },
  { id: 'platform', label: 'platformConfiguration', icon: SlidersHorizontal }
]

const contactKeys = ['contact_working_hours_ar', 'contact_working_hours_en', 'contact_phone', 'contact_email']

const descriptions: Record<string, { en: string; ar: string }> = {
  contact_working_hours_en: { en: 'Working hours in English', ar: 'مواعيد العمل باللغة الإنجليزية' },
  contact_working_hours_ar: { en: 'Working hours in Arabic', ar: 'مواعيد العمل باللغة العربية' },
  contact_phone: { en: 'Customer care hotline number', ar: 'رقم الخط الساخن لخدمة العملاء' },
  contact_email: { en: 'Support & inquiries email address', ar: 'البريد الإلكتروني للدعم والاستفسارات' }
}

export default function SettingsOverviewPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState<SettingsTab>('contact')
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const { data: settings = [], isLoading, isError } = useSettingsList()
  const updateMutation = useUpdateSettings()
  const deleteMutation = useDeleteSetting()

  const visibleSettings = useMemo(() => {
    const source = activeTab === 'contact'
      ? settings.filter((setting) => contactKeys.includes(setting.key))
      : settings
    const term = search.trim().toLowerCase()
    return term
      ? source.filter((setting) => `${setting.key} ${setting.value}`.toLowerCase().includes(term))
      : source
  }, [activeTab, search, settings])

  const getValue = (key: string, value: string) => drafts[key] ?? value
  const saveValue = (key: string, value: string) => {
    setDrafts((current) => ({ ...current, [key]: value }))
    updateMutation.mutate({ [key]: value })
  }

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card className="border-0 bg-white/90 p-2 shadow-sm dark:bg-card">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                  activeTab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchSettings')}
            rightIcon={<Search className="h-4 w-4" />}
            className="h-12 w-full rounded-xl bg-white px-4 lg:w-80 dark:bg-card"
            aria-label={t('searchSettings')}
          />
        </div>
      </Card>

      <Card className="min-h-[420px] border-0 bg-white/90 p-5 shadow-sm dark:bg-card md:p-6">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-destructive">{t('settingsLoadError')}</p>
        ) : visibleSettings.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t('noSettingsFound')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visibleSettings.map((setting) => {
              const description = descriptions[setting.key]
              return (
                <div key={setting.key} className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <button
                      type="button"
                      aria-label={`${t('delete')} ${setting.key}`}
                      onClick={() => deleteMutation.mutate(setting.key)}
                      disabled={deleteMutation.isPending}
                      className="rounded-md p-1 text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1 text-end">
                      <div className="mb-2 flex items-center justify-end gap-2">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
                          {t('commonSetting')}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-foreground shadow-sm dark:bg-card">
                          {setting.key}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {description ? (isRtl ? description.ar : description.en) : setting.key}
                      </p>
                    </div>
                  </div>
                  <Input
                    value={getValue(setting.key, setting.value)}
                    onChange={(event) => setDrafts((current) => ({ ...current, [setting.key]: event.target.value }))}
                    onBlur={(event) => saveValue(setting.key, event.target.value)}
                    className="h-12 rounded-xl bg-white font-semibold dark:bg-card"
                  />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
