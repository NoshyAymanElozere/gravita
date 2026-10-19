import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/services/axios'
import {
  clearAuth,
  clearPendingPhone,
  extractSession,
  getStoredCompany,
  getToken,
  setPendingPhone,
  setStoredCompany,
  setToken,
} from '../lib/authStorage'
import type {
  ApiEnvelope,
  AuthSessionPayload,
  Company,
  ForgotPasswordPayload,
  InsuranceCategoryOption,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
  VerifyResetOtpPayload,
} from '../types/auth.types'

export type * from '../types/auth.types'

export const PROFILE_KEY = ['company-profile'] as const

const post = async <T = unknown>(url: string, body?: unknown) =>
  (await api.post<ApiEnvelope<T>>(url, body)).data

export type AuthSession = ReturnType<typeof extractSession> & { message: string }

const postSession = async (url: string, body: unknown): Promise<AuthSession> => {
  const res = await post<AuthSessionPayload>(url, body)
  return { message: res.message, ...extractSession(res.data) }
}

/** Persists token + company when the response carries a session token. */
function usePersistSession() {
  const queryClient = useQueryClient()
  return (session: AuthSession) => {
    if (!session.token) return
    setToken(session.token, session.expiresIn)
    if (session.company) {
      setStoredCompany(session.company)
      queryClient.setQueryData(PROFILE_KEY, session.company)
    }
  }
}

// ─── Sign in ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const persist = usePersistSession()
  return useMutation({
    mutationFn: (payload: LoginPayload) => postSession('/company/auth/login', payload),
    onSuccess: persist,
  })
}

// ─── Registration & phone verification ───────────────────────────────────────

/** Public list the company picks its operational fields from (`category_ids` on register) */
export function useInsuranceCategories(lang: string) {
  return useQuery({
    queryKey: ['company-insurance-categories', lang],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<InsuranceCategoryOption[]>>('/company/insurance-categories', {
          headers: { 'Accept-Language': lang },
        })
      ).data.data ?? [],
    staleTime: 10 * 60 * 1000,
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => post('/company/auth/register', payload),
    onSuccess: (_res, payload) => setPendingPhone(payload.phone),
  })
}

export function useVerifyOtp() {
  const persist = usePersistSession()
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => postSession('/company/auth/verify-otp', payload),
    onSuccess: (session) => {
      clearPendingPhone()
      // Self-registered accounts come back with token: null until an admin activates them
      if (session.isActive) persist(session)
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: { phone: string }) => post('/company/auth/resend-otp', payload),
    onSuccess: (_res, payload) => setPendingPhone(payload.phone),
  })
}

// ─── Password recovery ───────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => post('/company/auth/forgot-password', payload),
  })
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: (payload: VerifyResetOtpPayload) => post('/company/auth/verify-reset-otp', payload),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => post('/company/auth/reset-password', payload),
  })
}

// ─── Session ─────────────────────────────────────────────────────────────────

export function useProfile() {
  const token = getToken()
  return useQuery<Company | null>({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<Company | { company: Company }>>('/company/auth/me')
      const data = res.data.data
      const company = data && 'company' in data ? data.company : (data as Company | undefined)
      if (company) setStoredCompany(company)
      return company ?? getStoredCompany()
    },
    initialData: getStoredCompany,
    initialDataUpdatedAt: 0, // always revalidate the cached snapshot on mount
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const finish = () => {
    clearAuth()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return useMutation({
    mutationFn: () => post('/company/auth/logout'),
    // Local session is cleared regardless — a failed server logout must not trap the user
    onSettled: finish,
  })
}
