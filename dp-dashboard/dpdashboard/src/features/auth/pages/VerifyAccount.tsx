import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react'
import { useZodForm } from '@/components/shared/form-fields'
import { useResendOtp, useVerifyOtp } from '../api/useAuth'
import { clearPendingPhone, getPendingPhone } from '../lib/authStorage'
import { phoneSchema, toE164, type PhoneForm } from '../lib/schemas'
import { applyFieldErrors, getErrorMessage } from '../lib/errors'
import { AuthCard, AuthPageHeader, FormBanner, PhoneField, SubmitButton, authLinkClass } from '../components/AuthUI'
import { OtpVerification } from '../components/OtpVerification'

export default function VerifyAccount() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const Back = i18n.language === 'ar' ? ArrowRight : ArrowLeft

  const [phone, setPhone] = React.useState<string | null>(
    () => (location.state as { phone?: string } | null)?.phone ?? getPendingPhone()
  )
  const [error, setError] = React.useState<string | null>(null)

  const verify = useVerifyOtp()
  const resend = useResendOtp()
  const methods = useZodForm(phoneSchema, { phone: '' })

  // ── Step 1 (only when no pending phone): request a fresh code ──
  const requestCode = (data: PhoneForm) => {
    setError(null)
    const e164 = toE164(data.phone)
    resend.mutate(
      { phone: e164 },
      {
        onSuccess: (res) => {
          toast.success(res.message || t('auth.otp.resent'))
          setPhone(e164)
        },
        onError: (err) => {
          applyFieldErrors(err, methods.setError)
          setError(getErrorMessage(err, t('auth.errors.generic')))
        },
      }
    )
  }

  // ── Step 2: verify ──
  const handleVerify = (code: string) => {
    if (!phone) return
    setError(null)
    verify.mutate(
      { phone, code },
      {
        onSuccess: (session) => {
          if (session.token && session.isActive) {
            toast.success(t('auth.verify.welcome'))
            navigate('/', { replace: true })
          } else {
            // Verified, but the account awaits admin activation (token: null, is_active: false)
            navigate('/pending-approval', { replace: true, state: { verified: true } })
          }
        },
        onError: (err) => setError(getErrorMessage(err, t('auth.otp.invalid'))),
      }
    )
  }

  const handleResend = () => {
    setError(null)
    return resend.mutateAsync({ phone: phone! }).catch((err) => {
      setError(getErrorMessage(err, t('auth.errors.generic')))
      throw err
    })
  }

  const changeNumber = () => {
    clearPendingPhone()
    setPhone(null)
    setError(null)
  }

  if (!phone) {
    return (
      <AuthCard>
        <AuthPageHeader icon={Smartphone} title={t('auth.verify.title')} subtitle={t('auth.verify.enterPhone')} />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(requestCode)} className="space-y-5" noValidate>
            {error && <FormBanner variant="error">{error}</FormBanner>}
            <PhoneField name="phone" label={t('auth.fields.phone')} required autoFocus />
            <SubmitButton loading={resend.isPending}>{t('auth.verify.sendCode')}</SubmitButton>
          </form>
        </FormProvider>
        <BackToLogin icon={Back} />
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthPageHeader icon={ShieldCheck} title={t('auth.verify.title')} subtitle={t('auth.verify.subtitle')} />
      <OtpVerification
        destination={phone}
        onVerify={handleVerify}
        onResend={handleResend}
        isVerifying={verify.isPending}
        isResending={resend.isPending}
        submitLabel={t('auth.verify.submit')}
        error={error}
      />
      <div className="mt-[22px] text-center">
        <button type="button" onClick={changeNumber} className={`text-[13px] ${authLinkClass}`}>
          {t('auth.verify.changeNumber')}
        </button>
      </div>
      <BackToLogin icon={Back} />
    </AuthCard>
  )
}

function BackToLogin({ icon: Icon }: { icon: typeof ArrowLeft }) {
  const { t } = useTranslation()
  return (
    <Link to="/login" className="mt-4 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#5E658E] transition hover:text-[#1F2354]">
      <Icon className="h-4 w-4" />
      {t('auth.backToLogin')}
    </Link>
  )
}
