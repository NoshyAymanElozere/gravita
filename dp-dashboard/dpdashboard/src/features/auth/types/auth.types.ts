export interface CompanyTranslation {
  id?: number
  language_id: number
  language_code?: string
  name: string
  description?: string | null
  address?: string | null
}

/** Authenticated company returned by the `company` guard (`/company/auth/me`, login, verify-otp) */
export interface Company {
  id: number
  slug: string
  name: string
  email: string
  phone: string | null
  logo_url?: string | null
  website_url?: string | null
  license_number?: string | null
  tax_number?: string | null
  description?: string | null
  address?: string | null
  is_active: boolean
  phone_verified_at?: string | null
  translations?: CompanyTranslation[]
}

export interface ApiEnvelope<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

/** `data` payload of login / verify-otp / refresh. Token key differs between endpoints, so both are accepted. */
export interface AuthSessionPayload {
  company?: Company | null
  token?: string | null
  access_token?: string | null
  token_type?: string
  expires_in?: number
  is_active?: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  slug: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  license_number: string
  tax_number: string
  website_url?: string
  category_ids: number[]
  translations: Array<{ language_id: number; name: string; description?: string; address?: string }>
}

/** Item of `GET /company/insurance-categories` — `name` / `description` follow `Accept-Language` */
export interface InsuranceCategoryOption {
  id: number
  slug: string
  name: string
  description?: string | null
  /** Icon key, e.g. `car` or `heart-pulse` */
  icon?: string | null
  icon_url?: string | null
  image_url?: string | null
  sort_order?: number
}

export interface VerifyOtpPayload {
  phone: string
  code: string
}

export interface ForgotPasswordPayload {
  identifier: string
}

export interface VerifyResetOtpPayload {
  identifier: string
  code: string
}

export interface ResetPasswordPayload {
  identifier: string
  code: string
  password: string
  password_confirmation: string
}
