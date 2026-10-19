import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TooltipProvider } from '@/components/shared/misc'
import { cn } from '@/utils/utils'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { i18n } = useTranslation()
  useTheme() // Invoked to sync the html class and data-attributes on mount/update

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <TooltipProvider>
      <div
        className="flex h-screen overflow-hidden bg-[#eeeff8] dark:bg-[#0b1120]"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Mobile Backdrop overlay */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar container (statically positioned on desktop, sliding drawer on mobile) */}
        <div
          className={cn(
            "fixed inset-y-0 z-50 md:relative md:flex h-full shrink-0 transition-transform duration-300 md:translate-x-0",
            i18n.language === 'ar' ? "right-0" : "left-0",
            mobileOpen ? "translate-x-0" : (i18n.language === 'ar' ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0")
          )}
        >
          <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden w-full bg-[#eeeff8] dark:bg-[#0b1120]">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-[#eeeff8] dark:bg-[#0b1120]">
            <div className="p-4 md:p-6 animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
