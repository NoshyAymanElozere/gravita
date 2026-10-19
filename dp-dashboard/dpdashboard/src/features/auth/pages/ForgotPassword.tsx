import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useZodForm } from '@/components/shared/form-fields'
import { cn } from '@/utils/utils'
import { useForgotPassword, useResetPassword, useVerifyResetOtp } from '../api/useAuth'
import { forgotSchema, normalizeIdentifier, resetSchema, type ForgotForm, type ResetForm } from '../lib/schemas'
import { applyFieldErrors, getErrorMessage } from '../lib/errors'
import { AuthCard, AuthField, AuthPageHeader, FormBanner, PasswordStrength, SubmitButton, authLinkClass } from '../components/AuthUI'
import { OtpVerification } from '../components/OtpVerification'

type Step = 'request' | 'verify' | 'reset'
const STEPS: Step[] = ['request', 'verify', 'reset']

export default function ForgotPassword() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const Back = i18n.language === 'ar' ? ArrowRight : ArrowLeft

  const [step, setStep] = React.useState<Step>('request')
  const [identifier, setIdentifier] = React.useState('')
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const forgot = useForgotPassword()
  const verify = useVerifyResetOtp()
  const reset = useResetPassword()

  const requestForm = useZodForm(forgotSchema, { identifier: '' })
  const resetForm = useZodForm(resetSchema, { password: '', password_confirmation: '' })

  const go = (next: Step) => {
    setError(null)
    setStep(next)
  }

  // ── 1. Request code ──
  const sendCode = (id: string) =>
    forgot.mutateAsync({ identifier: id }).then((res) => {
      toast.success(res.message || t('auth.forgot.sent'))
      return res
    })

  const onRequest = (data: ForgotForm) => {
    setError(null)
    const id = normalizeIdentifier(data.identifier)
    sendCode(id)
      .then(() => {
        setIdentifier(id)
        go('verify')
      })
      .catch((err) => {
        applyFieldErrors(err, requestForm.setError)
        setError(getErrorMessage(err, t('auth.errors.generic')))
      })
  }

  // ── 2. Verify code ──
  const onVerify = (value: string) => {
    setError(null)
    verify.mutate(
      { identifier, code: value },
      {
        onSuccess: () => {
          setCode(value)
          go('reset')
        },
        onError: (err) => setError(getErrorMessage(err, t('auth.otp.invalid'))),
      }
    )
  }

  const onResend = () => {
    setError(null)
    return sendCode(identifier).catch((err) => {
      setError(getErrorMessage(err, t('auth.errors.generic')))
      throw err
    })
  }

  // ── 3. Set new password ──
  const onReset = (data: ResetForm) => {
    setError(null)
    reset.mutate(
      { identifier, code, ...data },
      {
        onSuccess: (res) => {
          toast.success(res.message || t('auth.reset.doneTitle'))
          navigate('/login', { replace: true, state: { flash: 'passwordReset' } })
        },
        onError: (err) => {
          const fields = applyFieldErrors(err, resetForm.setError)
          const message = getErrorMessage(err, t('auth.errors.generic'))
          // Code expired/consumed between steps — send the user back to verification
          const passwordIssue = fields.includes('password') || fields.includes('password_confirmation')
          if (!passwordIssue && /code|otp|رمز/i.test(message)) go('verify')
          setError(message)
        },
      }
    )
  }

  const header = {
    request: { icon: KeyRound, title: t('auth.forgot.title'), subtitle: t('auth.forgot.subtitle') },
    verify: { icon: ShieldCheck, title: t('auth.forgot.verifyTitle'), subtitle: t('auth.forgot.verifySubtitle') },
    reset: { icon: LockKeyhole, title: t('auth.reset.title'), subtitle: t('auth.reset.subtitle') },
  }[step]

  const stepIndex = STEPS.indexOf(step)

  return (
    <AuthCard>
      {/* Progress */}
      <div className="mb-7 flex gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-[#EEEFF8]">
            <span className={cn('block h-full rounded-full bg-[linear-gradient(90deg,#5C66AF,#1F2354)] transition-all duration-500', i <= stepIndex ? 'w-full' : 'w-0')} />
          </span>
        ))}
      </div>

      <AuthPageHeader icon={header.icon} title={header.title} subtitle={header.subtitle} />

      {step === 'request' && (
        <FormProvider {...requestForm}>
          <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-5" noValidate>
            {error && <FormBanner variant="error">{error}</FormBanner>}
            <AuthField
              name="identifier"
              label={t('auth.fields.identifier')}
              placeholder="contact@company.com"
              autoComplete="username"
              autoFocus
              dir="ltr"
            />
            <SubmitButton loading={forgot.isPending}>{t('auth.forgot.submit')}</SubmitButton>
          </form>
        </FormProvider>
      )}

      {step === 'verify' && (
        <>
          <OtpVerification
            destination={identifier}
            onVerify={onVerify}
            onResend={onResend}
            isVerifying={verify.isPending}
            isResending={forgot.isPending}
            submitLabel={t('auth.forgot.verifySubmit')}
            error={error}
          />
          <div className="mt-[22px] text-center">
            <button type="button" onClick={() => go('request')} className={`text-[13px] ${authLinkClass}`}>
              {t('auth.forgot.changeIdentifier')}
            </button>
          </div>
        </>
      )}

      {step === 'reset' && (
        <FormProvider {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-5" noValidate>
            {error && <FormBanner variant="error">{error}</FormBanner>}
            <AuthField
              name="password"
              type="password"
              label={t('auth.fields.newPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
              dir="ltr"
            />
            <PasswordStrength value={resetForm.watch('password')} />
            <AuthField
              name="password_confirmation"
              type="password"
              label={t('auth.fields.confirmPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
              dir="ltr"
            />
            <SubmitButton loading={reset.isPending}>{t('auth.reset.submit')}</SubmitButton>
          </form>
        </FormProvider>
      )}

      <Link to="/login" className="mt-[22px] flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#5E658E] transition hover:text-[#1F2354]">
        <Back className="h-4 w-4" />
        {t('auth.backToLogin')}
      </Link>
    </AuthCard>
  )
}
