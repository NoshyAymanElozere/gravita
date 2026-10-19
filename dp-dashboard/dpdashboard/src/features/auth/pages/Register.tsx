import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Building2, Check, FileText, UserRound } from 'lucide-react'
import { useZodForm } from '@/components/shared/form-fields'
import { cn } from '@/utils/utils'
import { useRegister } from '../api/useAuth'
import { LANG_AR, LANG_EN } from '../lib/authStorage'
import {
  REGISTER_FIELD_MAP,
  REGISTER_STEPS,
  normalizeUrl,
  registerSchema,
  slugify,
  toE164,
  type RegisterForm,
} from '../lib/schemas'
import { applyFieldErrors, getErrorMessage } from '../lib/errors'
import {
  AuthCard,
  AuthField,
  AuthPageHeader,
  AuthSwitch,
  AuthTextarea,
  FormBanner,
  PasswordStrength,
  PhoneField,
  SecondaryButton,
  SubmitButton,
  authLinkClass,
} from '../components/AuthUI'
import { CategoryPicker } from '../components/CategoryPicker'

const STEP_ICONS = [Building2, FileText, UserRound]

const DEFAULTS: RegisterForm = {
  name_en: '',
  name_ar: '',
  license_number: '',
  tax_number: '',
  website_url: '',
  category_ids: [],
  description_en: '',
  description_ar: '',
  address_en: '',
  address_ar: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
}

const opt = (v?: string) => (v?.trim() ? v.trim() : undefined)

