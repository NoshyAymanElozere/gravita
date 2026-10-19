import * as React from 'react'
import { Eye, EyeOff, Calendar, ChevronDown } from 'lucide-react'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/utils/utils'
import 'react-day-picker/dist/style.css'

export interface BaseInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  name: string
  type?: 'text' | 'password' | 'date' | 'number' | 'time'
  customError?: string
}

export const BaseInputField = React.forwardRef<HTMLInputElement, BaseInputFieldProps>(
  ({ label, name, type = 'text', placeholder, className, customError, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
    const localRef = React.useRef<HTMLInputElement>(null)
    const { t, i18n } = useTranslation()

    // Attempt to retrieve react-hook-form context
    const formContext = useFormContext()

    // Combine forwarded ref and local ref
    React.useImperativeHandle(ref, () => localRef.current as HTMLInputElement)

    const isRtl = document.documentElement.dir === 'rtl'
    const inputDir = props.dir || (type === 'number' ? 'ltr' : (isRtl ? 'rtl' : 'ltr'))
    const isInputRtl = inputDir === 'rtl'
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const { errors } = formContext?.formState || { errors: {} }
    const rawError = customError || (errors[name]?.message as string | undefined)
    const error = rawError ? t(rawError) : undefined

    // Register if form context exists, otherwise fallback to empty props
    const registerProps = formContext ? formContext.register(name) : {}

    if (type === 'date' && formContext) {
      const dateLocale = i18n.language === 'ar' ? ar : undefined
      return (
        <Controller
          name={name}
          control={formContext.control}
          render={({ field }) => {
            const dateValue = field.value ? new Date(field.value) : undefined

            const handleDateSelect = (day: Date | undefined) => {
              if (day) {
                field.onChange(format(day, 'yyyy-MM-dd'))
              } else {
                field.onChange('')
              }
              setIsCalendarOpen(false)
            }

            return (
              <div className={cn('w-full space-y-1.5', isRtl ? 'text-right' : 'text-left')}>
                {label && (
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {label}
                  </label>
                )}
                <Popover.Root open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      disabled={props.disabled}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 flex items-center justify-between transition-all hover:bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-main focus:border-main cursor-pointer',
                        props.disabled && 'bg-gray-100/80 border-gray-200/80 text-gray-600 cursor-not-allowed opacity-90',
                        error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className={cn('truncate', !field.value && 'text-gray-400')}>
                          {field.value
                            ? format(dateValue!, 'PP', { locale: dateLocale })
                            : placeholder || t('selectDate') || 'Select date...'}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-1.5 mr-1.5" />
                    </button>
                  </Popover.Trigger>

                  <Popover.Content
                    align="start"
                    className="z-[9999] rounded-2xl border border-border/80 bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="bg-white rounded-xl p-1">
                      <DayPicker
                        mode="single"
                        selected={dateValue}
                        onSelect={handleDateSelect}
                        locale={dateLocale}
                        className="m-0 border-0"
                        classNames={{
                          selected: 'bg-main text-white hover:bg-main hover:text-white rounded-lg',
                          today: 'text-main font-bold border-b-2 border-main'
                        }}
                      />
                    </div>
                  </Popover.Content>
                </Popover.Root>
                {error && (
                  <p className="text-xs text-rose-500 font-semibold">{error}</p>
                )}
              </div>
            )
          }}
        />
      )
    }

    return (
      <div className={cn('w-full space-y-1.5', isRtl ? 'text-right' : 'text-left')}>
        {label && (
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={localRef}
            type={inputType}
            dir={inputDir}
            placeholder={placeholder}
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-main focus:border-main transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:transition-opacity',
              isPassword && (isInputRtl ? 'pl-10' : 'pr-10'),
              (type === 'date' || type === 'time') && (isInputRtl ? 'pl-10' : 'pr-10'),
              error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
              props.disabled && 'bg-gray-100/80 border-gray-200/80 text-gray-600 opacity-95 cursor-not-allowed select-none shadow-none focus:ring-0 focus:border-gray-200/80',
              props.readOnly && 'bg-gray-50/50 border-gray-200/50 text-gray-700 cursor-default focus:ring-0 focus:border-gray-200/50',
              className
            )}
            style={{
              fontVariantNumeric: 'lining-nums tabular-nums',
              fontFeatureSettings: '"lnum" on, "tnum" on',
              ...props.style
            }}
            {...registerProps}
            {...props}
          />

          {/* Action Icons */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute text-gray-400 hover:text-gray-600 transition-colors',
                isInputRtl ? 'left-3' : 'right-3'
              )}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

        </div>
        {error && (
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        )}
      </div>
    )
  }
)

BaseInputField.displayName = 'BaseInputField'
export default BaseInputField
