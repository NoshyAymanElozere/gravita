import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'

// AURA storefront tokens: primary #374037, secondary #4A5948, sage #748972, sage-light #BAD1B8, cream #F4F2E4
const fieldBase =
  'w-full rounded-xl border bg-white text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60'
const fieldState = (error?: boolean) =>
  error
    ? 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,.12)]'
    : 'border-zinc-200 hover:border-[#BAD1B8] focus:border-[#748972] focus:shadow-[0_0_0_3px_rgba(116,137,114,.15)]'

// ─── Card shell ──────────────────────────────────────────────────────────────

export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-zinc-200/80 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(55,64,55,.08)] sm:p-11',
        className
      )}
    >
      <span aria-hidden className="absolute start-11 top-0 h-[3px] w-20 rounded-b-lg bg-[linear-gradient(90deg,#748972,#374037)]" />
      {children}
    </div>
  )
}

export function AuthPageHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-7">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F4F2E4] text-[#374037]">
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="mb-1.5 mt-5 text-2xl font-bold leading-snug text-[#374037]">{title}</h1>
      {subtitle && <p className="text-sm leading-relaxed text-zinc-500">{subtitle}</p>}
    </div>
  )
}

// ─── Inline banner ───────────────────────────────────────────────────────────

const bannerStyles = {
  error: { cls: 'border-red-200 bg-red-50 text-red-800', icon: AlertCircle, iconCls: 'text-red-500' },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-800', icon: TriangleAlert, iconCls: 'text-amber-500' },
  success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2, iconCls: 'text-emerald-500' },
  info: { cls: 'border-[#BAD1B8] bg-[#F4F2E4] text-[#374037]', icon: ShieldCheck, iconCls: 'text-[#748972]' },
}

export function FormBanner({
  variant = 'error',
  title,
  children,
}: {
  variant?: keyof typeof bannerStyles
  title?: string
  children?: React.ReactNode
}) {
  const { cls, icon: Icon, iconCls } = bannerStyles[variant]
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] animate-fade-in', cls)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconCls)} />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="font-medium leading-relaxed">{children}</div>}
      </div>
    </div>
  )
}

// ─── Fields ──────────────────────────────────────────────────────────────────

type AuthFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> & {
  name: string
  label: string
  type?: 'text' | 'password' | 'email'
}

export function AuthField({ name, label, required, type = 'text', className, dir, ...props }: AuthFieldProps) {
  const { t } = useTranslation()
  const { register, formState } = useFormContext()
  const [visible, setVisible] = React.useState(false)
  const isPassword = type === 'password'
  const error = formState.errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] font-semibold text-[#374037]">
        {label}
        {required && <i className="ms-1 not-italic text-red-500">*</i>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={isPassword && !visible ? 'password' : type === 'email' ? 'email' : 'text'}
          dir={dir}
          aria-invalid={!!error}
          className={cn(fieldBase, fieldState(!!error), 'h-12 px-4', dir === 'ltr' && 'rtl:text-right', isPassword && 'pe-11', className)}
          {...register(name)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 end-3 my-auto grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:text-[#374037]"
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-semibold text-red-500">{t(error)}</p>}
    </div>
  )
}

export function AuthCheckbox({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext()
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-zinc-600">
      <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-[#374037]" {...register(name)} />
      {label}
    </label>
  )
}

export function SubmitButton({
  loading,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#374037] text-[15px] font-semibold text-[#F4F2E4] shadow-[0_12px_25px_rgba(55,64,55,.22)] transition-all hover:-translate-y-px hover:bg-[#4A5948] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {loading ? <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" /> : children}
    </button>
  )
}
