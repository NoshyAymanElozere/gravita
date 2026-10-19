import { z } from 'zod'
import { LANG_AR, LANG_EN } from '@/features/auth/lib/authStorage'
import { computePrice, isoDayFromToday } from './format'
import {
  needsRepairMethod,
  type InsuranceType,
  type Offer,
  type OfferPayload,
  type RepairMethod,
  type Translation,
} from '../types/vehicleInsurance.types'

export const DEFAULT_VAT_RATE = 15
export const MAX_VALIDITY_DAYS = 30
export const MAX_ITEMS = 20

// Error messages are i18n keys, resolved where the field renders
const E = 'vehicleInsurance.form.errors'

const amount = (rule: 'positive' | 'nonNegative') =>
  z
    .string()
    .trim()
    .min(1, `${E}.required`)
    .refine((v) => !Number.isNaN(Number(v)), `${E}.required`)
    .refine((v) => (rule === 'positive' ? Number(v) > 0 : Number(v) >= 0), `${E}.${rule}`)

const title = z.string().trim().min(1, `${E}.required`).max(255)

/** Numbers are kept as strings while editing so empty inputs don't turn into NaN / 0 */
export function makeOfferSchema(vatRate: number) {
  return z
    .object({
      insurance_type: z.enum(['comprehensive', 'third_party', 'plus']),
      repair_method: z.enum(['agency', 'workshop']).or(z.literal('')),
      coverage_limit: amount('positive'),
      deductible: amount('nonNegative'),
      base_premium: amount('positive'),
      original_price: z.string().trim(),
      valid_until: z
        .string()
        .min(1, `${E}.required`)
        .refine((v) => v >= isoDayFromToday(0) && v <= isoDayFromToday(MAX_VALIDITY_DAYS), `${E}.validRange`),
      benefits: z.array(z.object({ title_en: title, title_ar: title, price: amount('nonNegative') })).max(MAX_ITEMS, `${E}.max20`),
      exclusions: z.array(z.object({ title_en: title, title_ar: title })).max(MAX_ITEMS, `${E}.max20`),
    })
    .superRefine((v, ctx) => {
      if (needsRepairMethod(v.insurance_type) && !v.repair_method) {
        ctx.addIssue({ code: 'custom', path: ['repair_method'], message: `${E}.repairRequired` })
      }
      if (v.original_price !== '') {
        const { total } = computePrice(Number(v.base_premium), vatRate)
        const original = Number(v.original_price)
        if (Number.isNaN(original) || original <= total) {
          ctx.addIssue({ code: 'custom', path: ['original_price'], message: `${E}.originalPrice` })
        }
      }
    })
}

export type OfferFormValues = z.infer<ReturnType<typeof makeOfferSchema>>

const str = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(Math.round(n * 100) / 100))

const pick = (translations: Translation[], languageId: number) =>
  translations.find((t) => t.language_id === languageId)?.title ?? ''

const pair = (en: string, ar: string): Translation[] => [
  { language_id: LANG_EN, title: en.trim() },
  { language_id: LANG_AR, title: ar.trim() },
]

export function emptyOfferForm(requestedType?: InsuranceType): OfferFormValues {
  const type = requestedType ?? 'comprehensive'
  return {
    insurance_type: type,
    repair_method: needsRepairMethod(type) ? 'agency' : '',
    coverage_limit: '',
    deductible: '',
    base_premium: '',
    original_price: '',
    valid_until: isoDayFromToday(MAX_VALIDITY_DAYS),
    benefits: [],
    exclusions: [],
  }
}

export function offerToForm(offer: Offer): OfferFormValues {
  return {
    insurance_type: offer.insurance_type.value,
    repair_method: offer.repair_method?.value ?? '',
    coverage_limit: str(offer.coverage_limit),
    deductible: str(offer.deductible),
    base_premium: str(offer.price.base_premium),
    original_price: str(offer.price.original_price),
    valid_until: offer.valid_until,
    benefits: (offer.edit_form?.benefits ?? []).map((b) => ({
      title_en: pick(b.translations, LANG_EN),
      title_ar: pick(b.translations, LANG_AR),
      price: str(b.price),
    })),
    exclusions: (offer.edit_form?.exclusions ?? []).map((x) => ({
      title_en: pick(x.translations, LANG_EN),
      title_ar: pick(x.translations, LANG_AR),
    })),
  }
}

export function formToPayload(v: OfferFormValues): OfferPayload {
  return {
    insurance_type: v.insurance_type,
    repair_method: needsRepairMethod(v.insurance_type) ? (v.repair_method as RepairMethod) : null,
    coverage_limit: Number(v.coverage_limit),
    deductible: Number(v.deductible),
    base_premium: Number(v.base_premium),
    original_price: v.original_price === '' ? null : Number(v.original_price),
    valid_until: v.valid_until,
    benefits: v.benefits.map((b) => ({ price: Number(b.price), translations: pair(b.title_en, b.title_ar) })),
    exclusions: v.exclusions.map((x) => ({ translations: pair(x.title_en, x.title_ar) })),
  }
}

/**
 * Maps Laravel error keys onto form fields, e.g. `benefits.0.translations.1.title` → `benefits.0.title_ar`
 * and `base_premium` stays as is. Request-level keys (`status`) have no field and only toast.
 */
export function mapOfferErrorKey(key: string): string | null {
  const tr = key.match(/^(benefits|exclusions)\.(\d+)\.translations\.(\d+)\.title$/)
  if (tr) return `${tr[1]}.${tr[2]}.${tr[3] === '0' ? 'title_en' : 'title_ar'}`
  if (key === 'status') return null
  return key
}
