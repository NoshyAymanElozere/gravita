import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, getInitials } from '@/utils/utils'

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'h-7 w-7 text-xs',
      md: 'h-9 w-9 text-sm',
      lg: 'h-11 w-11 text-base',
      xl: 'h-14 w-14 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
})

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  name?: string
}

function Avatar({ className, size, src, alt, fallback, name, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn(avatarVariants({ size }), className)} {...props}>
      <AvatarPrimitive.Image src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full font-semibold',
          'bg-primary/10 text-primary'
        )}
      >
        {name ? getInitials(name) : (fallback ?? '?')}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

// ─── Avatar Group ─────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  users: Array<{ name: string; src?: string }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const rest = users.length - max
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar
          key={i}
          size={size}
          src={u.src}
          name={u.name}
          className="ring-2 ring-background"
        />
      ))}
      {rest > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'ring-2 ring-background bg-muted text-muted-foreground flex items-center justify-center font-medium'
          )}
        >
          +{rest}
        </div>
      )}
    </div>
  )
}

// ─── Progress ─────────────────────────────────────────────────────────────────

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showLabel?: boolean
  color?: 'default' | 'success' | 'warning' | 'destructive'
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, showLabel, color = 'default', ...props }, ref) => {
    const colorClass = {
      default: 'bg-primary',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      destructive: 'bg-destructive',
    }[color]

    return (
      <div className="flex items-center gap-2 w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn('h-full w-full flex-1 transition-all duration-300', colorClass)}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showLabel && (
          <span className="shrink-0 text-xs font-medium text-muted-foreground w-8 text-right">
            {value ?? 0}%
          </span>
        )}
      </div>
    )
  }
)
Progress.displayName = ProgressPrimitive.Root.displayName

// ─── Separator ────────────────────────────────────────────────────────────────

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    )}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Avatar,
  AvatarGroup,
  Progress,
  Separator,
  Skeleton,
}
