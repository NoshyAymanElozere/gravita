import { z } from 'zod'

// Messages are i18n keys — field components run them through t() at render time,
// so errors follow the active language.

const email = z.string().trim().min(1, 'auth.errors.emailRequired').email('auth.errors.invalidEmail')

export const passwordRules = [
  { key: 'auth.password.ruleLength', test: (v: string) => v.length >= 8 },
  { key: 'auth.password.ruleCase', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { key: 'auth.password.ruleNumber', test: (v: string) => /\d/.test(v) },
  { key: 'auth.password.ruleSymbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

export const strongPassword = z
  .string()
  .min(1, 'auth.errors.passwordRequired')
  .refine((v) => passwordRules.every((r) => r.test(v)), 'auth.errors.passwordWeak')

/** Accepts `5XXXXXXXX`, `05XXXXXXXX`, `9665XXXXXXXX` or `+9665XXXXXXXX` — normalised by `toE164`. */
export function normalizeLocalPhone(value: string) {
  return value.replace(/\D/g, '').replace(/^(00966|966|0)/, '')
}

export function toE164(value: string) {
  return `+966${normalizeLocalPhone(value)}`
}

const saudiMobile = z
  .string()
  .min(1, 'auth.errors.phoneRequired')
  .refine((v) => /^5\d{8}$/.test(normalizeLocalPhone(v)), 'auth.errors.invalidPhone')

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'auth.errors.passwordRequired'),
  remember: z.boolean(),
})
export type LoginForm = z.infer<typeof loginSchema>

// ─── Register ────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    // The API slug is derived from the English name, so it must contain Latin characters
    name_en: z
      .string()
      .trim()
      .min(2, 'auth.errors.nameRequired')
      .refine((v) => slugify(v).length >= 3, 'auth.errors.nameEnLatin'),
    name_ar: z.string().trim().min(2, 'auth.errors.nameRequired'),
    license_number: z.string().trim().min(3, 'auth.errors.licenseRequired'),
    tax_number: z.string().trim().regex(/^\d{15}$/, 'auth.errors.invalidTax'),
    website_url: z
      .string()
      .trim()
      .refine((v) => !v || /^(https?:\/\/)?[^\s.]+\.\S+$/i.test(v), 'auth.errors.invalidUrl'),
    category_ids: z.array(z.number()).min(1, 'auth.errors.categoriesRequired'),

    description_en: z.string().trim().optional(),
    description_ar: z.string().trim().optional(),
    address_en: z.string().trim().optional(),
    address_ar: z.string().trim().optional(),

    email,
    phone: saudiMobile,
    password: strongPassword,
    password_confirmation: z.string().min(1, 'auth.errors.confirmRequired'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'auth.errors.passwordMismatch',
  })
export type RegisterForm = z.infer<typeof registerSchema>

export const REGISTER_STEPS: Array<{ key: string; fields: Array<keyof RegisterForm> }> = [
  { key: 'company', fields: ['name_en', 'name_ar', 'license_number', 'tax_number', 'website_url', 'category_ids'] },
  { key: 'profile', fields: ['description_en', 'description_ar', 'address_en', 'address_ar'] },
  { key: 'account', fields: ['email', 'phone', 'password', 'password_confirmation'] },
]

/** API error keys → register form fields */
export const REGISTER_FIELD_MAP: Record<string, keyof RegisterForm> = {
  slug: 'name_en',
  category_ids: 'category_ids',
  'category_ids.0': 'category_ids',
  'translations.0.name': 'name_en',
  'translations.1.name': 'name_ar',
  'translations.0.description': 'description_en',
  'translations.1.description': 'description_ar',
  'translations.0.address': 'address_en',
  'translations.1.address': 'address_ar',
}

export function normalizeUrl(value?: string) {
  const v = value?.trim()
  if (!v) return undefined
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// ─── Verify account (no pending phone in session) ────────────────────────────

export const phoneSchema = z.object({ phone: saudiMobile })
export type PhoneForm = z.infer<typeof phoneSchema>

// ─── Forgot / reset password ─────────────────────────────────────────────────

export const forgotSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'auth.errors.identifierRequired')
    .refine(
      (v) => z.string().email().safeParse(v).success || /^5\d{8}$/.test(normalizeLocalPhone(v)),
      'auth.errors.invalidIdentifier'
    ),
})
export type ForgotForm = z.infer<typeof forgotSchema>

/** Phone identifiers are sent in E.164, emails as typed */
export function normalizeIdentifier(value: string) {
  const v = value.trim()
  return v.includes('@') ? v.toLowerCase() : toE164(v)
}

export const resetSchema = z
  .object({
    password: strongPassword,
    password_confirmation: z.string().min(1, 'auth.errors.confirmRequired'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'auth.errors.passwordMismatch',
  })
export type ResetForm = z.infer<typeof resetSchema>
