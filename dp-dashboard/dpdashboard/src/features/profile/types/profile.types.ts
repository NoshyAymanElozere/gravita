import type { CompanyTranslation } from '@/features/auth/types/auth.types'

export interface CompanyCategory {
  id: number
  slug: string
  name: string
  /** Icon key, e.g. `car` or `shield-check` */
  icon?: string | null
  icon_url?: string | null
}

/** `GET /company/profile` — localized fields follow `Accept-Language` */
export interface CompanyProfile {
  id: number
  slug: string
  name: string
  description: string | null
  address: string | null
  license_number: string | null
  tax_number: string | null
  email: string
  phone: string | null
  website_url: string | null
  logo_url: string | null
  is_active: boolean
  categories: CompanyCategory[]
  /** Not part of the documented response; filled by merging the EN + AR responses when absent */
  translations: CompanyTranslation[]
}

export interface UpdateProfilePayload {
  phone: string
  website_url: string
  translations: Array<{ language_id: number; name: string; description: string; address: string }>
  logo?: File | null
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}
