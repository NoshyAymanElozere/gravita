// Image URLs coming from the API come in three flavours:
//   /uploads/...      → files served by the API itself (prefix with the API origin)
//   /assets/...       → storefront static files (prefix with the storefront origin)
//   http(s)://, data:, blob: → already absolute

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const STOREFRONT_URL: string = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'

/** API origin = VITE_API_URL without the trailing `/api` segment */
export const API_ORIGIN = API_URL.replace(/\/+$/, '').replace(/\/api$/, '')
export const STOREFRONT_ORIGIN = STOREFRONT_URL.replace(/\/+$/, '')

export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  const value = path.trim()
  if (!value) return undefined
  if (/^(https?:|data:|blob:)/i.test(value) || value.startsWith('//')) return value
  if (value.startsWith('/uploads/') || value.startsWith('uploads/')) {
    return `${API_ORIGIN}/${value.replace(/^\/+/, '')}`
  }
  if (value.startsWith('/assets/') || value.startsWith('assets/')) {
    return `${STOREFRONT_ORIGIN}/${value.replace(/^\/+/, '')}`
  }
  // Unknown relative path — assume the API serves it
  return `${API_ORIGIN}/${value.replace(/^\/+/, '')}`
}

/** Public storefront link for a product/bundle (used for "view on store") */
export function storefrontUrl(path = ''): string {
  return `${STOREFRONT_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}
