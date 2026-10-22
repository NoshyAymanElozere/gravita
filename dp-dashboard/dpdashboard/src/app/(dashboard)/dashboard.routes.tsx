import { Link, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/shared/RouteGuards'
import { Button } from '@/components/ui/button'

import Overview from '@/features/dashboard/pages/Overview'
import OrdersList from '@/features/orders/pages/OrdersList'
import OrderDetail from '@/features/orders/pages/OrderDetail'
import ProductsList from '@/features/products/pages/ProductsList'
import ProductFormPage from '@/features/products/pages/ProductFormPage'
import CategoriesList from '@/features/categories/pages/CategoriesList'
import BannersList from '@/features/banners/pages/BannersList'
import BundlesList from '@/features/bundles/pages/BundlesList'
import BundleFormPage from '@/features/bundles/pages/BundleFormPage'
import CustomersList from '@/features/customers/pages/CustomersList'
import CustomerDetail from '@/features/customers/pages/CustomerDetail'
import CouponsList from '@/features/coupons/pages/CouponsList'
import ReviewsList from '@/features/reviews/pages/ReviewsList'
import NewsletterList from '@/features/newsletter/pages/NewsletterList'
import AdminProfilePage from '@/features/profile/pages/AdminProfilePage'

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-6xl font-black text-brand-sage-light">404</p>
      <h2 className="text-lg font-semibold">{t('common.notFoundTitle')}</h2>
      <p className="text-sm text-muted-foreground">{t('common.notFoundText')}</p>
      <Button asChild variant="outline">
        <Link to="/">{t('nav.overview')}</Link>
      </Button>
    </div>
  )
}

export const dashboardRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Layout />}>
      <Route index element={<Overview />} />

      <Route path="orders" element={<OrdersList />} />
      <Route path="orders/:id" element={<OrderDetail />} />

      <Route path="products" element={<ProductsList />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id/edit" element={<ProductFormPage />} />

      <Route path="categories" element={<CategoriesList />} />

      <Route path="banners" element={<BannersList />} />

      <Route path="bundles" element={<BundlesList />} />
      <Route path="bundles/new" element={<BundleFormPage />} />
      <Route path="bundles/:id/edit" element={<BundleFormPage />} />

      <Route path="customers" element={<CustomersList />} />
      <Route path="customers/:id" element={<CustomerDetail />} />

      <Route path="coupons" element={<CouponsList />} />
      <Route path="reviews" element={<ReviewsList />} />
      <Route path="newsletter" element={<NewsletterList />} />
      <Route path="profile" element={<AdminProfilePage />} />

      <Route path="*" element={<NotFound />} />
    </Route>
  </Route>
)
