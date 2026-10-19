import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearAuth, getToken, setLogoutReason } from '@/features/auth/lib/authStorage'
import { useProfile } from '@/features/auth/api/useAuth'
import { PageLoader } from './page-loader'

/** Requires a valid admin session (validated with GET /auth/me) */
export function ProtectedRoute() {
  const location = useLocation()
  const token = getToken()
  const { data: user, isFetching, isError, isFetched } = useProfile()

  const notAdmin = isFetched && !isFetching && !!user && user.role !== 'admin'
  const invalid = isFetched && !isFetching && (isError || !user)

  useEffect(() => {
    if (notAdmin) {
      clearAuth()
      setLogoutReason({ kind: 'forbidden' })
    }
  }, [notAdmin])

  if (!token || notAdmin || (invalid && !user)) {
    if (invalid) clearAuth()
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  // First visit without a cached snapshot — wait for /auth/me
  if (!user) return <PageLoader />

  return <Outlet />
}

export function PublicRoute() {
  if (getToken()) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
