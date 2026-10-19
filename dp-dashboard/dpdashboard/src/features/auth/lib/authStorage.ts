import { getCookie, setCookie, eraseCookie } from '@/utils/cookies'
import type { AuthSessionPayload, Company } from '../types/auth.types'

export const TOKEN_KEY = 'wathiqa-provider-token'
const COMPANY_KEY = 'wathiqa-company'
const PENDING_PHONE_KEY = 'wathiqa-pending-phone'

export const LANG_EN = 1
export const LANG_AR = 2

// ─── Token ───────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return getCookie(TOKEN_KEY)
}

export function setToken(token: string, expiresInSeconds?: number) {
  // "Remember me" off → session cookie (cleared when the browser closes).
  // On → keep it for the refresh window rather than the short access-token TTL,
  // so an expired token can still be exchanged via /refresh.
  if (!getRememberMe()) return setCookie(TOKEN_KEY, token, 0)
  const days = expiresInSeconds ? Math.max(1, Math.ceil(expiresInSeconds / 86_400)) : 7
  setCookie(TOKEN_KEY, token, Math.max(days, 7))
}

// ─── Remember me (persists across token refreshes) ───────────────────────────

const REMEMBER_KEY = 'wathiqa-remember-me'

export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0'
  } catch {
    return true
  }
}

export function setRememberMe(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    // Ignore
  }
}

// ─── Company snapshot (used as initial data before /me resolves) ─────────────

export function getStoredCompany(): Company | null {
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    return raw ? (JSON.parse(raw) as Company) : null
  } catch {
    return null
  }
}

export function setStoredCompany(company: Company) {
  try {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(company))
  } catch {
    // Storage unavailable — the profile query still works without the snapshot
  }
}

export function clearAuth() {
  eraseCookie(TOKEN_KEY)
  try {
    localStorage.removeItem(COMPANY_KEY)
  } catch {
    // Ignore
  }
}

// ─── Forced-logout reason (shown once on the login page after a hard redirect) ─

const LOGOUT_REASON_KEY = 'wathiqa-logout-reason'

export type LogoutReason = { kind: 'inactive' | 'expired'; message?: string }

export function setLogoutReason(reason: LogoutReason) {
  try {
    sessionStorage.setItem(LOGOUT_REASON_KEY, JSON.stringify(reason))
  } catch {
    // Ignore
  }
}

export function getLogoutReason(): LogoutReason | null {
  try {
    const raw = sessionStorage.getItem(LOGOUT_REASON_KEY)
    return raw ? (JSON.parse(raw) as LogoutReason) : null
  } catch {
    return null
  }
}

export function clearLogoutReason() {
  try {
    sessionStorage.removeItem(LOGOUT_REASON_KEY)
  } catch {
    // Ignore
  }
}

// ─── Pending verification (survives refresh between register → verify) ──────

export function getPendingPhone(): string | null {
  try {
    return sessionStorage.getItem(PENDING_PHONE_KEY)
  } catch {
    return null
  }
}

export function setPendingPhone(phone: string) {
  try {
    sessionStorage.setItem(PENDING_PHONE_KEY, phone)
  } catch {
    // Ignore
  }
}

export function clearPendingPhone() {
  try {
    sessionStorage.removeItem(PENDING_PHONE_KEY)
  } catch {
    // Ignore
  }
}

// ─── Session parsing ─────────────────────────────────────────────────────────

export function extractSession(payload?: AuthSessionPayload | null) {
  const token = payload?.access_token ?? payload?.token ?? null
  const company = payload?.company ?? null
  const isActive = payload?.is_active ?? company?.is_active ?? !!token
  return { token, company, isActive, expiresIn: payload?.expires_in }
}
