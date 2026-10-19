import { Navigate, Route } from 'react-router-dom'
import { PublicRoute } from '@/components/shared/RouteGuards'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import Login from '@/features/auth/pages/Login'

export const authRoutes = (
  <Route element={<PublicRoute />}>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      {/* The API has no self-service registration / OTP / password reset */}
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
    </Route>
  </Route>
)
