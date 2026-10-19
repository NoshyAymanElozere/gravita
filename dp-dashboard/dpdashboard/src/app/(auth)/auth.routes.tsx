import { Route } from 'react-router-dom'
import { PublicRoute } from '@/components/shared/RouteGuards'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import VerifyAccount from '@/features/auth/pages/VerifyAccount'
import ForgotPassword from '@/features/auth/pages/ForgotPassword'
import PendingApproval from '@/features/auth/pages/PendingApproval'

export const authRoutes = (
  <Route element={<PublicRoute />}>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-account" element={<VerifyAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
    </Route>
  </Route>
)