export default function Register() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const Back = isRtl ? ArrowRight : ArrowLeft

  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const { mutate: register, isPending } = useRegister()

  const methods = useZodForm(registerSchema, DEFAULTS)
  const { watch, trigger, handleSubmit, setError } = methods
  const isLast = step === REGISTER_STEPS.length - 1

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleNext = async () => {
    const valid = await trigger(REGISTER_STEPS[step].fields, { shouldFocus: true })
    if (valid) goTo(step + 1)
  }

  const onSubmit = (data: RegisterForm) => {
    setServerError(null)
    const phone = toE164(data.phone)

    register(
      {
        slug: slugify(data.name_en),
        email: data.email.toLowerCase(),
        phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        license_number: data.license_number,
        tax_number: data.tax_number,
        website_url: normalizeUrl(data.website_url),
        category_ids: data.category_ids,
        translations: [
          { language_id: LANG_EN, name: data.name_en, description: opt(data.description_en), address: opt(data.address_en) },
          { language_id: LANG_AR, name: data.name_ar, description: opt(data.description_ar), address: opt(data.address_ar) },
        ],
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || t('auth.register.success'))
          navigate('/verify-account', { state: { phone }, replace: true })
        },
        onError: (err) => {
          const fields = applyFieldErrors(err, setError, REGISTER_FIELD_MAP)
          // Jump back to the first step that has a server-side error
          const firstStep = REGISTER_STEPS.findIndex((s) => s.fields.some((f) => fields.includes(f)))
          if (firstStep >= 0 && firstStep !== step) goTo(firstStep)
          setServerError(getErrorMessage(err, t('auth.errors.generic')))
        },
      }
    )
  }

  return (
    <AuthCard className="max-w-[620px]">
      <AuthPageHeader icon={Building2} title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} />

      {/* Stepper */}
      <ol className="mb-7 flex items-center gap-2">
        {REGISTER_STEPS.map((s, i) => {
          const Icon = STEP_ICONS[i]
          const done = i < step
          const active = i === step
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={i > step}
                onClick={() => i < step && goTo(i)}
                className="flex items-center gap-2.5 disabled:cursor-default"
              >
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-300',
                    done && 'bg-[linear-gradient(145deg,#5C66AF,#1F2354)] text-white',
                    active && 'bg-[#EEEFF8] text-[#5C66AF] shadow-[0_0_0_3px_rgba(92,102,175,.11)]',
                    !done && !active && 'border border-[#D8DAEB] bg-white text-[#9AA0C3]'
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-[18px] w-[18px]" />}
                </span>
                <span className="hidden text-start sm:block">
                  <span className="block text-[11px] text-[#9AA0C3]">
                    {t('auth.register.stepOf', { current: i + 1, total: REGISTER_STEPS.length })}
                  </span>
                  <span className={cn('block text-[13px] font-bold', active || done ? 'text-[#1F2354]' : 'text-[#9AA0C3]')}>
                    {t(`auth.register.steps.${s.key}`)}
                  </span>
                </span>
              </button>
              {i < REGISTER_STEPS.length - 1 && (
                <span className="mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-[#EEEFF8]">
                  <span className={cn('block h-full bg-[linear-gradient(90deg,#5C66AF,#1F2354)] transition-all duration-500', done ? 'w-full' : 'w-0')} />
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <FormProvider {...methods}>
        <form
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (isLast) handleSubmit(onSubmit)(e)
            else handleNext()
          }}
        >
          {serverError && <FormBanner variant="error">{serverError}</FormBanner>}

          <div className="-m-1 overflow-hidden p-1">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: (isRtl ? -1 : 1) * direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: (isRtl ? 1 : -1) * direction * 24 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AuthField name="name_en" label={t('auth.fields.nameEn')} placeholder="Al Sagr Cooperative Insurance" dir="ltr" required autoFocus />
                      <AuthField name="name_ar" label={t('auth.fields.nameAr')} placeholder="شركة الصقر للتأمين التعاوني" dir="rtl" required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AuthField name="license_number" label={t('auth.fields.license')} placeholder="SAMA-INS-011" dir="ltr" required />
                      <AuthField name="tax_number" label={t('auth.fields.tax')} placeholder="300099988800003" inputMode="numeric" maxLength={15} dir="ltr" required />
                    </div>
                    <AuthField name="website_url" label={`${t('auth.fields.website')} (${t('auth.optional')})`} placeholder="www.company.com" inputMode="url" dir="ltr" />
                    <CategoryPicker label={t('auth.fields.categories')} hint={t('auth.register.categoriesHint')} />
                  </>
                )}

                {step === 1 && (
                  <>
                    <FormBanner variant="info">{t('auth.register.profileHint')}</FormBanner>
                    {(['en', 'ar'] as const).map((lang) => (
                      <fieldset key={lang} className="space-y-4 rounded-2xl border border-[#D8DAEB] bg-[#FAFBFE] p-4">
                        <legend className="rounded-md bg-[#EEEFF8] px-2 py-0.5 text-xs font-bold text-[#5C66AF]">
                          {lang === 'en' ? 'English' : 'العربية'}
                        </legend>
                        <AuthTextarea
                          name={`description_${lang}`}
                          label={t('auth.fields.description')}
                          placeholder={lang === 'en' ? 'Leading insurance provider in KSA.' : 'حلول تأمينية متكاملة للأفراد والشركات.'}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <AuthField
                          name={`address_${lang}`}
                          label={t('auth.fields.address')}
                          placeholder={lang === 'en' ? 'King Abdulaziz Rd, Riyadh' : 'طريق الملك عبدالعزيز، الرياض'}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </fieldset>
                    ))}
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AuthField name="email" type="email" label={t('auth.fields.email')} placeholder="contact@company.com" autoComplete="email" dir="ltr" required autoFocus />
                      <PhoneField name="phone" label={t('auth.fields.phone')} required />
                    </div>
                    <AuthField name="password" type="password" label={t('auth.fields.password')} placeholder="••••••••" autoComplete="new-password" dir="ltr" required />
                    <PasswordStrength value={watch('password')} />
                    <AuthField name="password_confirmation" type="password" label={t('auth.fields.confirmPassword')} placeholder="••••••••" autoComplete="new-password" dir="ltr" required />
                    <FormBanner variant="info">{t('auth.register.otpNotice')}</FormBanner>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <SecondaryButton onClick={() => goTo(step - 1)}>
                <Back className="h-[18px] w-[18px]" />
                {t('auth.back')}
              </SecondaryButton>
            )}
            <SubmitButton loading={isPending} className="flex-1">
              {isLast ? t('auth.register.submit') : t('auth.next')}
            </SubmitButton>
          </div>
        </form>
      </FormProvider>

      <AuthSwitch>
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className={authLinkClass}>
          {t('auth.login.submit')}
        </Link>
      </AuthSwitch>
    </AuthCard>
  )
}
