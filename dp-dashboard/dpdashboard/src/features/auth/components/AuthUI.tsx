import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/utils'
import { passwordRules } from '../lib/schemas'

// Design tokens shared with the public website's auth pages
const fieldBase =
  'w-full rounded-xl border bg-[#fbfdfe] text-sm text-[#1F2354] outline-none transition-all placeholder:text-[#9AA0C3] hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:opacity-60'
const fieldState = (error?: boolean) =>
  error
    ? 'border-[#d94b52] focus:shadow-[0_0_0_3px_rgba(217,75,82,.12)]'
    : 'border-[rgba(31,35,84,.12)] hover:border-[rgba(92,102,175,.3)] focus:border-[#6F79BE] focus:shadow-[0_0_0_3px_rgba(92,102,175,.11)]'

export const authLinkClass = 'font-bold text-[#5C66AF] transition hover:text-[#1F2354]'

// ─── Card shell ──────────────────────────────────────────────────────────────

export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[470px] overflow-hidden rounded-[24px] border border-[#D8DAEB] bg-white px-5 py-7 shadow-[0_14px_45px_rgba(31,35,84,.07)] sm:p-[46px]',
        className
      )}
    >
      <span aria-hidden className="absolute start-[45px] top-0 h-[3px] w-[78px] rounded-b-lg bg-[linear-gradient(90deg,#5C66AF,#1F2354)]" />
      {children}
    </div>
  )
}

export function AuthPageHeader({
  icon: Icon,
  title,
  subtitle,
  tone = 'brand',
}: {
  icon: LucideIcon
  title: string
  subtitle?: React.ReactNode
  tone?: 'brand' | 'success' | 'warning'
}) {
  const tones = {
    brand: 'bg-[linear-gradient(145deg,#EEEFF8,#F7F8FD)] text-[#5C66AF]',
    success: 'bg-[linear-gradient(145deg,#E7F7F0,#F5FBF8)] text-emerald-600',
    warning: 'bg-[linear-gradient(145deg,#FDF3E2,#FFFAF2)] text-amber-600',
  }
  return (
    <div className="mb-[26px]">
      <span className={cn('grid h-[60px] w-[60px] place-items-center rounded-[18px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]', tones[tone])}>
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="mb-1.5 mt-5 text-[28px] font-semibold leading-snug text-[#1F2354]">{title}</h1>
      {subtitle && <p className="text-[13px] leading-relaxed text-[#5E658E]">{subtitle}</p>}
    </div>
  )
}

// ─── Inline banner (RTL-safe) ────────────────────────────────────────────────

const bannerStyles = {
  error: { cls: 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]', icon: AlertCircle, iconCls: 'text-[#ef4444]' },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-800', icon: TriangleAlert, iconCls: 'text-amber-500' },
  success: { cls: 'border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]', icon: CheckCircle2, iconCls: 'text-[#10b981]' },
  info: { cls: 'border-[#D6DAEE] bg-[#EEEFF8] text-[#1F2354]', icon: ShieldCheck, iconCls: 'text-[#5C66AF]' },
}

export function FormBanner({
  variant = 'error',
  title,
  children,
  action,
}: {
  variant?: keyof typeof bannerStyles
  title?: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  const { cls, icon: Icon, iconCls } = bannerStyles[variant]
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] animate-fade-in', cls)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconCls)} />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="font-medium leading-relaxed">{children}</div>}
        {action && <div className="pt-0.5">{action}</div>}
      </div>
    </div>
  )
}

// ─── Fields ──────────────────────────────────────────────────────────────────

function FieldShell({
  name,
  label,
  required,
  hint,
  children,
}: {
  name: string
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const { formState } = useFormContext()
  const error = formState.errors[name]?.message as string | undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] font-bold text-[#1F2354]">
        {label}
        {required && <i className="ms-1 not-italic text-[#d94b52]">*</i>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-[#d94b52]">{t(error)}</p>
      ) : (
        hint && <p className="text-xs text-[#5E658E]">{hint}</p>
      )}
    </div>
  )
}

type AuthFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> & {
  name: string
  label: string
  type?: 'text' | 'password' | 'email'
  hint?: string
}

