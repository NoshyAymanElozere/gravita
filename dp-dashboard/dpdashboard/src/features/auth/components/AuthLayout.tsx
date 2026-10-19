import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BadgeCheck, Globe, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

const SITE_URL: string | undefined = import.meta.env.VITE_SITE_URL

const panelBackground = [
  'radial-gradient(circle at 18% 20%, rgba(92,102,175,.3), transparent 28%)',
  'linear-gradient(150deg, rgba(31,35,84,.98), rgba(41,46,107,.95))',
  `url('${import.meta.env.BASE_URL}auth/hero-saudi-family.webp') center/cover`,
].join(', ')

export function AuthLayout() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const isRtl = i18n.language === 'ar'
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  const toggleLanguage = () => {
    const next = isRtl ? 'en' : 'ar'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[linear-gradient(130deg,#F7F8FD,#FFFFFF_58%,#EEEFF8)] text-[#1F2354] lg:grid lg:grid-cols-[0.82fr_1.18fr]"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-screen flex-col overflow-hidden px-[60px] py-11 text-white lg:flex"
        style={{ background: panelBackground }}
      >
        {/* Inset frame + concentric ring decoration */}
        <span aria-hidden className="pointer-events-none absolute inset-[18px] rounded-[28px] border border-white/[0.12]" />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[170px] -right-[90px] h-[420px] w-[420px] rounded-full border border-white/[0.16]"
          style={{ boxShadow: '0 0 0 45px rgba(255,255,255,.035), 0 0 0 90px rgba(255,255,255,.025)' }}
        />

        <div className="relative">
          <Logo size="md" variant="white" />
        </div>

        <div className="relative my-auto">
          <span className="grid h-[82px] w-[72px] place-items-center rounded-[22px_22px_32px_32px] bg-white/95 text-[#1F2354] shadow-[0_18px_40px_rgba(31,35,84,.15)]">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h2 className="mt-6 text-[38px] font-semibold leading-[1.4]">
            {t('auth.layout.headline')}
            <br />
            {t('auth.layout.headlineWith')} <em className="not-italic text-[#7BE0DB]">{t('auth.layout.brand')}</em>
          </h2>
          <p className="mt-3 max-w-[460px] text-[15px] leading-[1.9] opacity-75">{t('auth.layout.subheadline')}</p>
          <div className="mt-6 flex flex-wrap gap-[18px] text-[13px]">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-5 w-5" /> {t('auth.layout.certified')}
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="h-5 w-5" /> {t('auth.layout.privacy')}
            </span>
          </div>
        </div>

        <small className="relative text-[13px] opacity-55">{t('auth.layout.tagline')}</small>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <main className="relative grid min-h-screen place-items-center px-[15px] pb-[30px] pt-20 sm:px-10 lg:p-[70px]">
        <div className="absolute inset-x-5 top-6 flex items-center justify-between gap-4 sm:inset-x-10 lg:top-[35px]">
          {SITE_URL ? (
            <a href={SITE_URL} className="flex items-center gap-[7px] text-[13px] text-[#5E658E] transition hover:text-[#1F2354]">
              <BackIcon className="h-[18px] w-[18px]" />
              {t('auth.layout.backHome')}
            </a>
          ) : (
            <span className="lg:hidden">
              <Logo size="sm" />
            </span>
          )}
          <button
            type="button"
            onClick={toggleLanguage}
            className="ms-auto inline-flex h-9 items-center gap-2 rounded-full border border-[#D8DAEB] bg-white/80 px-3.5 text-xs font-semibold text-[#5E658E] backdrop-blur transition hover:border-[#6F79BE] hover:text-[#1F2354]"
          >
            <Globe className="h-3.5 w-3.5" />
            {isRtl ? 'English' : 'العربية'}
          </button>
        </div>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full justify-center"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
