import * as React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/utils'

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ElementType
  actions?: React.ReactNode
  backTo?: string
  className?: string
}

/** Consistent page title row with optional back link and action buttons */
export function PageHeader({ title, description, icon: Icon, actions, backTo, className }: PageHeaderProps) {
  const { i18n } = useTranslation()
  const Back = i18n.language === 'ar' ? ArrowRight : ArrowLeft
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex min-w-0 items-center gap-3.5">
        {backTo && (
          <Link
            to={backTo}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Back className="h-4 w-4" />
          </Link>
        )}
        {Icon && !backTo && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-cream text-brand-primary dark:bg-accent dark:text-accent-foreground">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** White card wrapper for filters / toolbars above a table */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs sm:flex-row sm:flex-wrap sm:items-center', className)}>
      {children}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-sage dark:bg-accent">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Section card with a title row (used on detail and form pages) */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card shadow-xs', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
