import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  FileBadge,
  Globe,
  Hash,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Phone,
  ReceiptText,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BaseInputField } from '@/components/shared/base-input-field'
import { BaseTextAreaField } from '@/components/shared/base-textarea-field'
import { useZodForm } from '@/components/shared/form-fields'
import { cn } from '@/utils/utils'
import { LANG_AR, LANG_EN } from '@/features/auth/lib/authStorage'
import { normalizeUrl } from '@/features/auth/lib/schemas'
import { applyFieldErrors } from '@/features/auth/lib/errors'
import { PasswordStrength } from '@/features/auth/components/AuthUI'
import { useChangeCompanyPassword, useCompanyProfile, useUpdateCompanyProfile } from '../api/useCompanyProfile'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import {
  PROFILE_FIELD_MAP,
  normalizePhone,
  passwordSchema,
  profileSchema,
  type PasswordForm,
  type ProfileForm,
} from '../lib/schemas'
import { LogoPicker } from '../components/LogoPicker'
import type { CompanyProfile } from '../types/profile.types'

const EMPTY_PROFILE: ProfileForm = {
  logo: null,
  phone: '',
  website_url: '',
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  address_en: '',
  address_ar: '',
}

function toFormValues(profile: CompanyProfile): ProfileForm {
  const tr = (id: number) => profile.translations.find((x) => x.language_id === id)
  const en = tr(LANG_EN)
  const ar = tr(LANG_AR)
  return {
    logo: null,
    phone: profile.phone ?? '',
    website_url: profile.website_url ?? '',
    name_en: en?.name ?? '',
    name_ar: ar?.name ?? '',
    description_en: en?.description ?? '',
    description_ar: ar?.description ?? '',
    address_en: en?.address ?? '',
    address_ar: ar?.address ?? '',
  }
}

const card = 'rounded-2xl border border-border/60 bg-white shadow-xs dark:bg-zinc-900'

export default function CompanyProfilePage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const { data: profile, isLoading, isError, refetch } = useCompanyProfile()

  if (isLoading) return <ProfileSkeleton />
  if (isError || !profile) {
    return (
      <div className={cn(card, 'flex flex-col items-center gap-3 p-10 text-center')} dir={isRtl ? 'rtl' : 'ltr'}>
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <p className="font-semibold text-gray-900 dark:text-zinc-100">{t('profile.loadError')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RotateCcw /> {t('profile.retry')}
        </Button>
      </div>
    )
  }

  return <ProfileView profile={profile} />
}

