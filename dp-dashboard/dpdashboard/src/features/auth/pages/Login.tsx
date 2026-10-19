import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserRound } from 'lucide-react'
import { useZodForm } from '@/components/shared/form-fields'
import { useLogin } from '../api/useAuth'
import { loginSchema, type LoginForm } from '../lib/schemas'
import { clearLogoutReason, getLogoutReason, getRememberMe, setRememberMe } from '../lib/authStorage'
import { applyFieldErrors, getErrorMessage, getErrorStatus } from '../lib/errors'
import {
  AuthCard,
  AuthCheckbox,
  AuthField,
  AuthPageHeader,
  AuthSwitch,
  FormBanner,
  SubmitButton,
  authLinkClass,
  useForwardArrow,
} from '../components/AuthUI'

type LoginState = { from?: Location; flash?: 'passwordReset' } | null

type Banner = { variant: 'error' | 'warning'; title?: string; message: string; action?: 'pending' | 'verify' }

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginState
  const Arrow = useForwardArrow()

  const { mutate: login, isPending } = useLogin()
  // Explain why the user landed here after a forced logout (deactivated account / expired session)
  const [banner, setBanner] = React.useState<Banner | null>(() => {
    const reason = getLogoutReason()
    if (!reason) return null
    return reason.kind === 'inactive'
      ? { variant: 'warning', title: t('auth.login.deactivatedTitle'), message: reason.message || t('auth.login.deactivated') }
      : { variant: 'warning', title: t('auth.login.expiredTitle'), message: t('auth.login.expired') }
  })
  React.useEffect(clearLogoutReason, [])

  const methods = useZodForm(loginSchema, { email: '', password: '', remember: getRememberMe() })

  const onSubmit = (data: LoginForm) => {
    setBanner(null)
    setRememberMe(data.remember)
    login(
      { email: data.email.toLowerCase(), password: data.password },
      {
        onSuccess: (session) => {
          if (!session.token) {
            setBanner({ variant: 'error', message: session.message || t('auth.errors.generic') })
            return
          }
          toast.success(session.message || t('auth.login.success'))
          const from = state?.from
          const target = from && from.pathname !== '/login' ? `${from.pathname}${from.search}` : '/'
          navigate(target, { replace: true })
        },
        onError: (err) => {
          const status = getErrorStatus(err)
          const message = getErrorMessage(err, t('auth.errors.generic'))

          if (status === 403) {
            // Inactive (awaiting admin approval) or phone not yet verified
            const needsVerification = /verif|تحقق|تفعيل الهاتف/i.test(message)
            setBanner({
              variant: 'warning',
              title: t(needsVerification ? 'auth.login.unverifiedTitle' : 'auth.login.inactiveTitle'),
              message,
              action: needsVerification ? 'verify' : 'pending',
            })
            return
          }

          if (status === 422) applyFieldErrors(err, methods.setError)
          setBanner({ variant: 'error', message: status === 401 ? t('auth.login.invalidCredentials') : message })
          methods.resetField('password', { keepError: true })
        },
      }
    )
  }

  return (
    <AuthCard>
      <AuthPageHeader icon={UserRound} title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {state?.flash === 'passwordReset' && !banner && (
            <FormBanner variant="success" title={t('auth.reset.doneTitle')}>
              {t('auth.login.afterReset')}
            </FormBanner>
          )}

          {banner && (
            <FormBanner
              variant={banner.variant}
              title={banner.title}
              action={
                banner.action && (
                  <Link
                    to={banner.action === 'verify' ? '/verify-account' : '/pending-approval'}
                    className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
                  >
                    {t(banner.action === 'verify' ? 'auth.login.verifyNow' : 'auth.login.whatNext')}
                    <Arrow className="h-3.5 w-3.5" />
                  </Link>
                )
              }
            >
              {banner.message}
            </FormBanner>
          )}

          <AuthField
            name="email"
            type="email"
            label={t('auth.fields.email')}
            placeholder="contact@company.com"
            autoComplete="username"
            autoFocus
            required
            dir="ltr"
          />

          <AuthField
            name="password"
            type="password"
            label={t('auth.fields.password')}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            dir="ltr"
          />

          <div className="flex items-center justify-between gap-4">
            <AuthCheckbox name="remember" label={t('auth.login.remember')} />
            <Link to="/forgot-password" className={`text-sm ${authLinkClass}`}>
              {t('auth.login.forgot')}
            </Link>
          </div>

          <div className="pt-1.5">
            <SubmitButton loading={isPending}>{t('auth.login.submit')}</SubmitButton>
          </div>
        </form>
      </FormProvider>

      <AuthSwitch>
        {t('auth.login.newHere')}{' '}
        <Link to="/register" className={authLinkClass}>
          {t('auth.login.createAccount')}
        </Link>
      </AuthSwitch>
    </AuthCard>
  )
}
