import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ControlledInput, FormField } from '@/components/shared/form-fields'
import { Switch } from '@/components/shared/controls'
import type { Customer, Role } from '@/types/api'
import { useProfile } from '@/features/auth/api/useAuth'
import { useSaveCustomer, type CustomerPayload } from '../api/useCustomers'

const phone = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\+?[0-9\s-]{7,20}$/.test(v), 'validation.phone')

// Mirrors gravuta-backend/validations/user.validation.js
const makeSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().trim().min(3, 'validation.min3').max(50, 'validation.max50'),
    email: z.string().trim().min(1, 'validation.required').email('validation.email'),
    phone,
    role: z.enum(['user', 'admin']),
    isActive: z.boolean(),
    password: isEdit
      ? z.string().refine((v) => v === '' || v.length >= 6, 'validation.min6')
      : z.string().min(6, 'validation.min6'),
  })
type FormValues = z.infer<ReturnType<typeof makeSchema>>

export function CustomerFormModal({
  open,
  onOpenChange,
  customer,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  customer: Customer | null
  onCreated?: (id: string) => void
}) {
  const { t } = useTranslation()
  const isEdit = !!customer
  const { data: me } = useProfile()
  const isSelf = !!customer && !!me && customer._id === me.id
  const save = useSaveCustomer()
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: { name: '', email: '', phone: '', role: 'user', isActive: true, password: '' },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      role: customer?.role ?? 'user',
      isActive: customer?.isActive ?? true,
      password: '',
    })
  }, [open, customer, reset])

  const onSubmit = (v: FormValues) => {
    let payload: CustomerPayload
    if (isEdit) {
      // Only send what changed (the API rejects an admin demoting/deactivating themself)
      payload = {}
      if (formState.dirtyFields.name) payload.name = v.name.trim()
      if (formState.dirtyFields.email) payload.email = v.email.trim().toLowerCase()
      if (formState.dirtyFields.phone) payload.phone = v.phone.trim()
      if (formState.dirtyFields.role) payload.role = v.role as Role
      if (formState.dirtyFields.isActive) payload.isActive = v.isActive
      if (v.password) payload.password = v.password
      if (!Object.keys(payload).length) return onOpenChange(false)
    } else {
      payload = { name: v.name.trim(), email: v.email.trim().toLowerCase(), password: v.password, role: v.role as Role }
      if (v.phone.trim()) payload.phone = v.phone.trim()
    }
    save.mutate(
      { id: customer?._id, payload },
      {
        onSuccess: (res) => {
          onOpenChange(false)
          const created = (res.data as { user?: { id?: string; _id?: string } })?.user
          if (!isEdit && created) onCreated?.(created.id ?? created._id ?? '')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('customers.edit') : t('customers.add')}</DialogTitle>
          {!isEdit && <DialogDescription>{t('customers.addHint')}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <ControlledInput<FormValues> name="name" control={control} label={t('common.name')} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledInput<FormValues> name="email" control={control} label={t('common.email')} type="email" required />
            <ControlledInput<FormValues> name="phone" control={control} label={t('common.phone')} placeholder="+9665XXXXXXXX" />
          </div>
          <ControlledInput<FormValues>
            name="password"
            control={control}
            label={isEdit ? t('customers.newPassword') : t('auth.fields.password')}
            type="password"
            required={!isEdit}
            hint={isEdit ? t('customers.passwordHint') : t('validation.min6')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <FormField label={t('customers.role')}>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isSelf}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('role.user')}</SelectItem>
                      <SelectItem value="admin">{t('role.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
            {isEdit && (
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormField label={t('common.status')}>
                    <label className="flex h-10 cursor-pointer items-center justify-between rounded-xl border border-border px-3">
                      <span className="text-sm">{field.value ? t('common.active') : t('common.inactive')}</span>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSelf} />
                    </label>
                  </FormField>
                )}
              />
            )}
          </div>
          {isSelf && <p className="text-xs text-muted-foreground">{t('customers.selfHint')}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={save.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
