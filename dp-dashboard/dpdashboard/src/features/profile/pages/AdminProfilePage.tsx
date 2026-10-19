import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserCog, KeyRound, ShieldCheck } from 'lucide-react'
import { PageHeader, SectionCard } from '@/components/shared/page-header'
import { ControlledInput } from '@/components/shared/form-fields'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/utils/utils'
import { getApiErrorStatus } from '@/services/axios'
import { useChangePassword, useProfile, useUpdateProfile } from '@/features/auth/api/useAuth'

// Mirrors updateProfileSchema / changePasswordSchema in gravuta-backend/validations/user.validation.js
const profileSchema = z.object({
  name: z.string().trim().min(3, 'validation.min3').max(50, 'validation.max50'),
  email: z.string().trim().min(1, 'validation.required').email('validation.email'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\+?[0-9\s-]{7,20}$/.test(v), 'validation.phone'),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.required'),
    newPassword: z.string().min(6, 'validation.min6'),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'profile.passwordMismatch' })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ['newPassword'], message: 'profile.passwordSame' })
type PasswordValues = z.infer<typeof passwordSchema>

export default function AdminProfilePage() {
  const { t } = useTranslation()
  const { data: me } = useProfile()
  const update = useUpdateProfile()
  const change = useChangePassword()

  const profile = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: '', email: '', phone: '' } })
  const password = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } })

  useEffect(() => {
    if (me) profile.reset({ name: me.name ?? '', email: me.email ?? '', phone: me.phone ?? '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, me?.name, me?.email, me?.phone])

  const saveProfile = (v: ProfileValues) =>
    update.mutate(
      { name: v.name.trim(), email: v.email.trim().toLowerCase(), phone: v.phone.trim() },
      { onSuccess: (res) => toast.success(res.message || t('profile.saved')) }
    )

  const savePassword = (v: PasswordValues) =>
    change.mutate(
      { currentPassword: v.currentPassword, newPassword: v.newPassword },
      {
        onSuccess: (res) => {
          toast.success(res.message || t('profile.passwordChanged'))
          password.reset()
        },
        onError: (err) => {
          // 401 here means the current password is wrong (not an expired session)
          if (getApiErrorStatus(err) === 401) password.setError('currentPassword', { message: 'profile.wrongPassword' })
        },
      }
    )

  return (
    <div className="animate-fade-in">
      <PageHeader icon={UserCog} title={t('profile.title')} description={t('profile.subtitle')} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard className="xl:row-span-2">
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-cream text-2xl font-bold text-brand-primary dark:bg-accent dark:text-accent-foreground">
              {getInitials(me?.name ?? '') || 'A'}
            </span>
            <p className="mt-4 text-lg font-semibold">{me?.name}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {me?.email}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-cream dark:bg-brand-sage-light dark:text-brand-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('role.admin')}
            </span>
          </div>
        </SectionCard>

        <SectionCard title={t('profile.details')} className="xl:col-span-2">
          <form onSubmit={profile.handleSubmit(saveProfile)} className="space-y-4" noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <ControlledInput<ProfileValues> name="name" control={profile.control} label={t('common.name')} required />
              <ControlledInput<ProfileValues> name="phone" control={profile.control} label={t('common.phone')} placeholder="+9665XXXXXXXX" />
              <ControlledInput<ProfileValues> name="email" control={profile.control} label={t('common.email')} type="email" required className="md:col-span-2" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={update.isPending} disabled={!profile.formState.isDirty}>
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4" />{t('profile.changePassword')}</span>} description={t('profile.passwordHint')} className="xl:col-span-2">
          <form onSubmit={password.handleSubmit(savePassword)} className="space-y-4" noValidate>
            <div className="grid gap-4 md:grid-cols-3">
              <ControlledInput<PasswordValues> name="currentPassword" control={password.control} label={t('profile.currentPassword')} type="password" required />
              <ControlledInput<PasswordValues> name="newPassword" control={password.control} label={t('profile.newPassword')} type="password" required />
              <ControlledInput<PasswordValues> name="confirmPassword" control={password.control} label={t('profile.confirmPassword')} type="password" required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={change.isPending}>
                {t('profile.updatePassword')}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