function ProfileView({ profile }: { profile: CompanyProfile }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const update = useUpdateCompanyProfile()

  const methods = useZodForm(profileSchema, EMPTY_PROFILE)
  const { reset, handleSubmit, setError, formState } = methods

  // Re-sync whenever fresh server data arrives (initial load and after saving)
  React.useEffect(() => reset(toFormValues(profile)), [profile, reset])

  // Guard against losing edits on reload / tab close
  React.useEffect(() => {
    if (!formState.isDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [formState.isDirty])

  const onSubmit = (data: ProfileForm) => {
    update.mutate(
      {
        phone: normalizePhone(data.phone),
        website_url: normalizeUrl(data.website_url) ?? '',
        logo: data.logo,
        translations: [
          { language_id: LANG_EN, name: data.name_en, description: data.description_en, address: data.address_en },
          { language_id: LANG_AR, name: data.name_ar, description: data.description_ar, address: data.address_ar },
        ],
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || t('profile.saved'))
          // Make the saved values the new baseline right away — the refetch may return
          // structurally identical data, which wouldn't re-trigger the sync effect
          reset({ ...data, logo: null })
        },
        onError: (err) => {
          // 422 also raises the global toast; map field errors inline as well
          applyFieldErrors(err, setError, PROFILE_FIELD_MAP)
        },
      }
    )
  }

  const displayName = profile.translations.find((x) => x.language_id === (isRtl ? LANG_AR : LANG_EN))?.name || profile.name

  return (
    <div className="space-y-4 pb-24 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <FormProvider {...methods}>
        <form id="company-profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ── Identity header ───────────────────────────────────── */}
          <div className={cn(card, 'overflow-hidden')}>
            <div className="relative h-28 bg-[linear-gradient(120deg,#1F2354,#3D4485_55%,#5C66AF)]">
              <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.08]">
                <defs>
                  <pattern id="profile-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0V24" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#profile-grid)" />
              </svg>
            </div>
            <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
              <div className="-mt-14">
                <LogoPicker name="logo" currentUrl={profile.logo_url} alt={displayName} />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-start">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="truncate text-xl font-bold text-gray-900 dark:text-zinc-100">{displayName}</h1>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                      profile.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', profile.is_active ? 'bg-emerald-500' : 'bg-amber-500')} />
                    {t(profile.is_active ? 'active' : 'inactive')}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
                  <span className="inline-flex items-center gap-1.5" dir="ltr">
                    <Mail className="h-3.5 w-3.5" /> {profile.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5" dir="ltr">
                    <Hash className="h-3.5 w-3.5" /> {profile.slug}
                  </span>
                </div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground sm:max-w-[14rem] sm:text-end">{t('profile.logo.hint')}</p>
            </div>
          </div>
        </form>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="h-auto rounded-xl bg-white p-1 shadow-xs dark:bg-zinc-900">
            <TabsTrigger value="details" className="gap-2 rounded-lg px-4 py-2 text-sm font-bold">
              <Building2 className="h-4 w-4" /> {t('profile.tabs.details')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-lg px-4 py-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4" /> {t('profile.tabs.security')}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <TabsContent value="details" className="mt-0 space-y-4">
                {/* Contact */}
                <section className={cn(card, 'space-y-4 p-6')}>
                  <SectionTitle icon={Phone} title={t('profile.sections.contact')} subtitle={t('profile.sections.contactHint')} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <BaseInputField form="company-profile-form" name="phone" label={`${t('auth.fields.phone')} *`} placeholder="+966 800 124 9990" inputMode="tel" dir="ltr" />
                    <BaseInputField form="company-profile-form" name="website_url" label={t('auth.fields.website')} placeholder="www.company.com" inputMode="url" dir="ltr" />
                  </div>
                </section>

                {/* Bilingual content */}
                <section className={cn(card, 'space-y-5 p-6')}>
                  <SectionTitle icon={Globe} title={t('profile.sections.content')} subtitle={t('profile.sections.contentHint')} />
                  <div className="grid gap-5 xl:grid-cols-2">
                    {(['en', 'ar'] as const).map((lang) => (
                      <fieldset key={lang} className="space-y-4 rounded-2xl border border-border/60 bg-gray-50/50 p-4 dark:bg-zinc-950/30">
                        <legend className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {lang === 'en' ? 'English' : 'العربية'}
                        </legend>
                        <BaseInputField
                          form="company-profile-form"
                          name={`name_${lang}`}
                          label={`${t('profile.fields.name')} *`}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <BaseTextAreaField
                          form="company-profile-form"
                          name={`description_${lang}`}
                          label={t('auth.fields.description')}
                          rows={4}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <BaseInputField
                          form="company-profile-form"
                          name={`address_${lang}`}
                          label={t('auth.fields.address')}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </fieldset>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <ChangePasswordCard />
              </TabsContent>
            </div>

            <RegulatorySidebar profile={profile} />
          </div>
        </Tabs>

        {/* ── Sticky save bar (only while there are unsaved edits) ── */}
        <AnimatePresence>
          {formState.isDirty && (
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="sticky bottom-4 z-20 mt-4"
            >
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#D6DAEE] bg-white/95 px-5 py-3 shadow-[0_18px_40px_rgba(31,35,84,.16)] backdrop-blur sm:flex-row dark:border-zinc-800 dark:bg-zinc-900/95">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  {t('profile.unsaved')}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="rounded-xl" disabled={update.isPending} onClick={() => reset()}>
                    <RotateCcw /> {t('profile.discard')}
                  </Button>
                  <Button type="submit" form="company-profile-form" className="rounded-xl px-5" loading={update.isPending}>
                    <Save /> {t('saveChanges')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FormProvider>
    </div>
  )
}

// ─── Read-only regulatory info ───────────────────────────────────────────────

function RegulatorySidebar({ profile }: { profile: CompanyProfile }) {
  const { t } = useTranslation()
  const rows = [
    { icon: FileBadge, label: t('auth.fields.license'), value: profile.license_number },
    { icon: ReceiptText, label: t('auth.fields.tax'), value: profile.tax_number },
    { icon: Mail, label: t('profile.fields.loginEmail'), value: profile.email },
  ]
  return (
    <aside className="space-y-4">
      <section className={cn(card, 'p-5')}>
        <SectionTitle icon={BadgeCheck} title={t('profile.sections.regulatory')} />
        <dl className="mt-4 divide-y divide-border/60">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-50 text-muted-foreground dark:bg-zinc-800">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold text-muted-foreground">{label}</dt>
                <dd dir="ltr" className="truncate text-sm font-bold text-gray-900 rtl:text-right dark:text-zinc-100">
                  {value || '—'}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex gap-2 rounded-xl bg-[#EEEFF8] p-3 text-xs leading-relaxed text-[#1F2354] dark:bg-indigo-950/30 dark:text-indigo-200">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('profile.regulatoryNote')}
        </p>
      </section>

      <section className={cn(card, 'p-5')}>
        <SectionTitle icon={Layers} title={t('profile.sections.categories')} />
        {profile.categories.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.categories.map((c) => (
              <li key={c.id} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-gray-50 py-1 pe-3 ps-1 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-200">
                <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  <CategoryIcon icon={c.icon} iconUrl={c.icon_url} className="h-4 w-4" />
                </span>
                {c.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">{t('profile.noCategories')}</p>
        )}
      </section>
    </aside>
  )
}

// ─── Change password ─────────────────────────────────────────────────────────

const EMPTY_PASSWORD: PasswordForm = { current_password: '', password: '', password_confirmation: '' }

function ChangePasswordCard() {
  const { t } = useTranslation()
  const change = useChangeCompanyPassword()
  const methods = useZodForm(passwordSchema, EMPTY_PASSWORD)

  const onSubmit = (data: PasswordForm) =>
    change.mutate(data, {
      onSuccess: (res) => {
        toast.success(res.message || t('profile.password.changed'))
        methods.reset(EMPTY_PASSWORD)
      },
      onError: (err) => {
        applyFieldErrors(err, methods.setError)
      },
    })

  return (
    <section className={cn(card, 'p-6')}>
      <SectionTitle icon={KeyRound} title={t('profile.password.title')} subtitle={t('profile.password.subtitle')} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="mt-5 max-w-xl space-y-4">
          <BaseInputField name="current_password" type="password" label={`${t('profile.password.current')} *`} autoComplete="current-password" dir="ltr" />
          <div className="space-y-3">
            <BaseInputField name="password" type="password" label={`${t('auth.fields.newPassword')} *`} autoComplete="new-password" dir="ltr" />
            <PasswordStrength value={methods.watch('password')} />
          </div>
          <BaseInputField name="password_confirmation" type="password" label={`${t('auth.fields.confirmPassword')} *`} autoComplete="new-password" dir="ltr" />
          <div className="flex justify-end pt-2">
            <Button type="submit" className="rounded-xl px-5" loading={change.isPending}>
              <ShieldCheck /> {t('profile.password.submit')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Phone; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className={cn(card, 'h-56')} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={cn(card, 'h-96')} />
        <div className={cn(card, 'h-72')} />
      </div>
    </div>
  )
}
