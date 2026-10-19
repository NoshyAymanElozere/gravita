import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken } from '@/features/auth/lib/authStorage'

export function ProtectedRoute() {
  const location = useLocation()

  if (!getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  if (getToken()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
