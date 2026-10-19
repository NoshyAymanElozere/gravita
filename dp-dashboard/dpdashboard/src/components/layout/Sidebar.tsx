import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shared/misc'
import { cn } from '@/utils/utils'
import { Logo } from '@/components/shared/Logo'
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  FileSignature
} from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { useProfile } from '@/features/auth/api/useAuth'

// Only modules wired to the real API belong here
const navItems: { label: string; href: string; icon: React.ElementType; badge?: number }[] = [
  { label: 'vehicleRequests', href: '/vehicle-requests', icon: Inbox },
  { label: 'vehicleOffers', href: '/vehicle-offers', icon: FileSignature },
]



interface SidebarProps {
  collapsed: boolean
  onCollapse: (v: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const { data: admin } = useProfile()
  const adminName = admin?.name || 'Admin User'
  const initials = adminName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-[#ffffff] dark:bg-[#090f1d] border-r border-gray-100 dark:border-zinc-800/80 shadow-xs transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-gray-50 dark:border-zinc-800/40 px-4 overflow-hidden">
        <Logo collapsed={collapsed} size="md" />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className={cn(
          'absolute top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full',
          isRtl ? '-left-3' : '-right-3',
          'border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-md hover:bg-gray-50 dark:hover:bg-zinc-750 transition-colors'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          isRtl ? <ChevronLeft className="h-3 w-3 text-gray-500 dark:text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        ) : (
          isRtl ? <ChevronRight className="h-3 w-3 text-gray-500 dark:text-gray-400" /> : <ChevronLeft className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {!collapsed && (
          <p className="px-5 mb-2 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            {t('menu')}
          </p>
        )}
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 dark:border-zinc-800/80 p-3 bg-gray-50/50 dark:bg-zinc-800/10">
        <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-main/25 to-main/10 text-main text-sm font-bold border border-main/10 shadow-xs">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">{adminName}</p>
              <p className="truncate text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  item: { label: string; href: string; icon: React.ElementType; badge?: number }
  collapsed: boolean
}

function NavItem({ item, collapsed }: NavItemProps) {
  const Icon = item.icon
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const translatedLabel = t(item.label) !== item.label ? t(item.label) : t(item.label.toLowerCase())

  const navLink = (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) =>
        cn(
          'group flex h-10 items-center gap-3.5 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200 relative',
          'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100',
          isActive && 'bg-main/10 dark:bg-main/20 text-main dark:text-main'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className={cn(
              "absolute top-2 bottom-2 w-1 rounded-full bg-main dark:bg-main",
              isRtl ? "right-0 rounded-l-full" : "left-0 rounded-r-full"
            )} />
          )}
          <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105', isActive ? 'text-main dark:text-main' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300')} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{translatedLabel}</span>
              {item.badge && (
                <Badge className="h-5 min-w-5 px-1 text-[10px] bg-main dark:bg-main text-white font-bold rounded-lg border-none flex items-center justify-center">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <li>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{navLink}</TooltipTrigger>
          <TooltipContent side={isRtl ? "left" : "right"} className="font-semibold text-xs dark:bg-zinc-800 dark:text-zinc-100">{translatedLabel}</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return <li>{navLink}</li>

}


