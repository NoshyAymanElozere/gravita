import axios, { type AxiosError } from 'axios'
import toast from 'react-hot-toast'
import { clearAuth, getToken, setLogoutReason } from '@/features/auth/lib/authStorage'
import { BYPASS_AUTH } from '@/lib/authBypass'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Skip the global error toast (the caller renders the error itself) */
    silent?: boolean
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

// Endpoints where a 401 means "wrong password", not "session expired"
const CREDENTIAL_PATHS = ['/auth/login', '/users/me/password', '/users/me']

const isCredentialRequest = (url?: string, method?: string) =>
  !!url &&
  CREDENTIAL_PATHS.some((p) => url === p || url.endsWith(p)) &&
  (url.endsWith('/auth/login') || (method ?? '').toLowerCase() === 'put')

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!config.headers['Accept-Language']) {
    config.headers['Accept-Language'] = localStorage.getItem('lang') || 'en'
  }
  // Let the browser set the multipart boundary
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

type ApiErrorBody = { message?: string; errors?: unknown[] }

/** Human readable message from a backend error (message + validation errors[]) */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as AxiosError<ApiErrorBody>
  if (!e?.response) return e?.message === 'Network Error' || !e?.message ? 'Network error — is the API running?' : e.message
  const body = e.response.data
  const details = Array.isArray(body?.errors)
    ? body!.errors
        .map((x) => (typeof x === 'string' ? x : (x as any)?.message ?? (typeof x === 'object' ? JSON.stringify(x) : String(x))))
        .filter(Boolean)
    : []
  const base = body?.message || fallback
  return details.length ? `${base}\n• ${details.join('\n• ')}` : base
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return (err as AxiosError)?.response?.status
}

let loggingOut = false

function forceLogout(message?: string) {
  if (BYPASS_AUTH) return
  clearAuth()
  if (loggingOut || window.location.pathname.startsWith('/login')) return
  loggingOut = true
  setLogoutReason({ kind: 'expired', message })
  window.location.replace('/login')
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    const url = error.config?.url
    const method = error.config?.method

    if (status === 401 && !isCredentialRequest(url, method)) {
      forceLogout(error.response?.data?.message)
      return Promise.reject(error)
    }

    if (!error.config?.silent) {
      const message = getApiErrorMessage(error)
      toast.error(message, { id: message, duration: 6000 })
    }
    return Promise.reject(error)
  }
)

export default api
