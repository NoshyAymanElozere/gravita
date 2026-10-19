import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import { clearAuth, getToken, setLogoutReason, setToken, type LogoutReason } from '@/features/auth/lib/authStorage'

const baseURL = import.meta.env.VITE_API_URL ?? 'https://backend1.kazamiza.com/al-wathiqa/api/v1'

const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Public auth endpoints render their own inline errors — no global toasts / refresh for them
const PUBLIC_AUTH_PATHS = [
  '/company/auth/login',
  '/company/auth/register',
  '/company/auth/verify-otp',
  '/company/auth/resend-otp',
  '/company/auth/forgot-password',
  '/company/auth/verify-reset-otp',
  '/company/auth/reset-password',
]
const REFRESH_PATH = '/company/auth/refresh'
const LOGOUT_PATH = '/company/auth/logout'

const isPublicAuthRequest = (url?: string) => !!url && PUBLIC_AUTH_PATHS.some((p) => url.includes(p))

// A 403 from the company's own session endpoints (/me, /refresh) means the account itself
// is blocked (e.g. deactivated by an admin), not a missing permission on one resource.
const isSessionRequest = (url?: string) => !!url && /\/company\/auth\/(me|refresh)\b/.test(url)
const INACTIVE_MESSAGE = /inactive|deactivat|disabled|suspend|غير نشط|غير مفعل|معطل|موقوف/i

// Request interceptor — attach auth token and lang headers
api.interceptors.request.use(
  (config) => {
    // Prevent duplicate /api/v1 or /v1 prefix when baseURL already includes /api/v1
    if (config.url) {
      if (config.url.startsWith('/api/v1/')) {
        config.url = config.url.replace('/api/v1', '')
      } else if (config.url.startsWith('/v1/')) {
        config.url = config.url.replace('/v1', '')
      }
    }

    const token = getToken()
    if (token && !isPublicAuthRequest(config.url)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['Accept'] = 'application/json'
    // A request may pin its own language (e.g. loading both translations of a record)
    if (!config.headers['Accept-Language']) {
      config.headers['Accept-Language'] = localStorage.getItem('lang') || 'ar'
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Token refresh (single-flight: concurrent 401s share one refresh call) ────

const ACCOUNT_BLOCKED = 'account-blocked'
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const current = getToken()
  if (!current) return null
  try {
    const res = await axios.post(`${baseURL}${REFRESH_PATH}`, null, {
      headers: {
        Authorization: `Bearer ${current}`,
        Accept: 'application/json',
        'Accept-Language': localStorage.getItem('lang') || 'ar',
      },
      timeout: 15_000,
    })
    const data = res.data?.data ?? res.data
    const token: string | undefined = data?.access_token ?? data?.token
    if (!token) return null
    setToken(token, data?.expires_in)
    return token
  } catch (err) {
    return (err as AxiosError)?.response?.status === 403 ? ACCOUNT_BLOCKED : null
  }
}

let loggingOut = false

function forceLogout(reason: LogoutReason) {
  clearAuth()
  const loginPath = `${import.meta.env.BASE_URL}login`
  if (loggingOut || window.location.pathname.startsWith(loginPath)) return
  loggingOut = true
  setLogoutReason(reason)
  window.location.replace(loginPath)
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Response interceptor — refresh on 401, global error handling for app requests
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = config?.url
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong'

    if (isPublicAuthRequest(url)) {
      if (!error.response) toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    if (status === 401 && config && !config._retry && !url?.includes(REFRESH_PATH) && !url?.includes(LOGOUT_PATH)) {
      config._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const token = await refreshPromise
      if (token && token !== ACCOUNT_BLOCKED) {
        config.headers.Authorization = `Bearer ${token}`
        return api(config)
      }
      forceLogout({ kind: token === ACCOUNT_BLOCKED ? 'inactive' : 'expired' })
      return Promise.reject(error)
    }

    if (url?.includes(LOGOUT_PATH)) return Promise.reject(error)

    if (status === 403 && (isSessionRequest(url) || INACTIVE_MESSAGE.test(message))) {
      forceLogout({ kind: 'inactive', message: error.response?.data?.message })
      return Promise.reject(error)
    }

    if (!error.response) {
      toast.error('Network error. Please check your connection.')
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 422) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
