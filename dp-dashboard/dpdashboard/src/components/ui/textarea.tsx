import * as React from 'react'
import { cn } from '@/utils/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }
>(({ className, error, ...props }, ref) => (
  <div className="relative w-full">
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:bg-gray-100/80 disabled:border-gray-200/80 disabled:text-gray-600 disabled:opacity-95 disabled:shadow-none resize-y',
        props.readOnly && 'bg-gray-50/50 border-gray-200/50 text-gray-700 cursor-default focus:ring-0 focus:border-gray-200/50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      ref={ref}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

export { Textarea }
