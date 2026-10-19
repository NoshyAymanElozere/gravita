import type { ApiEnvelope, Paginated, Pagination } from '@/types/api'

const EMPTY_PAGINATION: Pagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
}

/** Drop empty filter values so they are not sent as `?status=` */
export function cleanParams(params: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === 'all') continue
    out[k] = v as string | number | boolean
  }
  return out
}

/** Normalise a paginated list response (`data: T[]` or `data: { [key]: T[] }`) */
export function toPaginated<T>(res: ApiEnvelope<unknown>, key?: string): Paginated<T> {
  const raw = key && res.data && !Array.isArray(res.data) ? (res.data as Record<string, unknown>)[key] : res.data
  const items = Array.isArray(raw) ? (raw as T[]) : []
  return { items, pagination: res.pagination ?? { ...EMPTY_PAGINATION, totalItems: items.length } }
}

/**
 * Build multipart/form-data for the API: files as-is, arrays/objects as JSON strings
 * (the backend parses `benefitsEn`, `items`, `galleryImages` … with parseJsonFields).
 */
export function toFormData(fields: Record<string, unknown>, files: Record<string, File | File[] | null | undefined> = {}): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) || (typeof v === 'object' && !(v instanceof Blob))) fd.append(k, JSON.stringify(v))
    else fd.append(k, String(v))
  }
  for (const [k, f] of Object.entries(files)) {
    if (!f) continue
    for (const file of Array.isArray(f) ? f : [f]) fd.append(k, file)
  }
  return fd
}
