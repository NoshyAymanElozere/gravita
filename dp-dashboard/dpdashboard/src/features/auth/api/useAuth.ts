import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/services/axios'
import type { AdminUser, ApiEnvelope } from '@/types/api'
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from '../lib/authStorage'

export const PROFILE_KEY = ['admin-profile'] as const

/** Thrown by login when valid credentials belong to a non-admin account */
export class NotAdminError extends Error {
  constructor() {
    super('not-admin')
    this.name = 'NotAdminError'
  }
}

type LoginResponse = ApiEnvelope<{ user: AdminUser }> & { token: string }

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await api.post<LoginResponse>('/auth/login', payload, { silent: true })
      const { token, data } = res.data
      // Only administrators may use the dashboard — do not keep a customer session
      if (data?.user?.role !== 'admin') throw new NotAdminError()
      return { token, user: data.user, message: res.data.message }
    },
    onSuccess: ({ token, user }) => {
      setToken(token)
      setStoredUser(user)
      queryClient.setQueryData(PROFILE_KEY, user)
    },
  })
}

/** Current admin (restores the session with GET /auth/me) */
export function useProfile() {
  const token = getToken()
  return useQuery<AdminUser | null>({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<{ user: AdminUser }>>('/auth/me', { silent: true })
      const user = res.data.data?.user ?? null
      if (user) setStoredUser(user)
      return user
    },
    initialData: getStoredUser,
    initialDataUpdatedAt: 0, // always revalidate the cached snapshot on mount
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // The API is stateless (JWT) — logging out only drops the local session
  return () => {
    clearAuth()
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name?: string; email?: string; phone?: string }) =>
      (await api.put<ApiEnvelope<{ user: AdminUser & { _id?: string } }>>('/users/me', payload)).data,
    onSuccess: (res) => {
      const u = res.data.user
      const user: AdminUser = { id: u.id ?? u._id ?? '', name: u.name, email: u.email, phone: u.phone, role: u.role }
      setStoredUser(user)
      queryClient.setQueryData(PROFILE_KEY, user)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) =>
      (await api.put<ApiEnvelope<null>>('/users/me/password', payload)).data,
    onSuccess: (res) => {
      // Old tokens stop working after a password change — keep the session alive with the new one
      if (res.token) setToken(res.token)
    },
  })
}
