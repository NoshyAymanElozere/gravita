import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check, Hourglass } from 'lucide-react'
import { cn } from '@/utils/utils'
import { AuthCard, AuthPageHeader } from '../components/AuthUI'

const TIMELINE = ['registered', 'verified', 'review', 'active'] as const
const CURRENT = 2 // admin review

export default function PendingApproval() {
  const { t } = useTranslation()
  const justVerified = !!(useLocation().state as { verified?: boolean } | null)?.verified

  return (
    <AuthCard>
      <AuthPageHeader
        icon={Hourglass}
        tone="warning"
        title={t(justVerified ? 'auth.pending.verifiedTitle' : 'auth.pending.title')}
        subtitle={t('auth.pending.subtitle')}
      />

      <ol className="relative space-y-0">
        {TIMELINE.map((key, i) => {
          const done = i < CURRENT
          const current = i === CURRENT
          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {i < TIMELINE.length - 1 && (
                <span
                  aria-hidden
                  className={cn('absolute start-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full', done ? 'bg-emerald-500' : 'bg-[#EEEFF8]')}
                />
              )}
              <span
                className={cn(
                  'relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2',
                  done && 'border-emerald-500 bg-emerald-500 text-white',
                  current && 'border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950/40',
                  !done && !current && 'border-[#D8DAEB] bg-white text-[#C9CDE6]'
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : current ? (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </span>
              <div className="pt-1">
                <p className={cn('text-sm font-semibold', done || current ? 'text-[#1F2354]' : 'text-[#9AA0C3]')}>
                  {t(`auth.pending.steps.${key}.title`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#5E658E]">{t(`auth.pending.steps.${key}.desc`)}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>

      <div className="mt-7 rounded-xl border border-[#D6DAEE] bg-[#EEEFF8] px-4 py-3 text-[13px] leading-relaxed text-[#1F2354]">
        {t('auth.pending.note')}
      </div>

      <Link
        to="/login"
        className="mt-[22px] flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#5C66AF,#1F2354)] text-[15px] font-bold text-white shadow-[0_12px_25px_rgba(92,102,175,.28)] transition-all hover:-translate-y-px"
      >
        {t('auth.backToLogin')}
      </Link>
    </AuthCard>
  )
}
