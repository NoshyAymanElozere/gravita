import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TooltipProvider } from '@/components/shared/misc'
import { cn } from '@/utils/utils'
import { useTheme } from '@/hooks/useTheme'

const COLLAPSE_KEY = 'aura-sidebar-collapsed'

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const { i18n } = useTranslation()
  const { pathname } = useLocation()
  const isRtl = i18n.language === 'ar'
  useTheme() // syncs the html class with the stored theme

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language, isRtl])

  // Close the mobile drawer after navigating
  useEffect(() => setMobileOpen(false), [pathname])

  const onCollapse = (v: boolean) => {
    setSidebarCollapsed(v)
    try {
      localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
    } catch {
      // ignore
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-page" dir={isRtl ? 'rtl' : 'ltr'}>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <div
          className={cn(
            'fixed inset-y-0 z-50 h-full shrink-0 transition-transform duration-300 md:relative md:flex md:translate-x-0',
            isRtl ? 'right-0' : 'left-0',
            mobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
          )}
        >
          <Sidebar collapsed={sidebarCollapsed && !mobileOpen} onCollapse={onCollapse} />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
