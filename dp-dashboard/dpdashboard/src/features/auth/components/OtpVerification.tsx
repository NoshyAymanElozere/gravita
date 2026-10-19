import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { useTranslation } from 'react-i18next'
import { motion, useAnimationControls } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { cn } from '@/utils/utils'
import { FormBanner, SubmitButton } from './AuthUI'

const OTP_LENGTH = 4
const RESEND_COOLDOWN = 60

/** `+966500114567` → `***4567`; emails are shown as typed */
function maskDestination(value: string) {
  return value.includes('@') ? value : `***${value.slice(-4)}`
}

interface OtpVerificationProps {
  /** Phone or email the code was sent to */
  destination: string
  onVerify: (code: string) => void
  onResend: () => Promise<unknown>
  isVerifying: boolean
  isResending: boolean
  submitLabel: string
  /** Server error for the last attempt — clears the code and shakes the input */
  error?: string | null
}

export function OtpVerification({
  destination,
  onVerify,
  onResend,
  isVerifying,
  isResending,
  submitLabel,
  error,
}: OtpVerificationProps) {
  const { t } = useTranslation()
  const [code, setCode] = React.useState('')
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN)
  const [resent, setResent] = React.useState(false)
  const controls = useAnimationControls()
  const isPhone = !destination.includes('@')

  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  React.useEffect(() => {
    if (!error) return
    setCode('')
    controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } })
  }, [error, controls])

  const submit = (value = code) => {
    if (value.length === OTP_LENGTH && !isVerifying) onVerify(value)
  }

  const handleResend = async () => {
    setResent(false)
    try {
      await onResend()
      setCode('')
      setCooldown(RESEND_COOLDOWN)
      setResent(true)
    } catch {
      // Error surfaced by the parent via `error`
    }
  }

  const ss = String(cooldown % 60).padStart(2, '0')
  const mm = String(Math.floor(cooldown / 60)).padStart(2, '0')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="space-y-4">
        <FormBanner variant="info">
          {t(isPhone ? 'auth.otp.sentToPhone' : 'auth.otp.sentToEmail')}{' '}
          <b dir="ltr" className="font-bold">
            {maskDestination(destination)}
          </b>
        </FormBanner>

        {error && <FormBanner variant="error">{error}</FormBanner>}
        {resent && !error && <FormBanner variant="success">{t('auth.otp.resent')}</FormBanner>}

        <motion.div animate={controls} dir="ltr" className="flex justify-center pt-1">
          <OTPInput
            maxLength={OTP_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={submit}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            disabled={isVerifying}
            aria-label={t('auth.otp.codeLabel')}
            containerClassName="flex items-center gap-[11px] has-[:disabled]:opacity-60"
            render={({ slots }) => (
              <>
                {slots.map((slot, i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative grid h-[66px] w-[62px] place-items-center rounded-[15px] border bg-[#f7fbfc] text-[25px] font-bold text-[#1F2354] transition-all duration-150',
                      slot.isActive
                        ? 'border-[#6F79BE] bg-white shadow-[0_0_0_3px_rgba(92,102,175,.11)]'
                        : 'border-[rgba(31,35,84,.12)]',
                      error && !slot.char && !slot.isActive && 'border-[#f3b4b7]'
                    )}
                  >
                    {slot.char}
                    {slot.hasFakeCaret && (
                      <span className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="h-7 w-0.5 animate-pulse rounded-full bg-[#5C66AF]" />
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}
          />
        </motion.div>
      </div>

      <div className="my-[18px] text-center text-xs text-[#5E658E]">
        {cooldown > 0 ? (
          <>
            {t('auth.otp.resendIn')}{' '}
            <b dir="ltr" className="font-bold tabular-nums text-[#5C66AF]">
              {mm}:{ss}
            </b>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            {t('auth.otp.noCode')}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1 font-bold text-[#5C66AF] underline-offset-4 transition hover:text-[#1F2354] hover:underline disabled:opacity-60"
            >
              <RotateCw className={cn('h-3.5 w-3.5', isResending && 'animate-spin')} />
              {t('auth.otp.resend')}
            </button>
          </span>
        )}
      </div>

      <SubmitButton loading={isVerifying} disabled={code.length !== OTP_LENGTH}>
        {submitLabel}
      </SubmitButton>
    </form>
  )
}
