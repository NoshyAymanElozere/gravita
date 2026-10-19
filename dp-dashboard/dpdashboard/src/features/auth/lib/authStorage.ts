import { getCookie, setCookie, eraseCookie } from '@/utils/cookies'
import type { AdminUser } from '@/types/api'

export const TOKEN_KEY = 'aura-admin-token'
const USER_KEY = 'aura-admin-user'
const REMEMBER_KEY = 'aura-admin-remember'
const LOGOUT_REASON_KEY = 'aura-admin-logout-reason'

// ─── Token ───────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return getCookie(TOKEN_KEY)
}

/** "Remember me" off → session cookie; on → 7 days (the backend JWT lifetime). */
export function setToken(token: string) {
  setCookie(TOKEN_KEY, token, getRememberMe() ? 7 : 0)
}

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
    // storage unavailable
  }
}

// ─── Admin snapshot (initial data before /auth/me resolves) ──────────────────

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: AdminUser) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // storage unavailable
  }
}

export function clearAuth() {
  eraseCookie(TOKEN_KEY)
  try {
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

// ─── Forced-logout reason (shown once on the login page) ─────────────────────

export type LogoutReason = { kind: 'expired' | 'forbidden'; message?: string }

export function setLogoutReason(reason: LogoutReason) {
  try {
    sessionStorage.setItem(LOGOUT_REASON_KEY, JSON.stringify(reason))
  } catch {
    // ignore
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
    // ignore
  }
}