export function AuthField({ name, label, required, type = 'text', hint, className, dir, ...props }: AuthFieldProps) {
  const { register, formState } = useFormContext()
  const [visible, setVisible] = React.useState(false)
  const isPassword = type === 'password'
  const hasError = !!formState.errors[name]

  return (
    <FieldShell name={name} label={label} required={required} hint={hint}>
      <div className="relative">
        <input
          id={name}
          type={isPassword && !visible ? 'password' : type === 'email' ? 'email' : 'text'}
          dir={dir}
          aria-invalid={hasError}
          className={cn(
            fieldBase,
            fieldState(hasError),
            'h-[52px] px-4',
            // LTR values (email, password) still align to the start of an RTL page
            dir === 'ltr' && 'rtl:text-right',
            isPassword && 'pe-11',
            className
          )}
          {...register(name)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 end-3.5 my-auto grid h-8 w-8 place-items-center rounded-lg text-[#9AA0C3] transition hover:text-[#5C66AF]"
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </FieldShell>
  )
}

export function AuthTextarea({
  name,
  label,
  required,
  hint,
  className,
  ...props
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> & { name: string; label: string; hint?: string }) {
  const { register, formState } = useFormContext()
  return (
    <FieldShell name={name} label={label} required={required} hint={hint}>
      <textarea
        id={name}
        rows={3}
        className={cn(fieldBase, fieldState(!!formState.errors[name]), 'resize-y px-4 py-3 leading-relaxed', className)}
        {...register(name)}
        {...props}
      />
    </FieldShell>
  )
}

/** Saudi mobile number with a fixed +966 prefix */
export function PhoneField({ name, label, required, autoFocus }: { name: string; label: string; required?: boolean; autoFocus?: boolean }) {
  const { register, formState } = useFormContext()
  const hasError = !!formState.errors[name]

  return (
    <FieldShell name={name} label={label} required={required}>
      <div
        dir="ltr"
        className={cn(
          'flex h-[52px] items-stretch overflow-hidden rounded-xl border bg-[#fbfdfe] transition-all focus-within:bg-white',
          hasError
            ? 'border-[#d94b52] focus-within:shadow-[0_0_0_3px_rgba(217,75,82,.12)]'
            : 'border-[rgba(31,35,84,.12)] hover:border-[rgba(92,102,175,.3)] focus-within:border-[#6F79BE] focus-within:shadow-[0_0_0_3px_rgba(92,102,175,.11)]'
        )}
      >
        <span className="flex select-none items-center border-e border-[rgba(31,35,84,.12)] bg-[#F4F5FB] px-3.5 text-sm font-bold tabular-nums text-[#5E658E]">
          +966
        </span>
        <input
          id={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="5X XXX XXXX"
          autoFocus={autoFocus}
          aria-invalid={hasError}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-sm font-medium tracking-wide text-[#1F2354] outline-none placeholder:text-[#9AA0C3]"
          {...register(name)}
        />
      </div>
    </FieldShell>
  )
}

export function AuthCheckbox({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext()
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-[#5E658E]">
      <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-[#5C66AF]" {...register(name)} />
      {label}
    </label>
  )
}

// ─── Password strength meter ─────────────────────────────────────────────────

export function PasswordStrength({ value }: { value: string }) {
  const { t } = useTranslation()
  const passed = passwordRules.filter((r) => r.test(value)).length
  const levels = [
    { label: 'auth.password.weak', color: 'bg-[#d94b52]' },
    { label: 'auth.password.weak', color: 'bg-[#d94b52]' },
    { label: 'auth.password.fair', color: 'bg-amber-500' },
    { label: 'auth.password.good', color: 'bg-[#6F79BE]' },
    { label: 'auth.password.strong', color: 'bg-emerald-500' },
  ]
  const level = levels[passed]

  if (!value) return null

  return (
    <div className="-mt-1 space-y-2.5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {passwordRules.map((_, i) => (
            <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300', i < passed ? level.color : 'bg-[#EEEFF8]')} />
          ))}
        </div>
        <span className="text-xs font-bold text-[#5E658E]">{t(level.label)}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {passwordRules.map((rule) => {
          const ok = rule.test(value)
          return (
            <li key={rule.key} className={cn('flex items-center gap-1.5 text-xs transition-colors', ok ? 'text-emerald-600' : 'text-[#9AA0C3]')}>
              <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full', ok ? 'bg-emerald-500 text-white' : 'bg-[#EEEFF8]')}>
                {ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              {t(rule.key)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

/** Arrow pointing "forward" in the current reading direction */
export function useForwardArrow() {
  const { i18n } = useTranslation()
  return i18n.language === 'ar' ? ArrowLeft : ArrowRight
}

export function SubmitButton({
  loading,
  arrow = true,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; arrow?: boolean }) {
  const Forward = useForwardArrow()
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[linear-gradient(90deg,#5C66AF,#1F2354)] text-[15px] font-bold text-white shadow-[0_12px_25px_rgba(92,102,175,.28)] transition-all hover:-translate-y-px hover:shadow-[0_16px_32px_rgba(92,102,175,.36)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_12px_25px_rgba(92,102,175,.28)]',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <>
          {children}
          {arrow && <Forward className="h-5 w-5" />}
        </>
      )}
    </button>
  )
}

export function SecondaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] border border-[#D8DAEB] bg-white px-5 text-[15px] font-bold text-[#1F2354] transition hover:border-[#6F79BE] hover:bg-[#F7F8FD]',
        className
      )}
      {...props}
    />
  )
}

export function AuthSwitch({ children }: { children: React.ReactNode }) {
  return <p className="mt-[22px] text-center text-[13px] text-[#5E658E]">{children}</p>
}
