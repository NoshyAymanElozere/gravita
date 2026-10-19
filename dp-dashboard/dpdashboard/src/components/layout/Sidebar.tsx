import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Boxes,
  Users,
  TicketPercent,
  Star,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shared/misc'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/utils/utils'
import { STOREFRONT_ORIGIN } from '@/utils/media'
import { useOrderAlerts } from '@/features/dashboard/api/useStats'

type NavItemDef = { label: string; href: string; icon: React.ElementType; badge?: number }

interface SidebarProps {
  collapsed: boolean
  onCollapse: (v: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const { data: alerts } = useOrderAlerts()

  const groups: { title: string; items: NavItemDef[] }[] = [
    {
      title: 'nav.groupMain',
      items: [
        { label: 'nav.overview', href: '/', icon: LayoutDashboard },
        { label: 'nav.orders', href: '/orders', icon: ShoppingBag, badge: alerts?.attention || undefined },
      ],
    },
    {
      title: 'nav.groupCatalog',
      items: [
        { label: 'nav.products', href: '/products', icon: Package },
        { label: 'nav.categories', href: '/categories', icon: FolderTree },
        { label: 'nav.bundles', href: '/bundles', icon: Boxes },
      ],
    },
    {
      title: 'nav.groupCustomers',
      items: [
        { label: 'nav.customers', href: '/customers', icon: Users },
        { label: 'nav.coupons', href: '/coupons', icon: TicketPercent },
        { label: 'nav.reviews', href: '/reviews', icon: Star },
        { label: 'nav.newsletter', href: '/newsletter', icon: Mail },
      ],
    },
  ]

  const CollapseIcon = collapsed ? (isRtl ? ChevronLeft : ChevronRight) : isRtl ? ChevronRight : ChevronLeft

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-e border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <Logo collapsed={collapsed} size="sm" />
      </div>

      <button
        onClick={() => onCollapse(!collapsed)}
        className={cn(
          'absolute top-12 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent md:flex',
          isRtl ? '-left-3' : '-right-3'
        )}
        aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
      >
        <CollapseIcon className="h-3 w-3 text-muted-foreground" />
      </button>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {t(group.title)}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <a
          href={STOREFRONT_ORIGIN}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            collapsed && 'justify-center px-0'
          )}
          title={t('nav.viewStore')}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{t('nav.viewStore')}</span>}
        </a>
      </div>
    </aside>
  )
}

function NavItem({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
  const Icon = item.icon
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const label = t(item.label)

  const link = (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-zinc-600 hover:bg-accent hover:text-foreground dark:text-zinc-400'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-[18px] w-[18px] shrink-0', !isActive && 'text-muted-foreground group-hover:text-foreground')} />
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {!!item.badge && (
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                isActive ? 'bg-primary-foreground text-primary' : 'bg-amber-500 text-white',
                collapsed && 'absolute -top-1 end-0 h-4 min-w-4 px-1'
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <li>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side={isRtl ? 'left' : 'right'} className="text-xs font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      </li>
    )
  }
  return <li>{link}</li>
}
