import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/utils/utils'

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-destructive/50 text-destructive bg-destructive/10 dark:border-destructive [&>svg]:text-destructive',
        success: 'border-emerald-500/50 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 [&>svg]:text-emerald-500',
        warning: 'border-amber-500/50 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 [&>svg]:text-amber-500',
        info: 'border-blue-500/50 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 [&>svg]:text-blue-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = alertIcons[variant ?? 'default']
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
