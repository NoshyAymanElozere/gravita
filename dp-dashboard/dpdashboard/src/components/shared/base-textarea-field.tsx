import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'

export interface BaseTextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  name: string
  customError?: string
}

export const BaseTextAreaField = React.forwardRef<HTMLTextAreaElement, BaseTextAreaFieldProps>(
  ({ label, name, placeholder, className, customError, rows = 3, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement>(null)
    const { t } = useTranslation()

    // Retrieve react-hook-form context
    const formContext = useFormContext()

    // Register if form context exists, otherwise fallback
    const registerProps = formContext ? formContext.register(name) : {}
    const { errors } = formContext?.formState || { errors: {} }
    const rawError = customError || (errors[name]?.message as string | undefined)
    const error = rawError ? t(rawError) : undefined

    // Combine forwarded ref and local ref
    React.useImperativeHandle(ref, () => localRef.current as HTMLTextAreaElement)

    const isRtl = document.documentElement.dir === 'rtl'

    return (
      <div className={cn('w-full space-y-1.5', isRtl ? 'text-right' : 'text-left')}>
        {label && (
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={localRef}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-main focus:border-main transition-all resize-y',
              error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
              props.disabled && 'bg-gray-100/80 border-gray-200/80 text-gray-600 opacity-95 cursor-not-allowed select-none shadow-none focus:ring-0 focus:border-gray-200/80',
              props.readOnly && 'bg-gray-50/30 border-gray-200/40 text-gray-700 cursor-default focus:ring-0 focus:border-gray-200/40',
              className
            )}
            {...registerProps}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        )}
      </div>
    )
  }
)

BaseTextAreaField.displayName = 'BaseTextAreaField'
export default BaseTextAreaField
