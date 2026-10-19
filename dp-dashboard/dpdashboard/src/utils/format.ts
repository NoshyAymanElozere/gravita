import i18n from '@/lib/i18n/i18n'

const locale = () => (i18n.language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')

/** Money is stored as whole SAR numbers */
export function formatMoney(amount: number | null | undefined, opts: { compact?: boolean } = {}): string {
  const value = Number(amount ?? 0)
  const num = new Intl.NumberFormat(locale(), {
    maximumFractionDigits: opts.compact ? 1 : 2,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(value)
  return i18n.language === 'ar' ? `${num} ر.س` : `SAR ${num}`
}

export function formatNum(value: number | null | undefined, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(locale(), opts).format(Number(value ?? 0))
}

export function formatDate(value?: string | Date | null, withTime = false): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d)
}

export function formatShortDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' }).format(d)
}

/** Pick the localized variant of a bilingual record (`nameEn`/`nameAr` …) */
export function pickLang<T extends Record<string, any>>(record: T | null | undefined, base: string): string {
  if (!record) return ''
  const ar = record[`${base}Ar`]
  const en = record[`${base}En`]
  return (i18n.language === 'ar' ? ar || en : en || ar) ?? ''
}

/** yyyy-MM-dd for <input type="date"> */
export function toDateInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
