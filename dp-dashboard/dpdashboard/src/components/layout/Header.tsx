import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Sun, Moon, ChevronDown,
  LogOut, User, Menu, Globe, Trash2, CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { useProfile, useLogout } from '@/features/auth/api/useAuth'

const mockNotifications = [
  { id: 1, title: 'تم إصدار وثيقة تأمين جديدة', titleEn: 'New insurance policy issued', subtitle: 'تم إصدار وثيقة جديدة للباقة الشاملة برقم POL-2026-9812', subtitleEn: 'Comprehensive policy issued #POL-2026-9812', read: false },
  { id: 2, title: 'مطالبة تعويض جديدة بحاجة لمعالجة', titleEn: 'New claim pending review', subtitle: 'تم تقديم مطالبة حادث جديدة برقم CLM-2026-3301', subtitleEn: 'New accident claim submitted #CLM-2026-3301', read: false },
  { id: 3, title: 'تسوية مالية مودعة', titleEn: 'Settlement deposited', subtitle: 'تم إيداع صافي مستحقات دورة سبتمبر في حساب الشركة', subtitleEn: 'September cycle net payout deposited to company account', read: true },
  { id: 4, title: 'انضمام موظف جديد للفريق', titleEn: 'New team member joined', subtitle: 'تم إنشاء حساب أخصائي مطالبات جديد بنجاح', subtitleEn: 'Claims specialist account created successfully', read: true },
]

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const { data: admin } = useProfile()
  const { mutate: logout } = useLogout()
  const [notifications, setNotifications] = useState(mockNotifications)

  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('lang', nextLang)
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = nextLang
  }

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleDeleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications([])
  }

  const adminName = admin?.name || (isRtl ? 'مدير شركة التأمين' : 'Company Admin')
  const adminEmail = admin?.email || 'admin@company.com.sa'

  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CA'

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-[#090f1d] px-6 shadow-2xs">
      {/* Side 1: Mobile Hamburger Menu */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Side 2: PlanGo Header Controls */}
      <div className="flex items-center gap-3">
        {/* 1. Language Toggle Button */}
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="h-9 px-3 rounded-xl bg-primary/10 dark:bg-zinc-800 text-primary dark:text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition-all hover:bg-primary/20 cursor-pointer shadow-2xs"
          title={isRtl ? 'تغيير إلى English' : 'Switch to العربية'}
        >
          <span>{i18n.language === 'ar' ? 'AR' : 'EN'}</span>
          <Globe className="h-4 w-4" />
        </button>

        {/* 2. Dark/Light Theme Button */}
        <button
          type="button"
          onClick={handleThemeToggle}
          className="h-9 w-9 rounded-xl bg-primary/10 dark:bg-zinc-800 text-primary dark:text-amber-400 flex items-center justify-center transition-all hover:bg-primary/20 cursor-pointer shadow-2xs"
          title={theme === 'dark' ? (isRtl ? 'الوضع الفاتح' : 'Light Mode') : (isRtl ? 'الوضع الداكن' : 'Dark Mode')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* 3. Notifications Bell with Badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer outline-none">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 left-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align={isRtl ? 'start' : 'end'}
            className="w-84 md:w-96 p-4 rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: Title & Delete All */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-rose-500 hover:underline cursor-pointer" onClick={handleClearAll}>
                {isRtl ? 'حذف الكل' : 'Clear All'}
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                {isRtl ? 'الإشعارات الواردة' : 'Notifications'}
              </h3>
            </div>

            {/* Notification Items */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800/50 my-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {isRtl ? 'لا توجد إشعارات جديدة حالياً' : 'No new notifications'}
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 rounded-xl px-2 transition-all"
                  >
                    {/* Actions: Trash & Check */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                          title={isRtl ? 'تحديد كمقروء' : 'Mark as read'}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Content & Status Dot */}
                    <div className={`flex items-start gap-2.5 flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                          {isRtl ? n.title : n.titleEn}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {isRtl ? n.subtitle : n.subtitleEn}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 text-center">
              <span
                onClick={() => navigate('/claims')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer block py-1"
              >
                {isRtl ? 'الذهاب للوحة الإشعارات' : 'View all notifications'}
              </span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer outline-none">
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shadow-2xs overflow-hidden">
                {admin?.logo_url ? <img src={admin.logo_url} alt="" className="h-full w-full object-contain bg-white" /> : initials}
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-800 dark:text-zinc-200">
                {adminName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align={isRtl ? 'start' : 'end'}
            className="w-64 p-3 rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* User Info Header Box */}
            <div className={`bg-gray-50/80 dark:bg-zinc-800/70 p-3 rounded-xl flex items-center justify-between gap-3 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                {admin?.logo_url ? <img src={admin.logo_url} alt="" className="h-full w-full object-contain bg-white" /> : initials}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                  {adminName}
                </p>
                <p className="text-[11px] text-gray-400 font-normal truncate mt-0.5">
                  {adminEmail}
                </p>
              </div>
            </div>

            {/* Profile Action */}
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all text-xs font-bold text-gray-700 dark:text-zinc-200"
            >
              <span>{isRtl ? 'الملف الشخصي' : 'Profile'}</span>
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </DropdownMenuItem>

            {/* Logout Action */}
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-all text-xs font-bold text-rose-500 mt-1"
            >
              <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
              <div className="h-7 w-7 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
