import { z } from 'zod'
import { strongPassword } from '@/features/auth/lib/schemas'

// Messages are i18n keys, translated by the field components at render time

export const LOGO_MAX_BYTES = 2 * 1024 * 1024
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

/** Strips spaces, dashes and brackets: `+966 800 124 9990` → `+9668001249990` */
export const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '')

const optionalText = (max: number) => z.string().trim().max(max, 'profile.errors.tooLong')

export const profileSchema = z.object({
  logo: z
    .instanceof(File)
    .nullable()
    .refine((f) => !f || LOGO_TYPES.includes(f.type), 'profile.errors.logoType')
    .refine((f) => !f || f.size <= LOGO_MAX_BYTES, 'profile.errors.logoSize'),
  // Company lines are often landline / toll-free numbers, so any international number is accepted
  phone: z
    .string()
    .trim()
    .min(1, 'auth.errors.phoneRequired')
    .refine((v) => /^\+?\d{8,15}$/.test(normalizePhone(v)), 'profile.errors.invalidPhone'),
  website_url: z
    .string()
    .trim()
    .refine((v) => !v || /^(https?:\/\/)?[^\s.]+\.\S+$/i.test(v), 'auth.errors.invalidUrl'),
  name_en: z.string().trim().min(2, 'auth.errors.nameRequired').max(255, 'profile.errors.tooLong'),
  name_ar: z.string().trim().min(2, 'auth.errors.nameRequired').max(255, 'profile.errors.tooLong'),
  description_en: optionalText(2000),
  description_ar: optionalText(2000),
  address_en: optionalText(255),
  address_ar: optionalText(255),
})
export type ProfileForm = z.infer<typeof profileSchema>

/** API error keys → profile form fields */
export const PROFILE_FIELD_MAP: Record<string, keyof ProfileForm> = {
  'translations.0.name': 'name_en',
  'translations.1.name': 'name_ar',
  'translations.0.description': 'description_en',
  'translations.1.description': 'description_ar',
  'translations.0.address': 'address_en',
  'translations.1.address': 'address_ar',
}

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'profile.errors.currentRequired'),
    password: strongPassword,
    password_confirmation: z.string().min(1, 'auth.errors.confirmRequired'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'auth.errors.passwordMismatch',
  })
  .refine((d) => !d.password || d.password !== d.current_password, {
    path: ['password'],
    message: 'profile.errors.samePassword',
  })
export type PasswordForm = z.infer<typeof passwordSchema>
