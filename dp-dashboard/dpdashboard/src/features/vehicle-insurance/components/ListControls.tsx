import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/utils'

/** Pill tabs used for `response_status` (inbox) and `status` (my offers) */
export function StatusTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-xl bg-gray-100/80 p-1 dark:bg-zinc-800/60">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-xs font-bold transition-all',
            value === o.value
              ? 'bg-white text-primary shadow-xs dark:bg-zinc-900'
              : 'text-muted-foreground hover:text-gray-900 dark:hover:text-zinc-100'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function FilterSelect<T extends string>({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: T | ''
  onChange: (value: T | '') => void
  placeholder: string
  options: { value: T; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T | '')}
      aria-label={placeholder}
      className="h-10 min-w-[170px] cursor-pointer rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** Search box that reports its value after the user stops typing */
export function DebouncedSearch({
  value,
  onChange,
  placeholder,
  delay = 400,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  delay?: number
}) {
  const [text, setText] = React.useState(value)

  React.useEffect(() => setText(value), [value])

  React.useEffect(() => {
    if (text === value) return
    const id = window.setTimeout(() => onChange(text.trim()), delay)
    return () => window.clearTimeout(id)
  }, [text, value, delay, onChange])

  return (
    <div className="relative min-w-[260px] flex-1 sm:flex-initial">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-input bg-background pe-3.5 ps-9 text-xs font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
