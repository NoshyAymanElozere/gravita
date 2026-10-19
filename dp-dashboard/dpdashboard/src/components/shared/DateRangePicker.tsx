import React, { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { format, subDays, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'
import 'react-day-picker/dist/style.css'

interface DateRangePickerProps {
  startName?: string
  endName?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

export function DateRangePicker({
  startName = 'start_date',
  endName = 'end_date',
  label,
  required = false,
  disabled = false
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation()
  const { watch, setValue, formState: { errors } } = useFormContext()
  const [isOpen, setIsOpen] = useState(false)

  const startDateStr = watch(startName)
  const endDateStr = watch(endName)

  const dateLocale = i18n.language === 'ar' ? ar : undefined
  const isRtl = i18n.language === 'ar'

  // Local state for React Day Picker
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)

  // Sync from react-hook-form values to local state
  useEffect(() => {
    const start = startDateStr ? new Date(startDateStr) : undefined
    const end = endDateStr ? new Date(endDateStr) : undefined
    if (start) {
      setSelectedRange({ from: start, to: end })
    } else {
      setSelectedRange(undefined)
    }
  }, [startDateStr, endDateStr])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (range?.from) {
      setValue(startName, format(range.from, 'yyyy-MM-dd'), { shouldValidate: true })
    } else {
      setValue(startName, '')
    }

    if (range?.to) {
      setValue(endName, format(range.to, 'yyyy-MM-dd'), { shouldValidate: true })
    } else {
      setValue(endName, '')
    }
  }

  const presets = [
    {
      label: t('today') || 'Today',
      getValue: () => ({ from: new Date(), to: new Date() })
    },
    {
      label: t('next7Days') || 'Next 7 Days',
      getValue: () => ({ from: new Date(), to: addDays(new Date(), 6) })
    },
    {
      label: t('next30Days') || 'Next 30 Days',
      getValue: () => ({ from: new Date(), to: addDays(new Date(), 29) })
    },
    {
      label: t('thisMonth') || 'This Month',
      getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    },
    {
      label: t('nextMonth') || 'Next Month',
      getValue: () => {
        const nextMonth = addDays(endOfMonth(new Date()), 1)
        return { from: startOfMonth(nextMonth), to: endOfMonth(nextMonth) }
      }
    }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    handleSelect(range)
    setIsOpen(false)
  }

  // Formatting date range display string
  const formatDisplay = () => {
    if (!startDateStr) return t('selectDateRange') || 'Select date range...'
    const start = new Date(startDateStr)
    const end = endDateStr ? new Date(endDateStr) : null

    const startFmt = format(start, 'PP', { locale: dateLocale })
    if (!end) return startFmt

    return `${startFmt} - ${format(end, 'PP', { locale: dateLocale })}`
  }

  const hasError = errors[startName] || errors[endName]

  return (
    <div className={cn('w-full space-y-1.5', isRtl ? 'text-right' : 'text-left')}>
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
          {label} {required && '*'}
        </label>
      )}

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 flex items-center justify-between transition-all hover:bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-main focus:border-main cursor-pointer',
              disabled && 'bg-gray-100/80 border-gray-200/80 text-gray-600 cursor-not-allowed opacity-90',
              hasError && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
              <span className={cn('truncate', !startDateStr && 'text-gray-400')}>
                {formatDisplay()}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-1.5 mr-1.5" />
          </button>
        </Popover.Trigger>

        <Popover.Content
          align="start"
          className="z-[9999] rounded-2xl border border-border/80 bg-card p-4 shadow-xl flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Presets Sidebar */}
          <div className="flex flex-col gap-1 border-r border-border/40 pr-2 min-w-[140px] rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              {t('presets') || 'Presets'}
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="w-full text-left rtl:text-right px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-main/5 hover:text-main text-foreground/90 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* DayPicker Calendar */}
          <div className="react-day-picker-container bg-white rounded-xl p-1">
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              locale={dateLocale}
              className="m-0 border-0"
              classNames={{
                selected: 'bg-main text-white hover:bg-main hover:text-white rounded-lg',
                range_middle: 'bg-main/10 text-main rounded-none',
                range_start: 'bg-main text-white rounded-l-lg rounded-r-none',
                range_end: 'bg-main text-white rounded-r-lg rounded-l-none',
                today: 'text-main font-bold border-b-2 border-main'
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Root>

      {hasError && (
        <p className="text-xs text-rose-500 font-semibold">
          {errors[startName]?.message as string || errors[endName]?.message as string}
        </p>
      )}
    </div>
  )
}
export default DateRangePicker
