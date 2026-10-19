import { Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/shared/RouteGuards'

import PlansList from '@/features/plans/pages/PlansList'
import PlanFormPage from '@/features/plans/pages/PlanFormPage'
import CompanyPoliciesList from '@/features/policies/pages/CompanyPoliciesList'
import CompanyClaimsList from '@/features/claims/pages/CompanyClaimsList'
import CompanySettlementsList from '@/features/settlements/pages/CompanySettlementsList'
import CompanyTeamList from '@/features/team/pages/CompanyTeamList'
import CompanyProfilePage from '@/features/profile/pages/CompanyProfilePage'
import VehicleRequestsInbox from '@/features/vehicle-insurance/pages/VehicleRequestsInbox'
import VehicleRequestDetail from '@/features/vehicle-insurance/pages/VehicleRequestDetail'
import VehicleOffersList from '@/features/vehicle-insurance/pages/VehicleOffersList'
import VehicleOfferDetail from '@/features/vehicle-insurance/pages/VehicleOfferDetail'
import OfferFormPage from '@/features/vehicle-insurance/pages/OfferFormPage'

import BlogList from '@/features/blog/pages/BlogList'
import BlogForm from '@/features/blog/pages/BlogForm'
import BlogView from '@/features/blog/pages/BlogView'
import DepartmentList from '@/features/department/pages/DepartmentList'
import SettingsOverviewPage from '@/features/settings/pages/SettingsOverviewPage'

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
    <h2 className="text-2xl font-semibold opacity-50">{title}</h2>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
)

export const dashboardRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Layout />}>
      {/* Vehicle insurance requests are the company's main workflow */}
      <Route index element={<Navigate to="vehicle-requests" replace />} />

      <Route path="vehicle-requests" element={<VehicleRequestsInbox />} />
      <Route path="vehicle-requests/:id" element={<VehicleRequestDetail />} />
      <Route path="vehicle-requests/:id/offer" element={<OfferFormPage mode="send" />} />
      <Route path="vehicle-offers" element={<VehicleOffersList />} />
      <Route path="vehicle-offers/:id" element={<VehicleOfferDetail />} />
      <Route path="vehicle-offers/:id/edit" element={<OfferFormPage mode="edit" />} />

      {/* Insurance Company Portal Routes */}
      <Route path="plans" element={<PlansList />} />
      <Route path="plans/new" element={<PlanFormPage mode="new" />} />
      <Route path="plans/edit/:id" element={<PlanFormPage mode="edit" />} />
      <Route path="plans/view/:id" element={<PlanFormPage mode="view" />} />

      <Route path="policies" element={<CompanyPoliciesList />} />
      <Route path="claims" element={<CompanyClaimsList />} />
      <Route path="settlements" element={<CompanySettlementsList />} />
      <Route path="team" element={<CompanyTeamList />} />
      <Route path="profile" element={<CompanyProfilePage />} />

      {/* Legacy Blog & Department Routes */}
      <Route path="blogs" element={<BlogList />} />
      <Route path="blogs/new" element={<BlogForm />} />
      <Route path="blogs/edit/:slug" element={<BlogForm />} />
      <Route path="blogs/view/:slug" element={<BlogView />} />
      <Route path="departments" element={<DepartmentList />} />
      <Route path="settings" element={<SettingsOverviewPage />} />

      <Route path="*" element={<Placeholder title="404 Not Found" />} />
    </Route>
  </Route>
)
