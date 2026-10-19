import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Sun, Moon, ChevronDown, LogOut, User, Menu, Globe, PackageX, Undo2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { useProfile, useLogout } from '@/features/auth/api/useAuth'
import { useOrderAlerts } from '@/features/dashboard/api/useStats'
import { getInitials } from '@/utils/utils'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const { data: admin } = useProfile()
  const logout = useLogout()
  const { data: alerts } = useOrderAlerts()

  const isRtl = i18n.language === 'ar'
  const isDark = theme === 'dark' || (theme === 'system' && document.documentElement.classList.contains('dark'))

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('lang', nextLang)
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = nextLang
  }

  const name = admin?.name || t('common.admin')
  const notifications = [
    { key: 'pending', count: alerts?.pending ?? 0, icon: Clock, to: '/orders?status=pending', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' },
    {
      key: 'return_requested',
      count: alerts?.returnRequested ?? 0,
      icon: Undo2,
      to: '/orders?status=return_requested',
      cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10',
    },
    { key: 'lowStock', count: alerts?.lowStock ?? 0, icon: PackageX, to: '/products?stock=low', cls: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10' },
  ].filter((n) => n.count > 0)
  const totalAlerts = notifications.reduce((s, n) => s + n.count, 0)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden" aria-label={t('nav.menu')}>
          <Menu className="h-5 w-5" />
        </Button>
        <p className="hidden text-sm text-muted-foreground sm:block">
          {t('header.welcome')}, <span className="font-semibold text-foreground">{name}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={isRtl ? 'English' : 'العربية'}
        >
          <Globe className="h-4 w-4" />
          <span>{isRtl ? 'EN' : 'ع'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={isDark ? t('header.lightMode') : t('header.darkMode')}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t('header.notifications')}
            >
              <Bell className="h-[18px] w-[18px]" />
              {totalAlerts > 0 && (
                <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                  {totalAlerts > 99 ? '99+' : totalAlerts}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-80 rounded-2xl p-2">
            <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('header.notifications')}
            </p>
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t('header.allClear')}</p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.key} onClick={() => navigate(n.to)} className="cursor-pointer gap-3 rounded-xl p-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.cls}`}>
                    <n.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{t(`header.alert.${n.key}`, { count: n.count })}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 outline-none transition-colors hover:bg-accent">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-xs font-bold text-brand-primary">
                {getInitials(name) || 'A'}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-64 rounded-2xl p-2">
            <div className="mb-1 rounded-xl bg-muted/60 p-3">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {admin?.email}
              </p>
            </div>
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2.5 rounded-xl p-2.5">
              <User className="h-4 w-4" />
              {t('nav.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2.5 rounded-xl p-2.5 text-rose-600 focus:text-rose-600">
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
