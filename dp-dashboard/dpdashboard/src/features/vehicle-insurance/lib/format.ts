const locale = (lang: string) => (lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')

export function formatMoney(value: number | string | null | undefined, lang: string) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat(locale(lang), { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

/** Dates come as `YYYY-MM-DD` or ISO date-times; both render as a short calendar date. */
export function formatDay(value: string | null | undefined, lang: string) {
  if (!value) return '—'
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale(lang), { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

export function formatDateTime(value: string | null | undefined, lang: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(locale(lang), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/** Local `YYYY-MM-DD`, `days` from today — for the offer validity bounds. */
export function isoDayFromToday(days = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Same rounding the server applies: VAT rounded to 2 decimals, total = base + VAT. */
export function computePrice(basePremium: number, vatRatePercent: number) {
  const base = Number.isFinite(basePremium) && basePremium > 0 ? basePremium : 0
  const vat = Math.round(base * vatRatePercent) / 100
  return { base, vat, total: Math.round((base + vat) * 100) / 100 }
}
