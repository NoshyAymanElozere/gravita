/** Enum fields come back as `{ value, label }`, with the label in the requested language */
export interface ApiEnum<T extends string = string> {
  value: T
  label: string
}

export type InsuranceType = 'comprehensive' | 'third_party' | 'plus'
export type RepairMethod = 'agency' | 'workshop'
export type MyResponseStatus = 'pending' | 'viewed' | 'offered' | 'declined'
export type RequestStatus = 'draft' | 'submitted' | 'offers_received' | 'cancelled' | 'expired'
export type OfferStatus = 'active' | 'withdrawn' | 'expired'

export const INSURANCE_TYPES: InsuranceType[] = ['comprehensive', 'third_party', 'plus']
export const REPAIR_METHODS: RepairMethod[] = ['agency', 'workshop']
export const RESPONSE_TABS: MyResponseStatus[] = ['pending', 'viewed', 'offered', 'declined']
export const REQUEST_STATUS_FILTERS: RequestStatus[] = ['submitted', 'offers_received', 'cancelled', 'expired']
export const OFFER_TABS: OfferStatus[] = ['active', 'withdrawn', 'expired']

/** Comprehensive and Plus need a repair method; Third party is saved with `null` */
export const needsRepairMethod = (type: InsuranceType | '' | undefined) => type === 'comprehensive' || type === 'plus'

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface Paginated<T> {
  data: T[]
  meta?: PaginationMeta
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface InboxRequest {
  id: number
  reference: string | null
  status: ApiEnum<RequestStatus>
  my_response: ApiEnum<MyResponseStatus>
  my_active_offers_count: number
  vehicle_name: string
  usage_purpose: ApiEnum | null
  estimated_value: number | null
  insurance_type: ApiEnum<InsuranceType>
  policy_start_date: string
  has_additional_driver: boolean
  is_open_for_offers: boolean
  submitted_at: string | null
}

export interface InboxFilters {
  response_status: MyResponseStatus
  status: RequestStatus | ''
  insurance_type: InsuranceType | ''
  search: string
  page: number
  per_page: number
}

export interface RequestVehicle {
  identifier_type: ApiEnum | null
  identifier_number: string | null
  owner_national_id: string | null
  owner_birth_date: string | null
  make: string | null
  model: string | null
  plate_letters: string | null
  plate_number: string | null
  inspection_status: ApiEnum | null
  manufacture_year: number | null
  usage_purpose: ApiEnum | null
  load_capacity: number | string | null
  estimated_value: number | null
  document_url: string | null
}

export interface AdditionalDriver {
  national_id: string
  birth_date: string
  birth_date_calendar: ApiEnum | null
  driving_percentage: number
}

export interface RequestDetail {
  id: number
  reference: string | null
  status: ApiEnum<RequestStatus>
  is_open_for_offers: boolean
  my_response: {
    status: ApiEnum<MyResponseStatus>
    viewed_at: string | null
    responded_at: string | null
    decline_reason: string | null
  }
  vehicle_source: ApiEnum<'new' | 'transfer' | 'existing'>
  vehicle: RequestVehicle
  has_additional_driver: boolean
  additional_driver: AdditionalDriver | null
  insurance_type: ApiEnum<InsuranceType>
  policy_start_date: string
  submitted_at: string | null
  my_offers: Offer[]
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export interface Translation {
  language_id: number
  title: string
}

export interface OfferPrice {
  base_premium: number
  vat_rate: number
  vat_amount: number
  total_price: number
  original_price: number | null
  currency: string
}

export interface Offer {
  id: number
  reference: string | null
  request_id: number
  request_reference: string | null
  insurance_type: ApiEnum<InsuranceType>
  repair_method: ApiEnum<RepairMethod> | null
  coverage_limit: number
  deductible: number
  price: OfferPrice
  valid_until: string
  status: ApiEnum<OfferStatus>
  benefits: { id: number; title: string; price: number; is_included: boolean }[]
  exclusions: { id: number; title: string }[]
  withdrawn_at: string | null
  created_at: string
  updated_at: string
  /** Benefits & exclusions in both languages, to prefill the edit form */
  edit_form?: {
    benefits: { price: number; translations: Translation[] }[]
    exclusions: { translations: Translation[] }[]
  }
}

export interface OfferFilters {
  status: OfferStatus
  insurance_type: InsuranceType | ''
  request_id: string
  page: number
  per_page: number
}

/** Body of `POST /vehicle-insurance-requests/{id}/offers` and `PUT /vehicle-insurance-offers/{id}` (full replace) */
export interface OfferPayload {
  insurance_type: InsuranceType
  repair_method: RepairMethod | null
  coverage_limit: number
  deductible: number
  base_premium: number
  original_price: number | null
  valid_until: string
  benefits: { price: number; translations: Translation[] }[]
  exclusions: { translations: Translation[] }[]
}
