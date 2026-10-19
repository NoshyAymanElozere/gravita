import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/utils'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface BaseDropdownProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuContent> {
  title: string
  children: React.ReactNode
  collapsed?: boolean
}

export function BaseDropdown({
  title,
  children,
  collapsed = false,
  className,
  ...props
}: BaseDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const isSettingsPage = location.pathname.startsWith('/settings')
  
  // Accordion state
  const [isAccordionOpen, setIsAccordionOpen] = React.useState(() => isSettingsPage)

  React.useEffect(() => {
    if (isSettingsPage) {
      setIsAccordionOpen(true)
    }
  }, [isSettingsPage])

  if (collapsed) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'group flex h-10 w-full items-center justify-center rounded-xl transition-all duration-200 relative',
              'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100',
              isSettingsPage && 'bg-main/10 text-main dark:text-main'
            )}
          >
            {isSettingsPage && (
              <span className={cn(
                "absolute top-2 bottom-2 w-1 rounded-full bg-main dark:bg-main",
                isRtl ? "right-0 rounded-l-full" : "left-0 rounded-r-full"
              )} />
            )}
            <Settings className={cn('h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105', isSettingsPage ? 'text-main dark:text-main' : 'text-gray-400 dark:text-zinc-500')} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={className} {...props}>
          {title && (
            <>
              <DropdownMenuLabel>{title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {React.Children.map(children, (child) => {
            if (!child) return null
            return (
              <DropdownMenuItem asChild onClick={() => setOpen(false)}>
                {child}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Expanded state: Inline collapsible accordion
  return (
    <li className="space-y-1 list-none">
      <button
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        className={cn(
          'group flex h-10 w-full items-center gap-3.5 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200 relative text-left',
          'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100',
          isSettingsPage && 'bg-main/5 text-main dark:text-main'
        )}
      >
        {isSettingsPage && (
          <span className={cn(
            "absolute top-2 bottom-2 w-1 rounded-full bg-main dark:bg-main",
            isRtl ? "right-0 rounded-l-full" : "left-0 rounded-r-full"
          )} />
        )}
        <Settings className={cn('h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105', isSettingsPage ? 'text-main dark:text-main' : 'text-gray-400 dark:text-zinc-500')} />
        <span className="flex-1 truncate">{title}</span>
        {isAccordionOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {isAccordionOpen && (
        <ul className={cn("space-y-1 mt-1 border-l border-gray-100 dark:border-zinc-800 ml-6 pl-3", isRtl && "border-l-0 border-r mr-6 pr-3 ml-0 pl-0")}>
          {React.Children.map(children, (child) => {
            if (!child) return null
            return (
              <li>
                {child}
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
