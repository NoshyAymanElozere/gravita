import * as React from 'react'
import { FormProvider } from 'react-hook-form'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { LockKeyhole } from 'lucide-react'
import { useZodForm } from '@/components/shared/form-fields'
import { getApiErrorMessage, getApiErrorStatus } from '@/services/axios'
import { NotAdminError, useLogin } from '../api/useAuth'
import { loginSchema, type LoginForm } from '../lib/schemas'
import { clearLogoutReason, getLogoutReason, getRememberMe, setRememberMe } from '../lib/authStorage'
import { AuthCard, AuthCheckbox, AuthField, AuthPageHeader, FormBanner, SubmitButton } from '../components/AuthUI'

type Banner = { variant: 'error' | 'warning'; title?: string; message: string }

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  const { mutate: login, isPending } = useLogin()
  const [banner, setBanner] = React.useState<Banner | null>(() => {
    const reason = getLogoutReason()
    if (!reason) return null
    return { variant: 'warning', title: t('auth.login.expiredTitle'), message: reason.message || t('auth.login.expired') }
  })
  React.useEffect(clearLogoutReason, [])

  const methods = useZodForm(loginSchema, { email: '', password: '', remember: getRememberMe() })

  const onSubmit = (data: LoginForm) => {
    setBanner(null)
    setRememberMe(data.remember)
    login(
      { email: data.email.toLowerCase(), password: data.password },
      {
        onSuccess: () => {
          toast.success(t('auth.login.success'))
          const target = from && from.pathname !== '/login' ? `${from.pathname}${from.search}` : '/'
          navigate(target, { replace: true })
        },
        onError: (err) => {
          if (err instanceof NotAdminError) {
            setBanner({ variant: 'error', title: t('auth.login.notAdminTitle'), message: t('auth.login.notAdmin') })
            return
          }
          const status = getApiErrorStatus(err)
          setBanner({
            variant: status === 403 ? 'warning' : 'error',
            title: status === 403 ? t('auth.login.disabledTitle') : undefined,
            message: status === 401 ? t('auth.login.invalidCredentials') : getApiErrorMessage(err, t('auth.errors.generic')),
          })
          methods.resetField('password', { keepError: true })
        },
      }
    )
  }

  return (
    <AuthCard>
      <AuthPageHeader icon={LockKeyhole} title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {banner && (
            <FormBanner variant={banner.variant} title={banner.title}>
              {banner.message}
            </FormBanner>
          )}

          <AuthField
            name="email"
            type="email"
            label={t('auth.fields.email')}
            placeholder="admin@example.com"
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
          <AuthCheckbox name="remember" label={t('auth.login.remember')} />

          <div className="pt-1.5">
            <SubmitButton loading={isPending}>{t('auth.login.submit')}</SubmitButton>
          </div>
        </form>
      </FormProvider>

      <p className="mt-6 text-center text-xs text-zinc-400">{t('auth.login.adminOnly')}</p>
    </AuthCard>
  )
}
