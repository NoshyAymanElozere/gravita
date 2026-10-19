import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, CalendarDays, MapPin, Pencil, Trash2, ShoppingBag, Banknote, Users } from 'lucide-react'
import { PageHeader, SectionCard, EmptyState } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Skeleton } from '@/components/shared/misc'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { formatDate, formatMoney, formatNum } from '@/utils/format'
import { useOrderList } from '@/features/orders/api/useOrders'
import { OrderStatusBadge } from '@/features/orders/lib/status'
import { useCustomer, useDeleteCustomer } from '../api/useCustomers'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { ActiveBadge, RoleBadge } from './CustomersList'

export default function CustomerDetail() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useCustomer(id)
  const [page, setPage] = useState(1)
  const user = data?.user
  // The orders endpoint has no user filter — search by the customer's email
  const orders = useOrderList({ q: user?.email, page, limit: 10 }, { enabled: !!user?.email })
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const del = useDeleteCustomer()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (!user) {
    return <EmptyState icon={Users} title={t('customers.notFound')} action={<Button asChild variant="outline"><Link to="/customers">{t('customers.title')}</Link></Button>} />
  }

  const userOrders = (orders.data?.items ?? []).filter((o) => (typeof o.user === 'object' && o.user ? o.user._id === user._id : true))

  return (
    <div className="animate-fade-in">
      <PageHeader
        backTo="/customers"
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {user.name}
            <RoleBadge role={user.role} />
            <ActiveBadge active={user.isActive} />
          </span>
        }
        description={user.email}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {t('common.edit')}
            </Button>
            <Button variant="outline" className="text-rose-600 hover:text-rose-700" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t('customers.ordersCount')} value={formatNum(data.stats.ordersCount)} icon={<ShoppingBag className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <StatCard title={t('customers.totalSpent')} value={formatMoney(data.stats.totalSpent)} icon={<Banknote className="h-5 w-5 text-brand-primary dark:text-brand-sage-light" />} iconBg="bg-brand-cream dark:bg-accent" />
        <SectionCard className="sm:col-span-2" bodyClassName="p-5">
          <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${user.email}`} className="truncate hover:underline" dir="ltr">
                {user.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span dir="ltr">{user.phone || '—'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {t('customers.joinedOn', { date: formatDate(user.createdAt) })}
            </li>
          </ul>
        </SectionCard>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('customers.statsNote')}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title={t('customers.orders')} className="xl:col-span-2" bodyClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('orders.order')}</TableHead>
                <TableHead className="text-start">{t('common.status')}</TableHead>
                <TableHead className="text-end">{t('orders.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : userOrders.map((o) => (
                    <TableRow key={o._id} className="cursor-pointer" onClick={() => navigate(`/orders/${o._id}`)}>
                      <TableCell>
                        <p className="font-semibold text-foreground" dir="ltr">
                          {o.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.createdAt, true)}</p>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-end font-semibold tabular text-foreground">{formatMoney(o.total)}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!orders.isLoading && !userOrders.length && <EmptyState icon={ShoppingBag} title={t('customers.noOrders')} />}
          {(orders.data?.pagination.totalPages ?? 1) > 1 && (
            <div className="flex justify-end border-t border-border p-3">
              <Pagination page={page} totalPages={orders.data!.pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('customers.addresses')}>
          {user.addresses?.length ? (
            <ul className="space-y-3">
              {user.addresses.map((a, i) => (
                <li key={a._id ?? i} className="rounded-xl border border-border p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {a.fullName}
                    </span>
                    {a.isDefault && <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-bold text-brand-primary dark:bg-accent dark:text-accent-foreground">{t('customers.default')}</span>}
                  </div>
                  <p className="text-muted-foreground" dir="ltr">
                    {a.phone}
                  </p>
                  <p>{[a.addressLine1, a.addressLine2].filter(Boolean).join(', ')}</p>
                  <p>{[a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={MapPin} title={t('customers.noAddresses')} />
          )}
        </SectionCard>
      </div>

      <CustomerFormModal open={editOpen} onOpenChange={setEditOpen} customer={user} />
      <ConfirmAction
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('customers.deleteTitle')}
        description={t('customers.deleteText', { name: user.name })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(user._id, {
            onSuccess: () => navigate('/customers'),
            onSettled: () => setDeleteOpen(false),
          })
        }
      />
    </div>
  )
}
