import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarChart3, Globe, PackageCheck, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export function AuthLayout() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const isRtl = i18n.language === 'ar'

  const toggleLanguage = () => {
    const next = isRtl ? 'en' : 'ar'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  const features = [
    { icon: PackageCheck, label: t('auth.layout.featureCatalog') },
    { icon: BarChart3, label: t('auth.layout.featureInsights') },
    { icon: ShieldCheck, label: t('auth.layout.featureSecure') },
  ]

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-white text-zinc-900 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* Brand panel */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-hidden bg-[#374037] px-14 py-12 text-[#F4F2E4] lg:flex">
        <span aria-hidden className="pointer-events-none absolute inset-5 rounded-[28px] border border-white/10" />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-44 -end-24 h-[420px] w-[420px] rounded-full border border-[#BAD1B8]/20"
          style={{ boxShadow: '0 0 0 45px rgba(186,209,184,.05), 0 0 0 90px rgba(186,209,184,.03)' }}
        />
        <div className="relative w-fit rounded-2xl bg-white/95 px-4 py-2">
          <Logo size="md" />
        </div>
        <div className="relative my-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#BAD1B8]">{t('auth.layout.eyebrow')}</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">{t('auth.layout.headline')}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#F4F2E4]/75">{t('auth.layout.subheadline')}</p>
          <ul className="mt-8 space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#BAD1B8]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <small className="relative text-xs text-[#F4F2E4]/50">© {new Date().getFullYear()} AURA Laboratories</small>
      </aside>

      {/* Form panel */}
      <main className="relative grid min-h-screen place-items-center bg-[linear-gradient(160deg,#FAFAF7,#FFFFFF_55%,#F4F2E4)] px-4 pb-8 pt-20 sm:px-10 lg:p-16">
        <div className="absolute inset-x-5 top-6 flex items-center justify-between gap-4 sm:inset-x-10">
          <span className="lg:hidden">
            <Logo size="sm" />
          </span>
          <button
            type="button"
            onClick={toggleLanguage}
            className="ms-auto inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 text-xs font-semibold text-zinc-600 backdrop-blur transition hover:border-[#748972] hover:text-[#374037]"
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
