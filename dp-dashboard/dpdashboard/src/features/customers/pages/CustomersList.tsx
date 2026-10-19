import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { Users, Plus, Pencil, Trash2, Eye, X, ShieldCheck } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { SearchInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatDate } from '@/utils/format'
import { getInitials } from '@/utils/utils'
import type { Customer } from '@/types/api'
import { useCustomerList, useDeleteCustomer } from '../api/useCustomers'
import { CustomerFormModal } from '../components/CustomerFormModal'

export function ActiveBadge({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {t('common.active')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      {t('common.inactive')}
    </span>
  )
}

export function RoleBadge({ role }: { role: Customer['role'] }) {
  const { t } = useTranslation()
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-0.5 text-xs font-semibold text-brand-cream dark:bg-brand-sage-light dark:text-brand-primary">
      <ShieldCheck className="h-3 w-3" />
      {t('role.admin')}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{t('role.user')}</span>
  )
}

export default function CustomersList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { values, page, set } = useSearchParamsState(['q', 'role', 'isActive'] as const)
  const [search, setSearch] = useState(values.q)
  const debounced = useDebounce(search)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const del = useDeleteCustomer()

  useEffect(() => {
    if (debounced !== values.q) set({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { data, isLoading } = useCustomerList({ page, limit: 15, q: values.q, role: values.role, isActive: values.isActive })
  const hasFilters = !!(values.q || values.role || values.isActive)

  const columns = useMemo<ColDef<Customer>[]>(
    () => [
      {
        headerName: t('customers.customer'),
        minWidth: 260,
        flex: 2,
        cellRenderer: ({ data: u }: { data: Customer }) => (
          <Link to={`/customers/${u._id}`} className="flex h-full items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-cream text-xs font-bold text-brand-primary dark:bg-accent dark:text-accent-foreground">
              {getInitials(u.name) || '?'}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold hover:underline">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {u.email}
              </p>
            </div>
          </Link>
        ),
      },
      {
        headerName: t('common.phone'),
        minWidth: 140,
        cellRenderer: ({ data: u }: { data: Customer }) => <span dir="ltr">{u.phone || '—'}</span>,
      },
      {
        headerName: t('customers.role'),
        width: 120,
        flex: 0,
        cellRenderer: ({ data: u }: { data: Customer }) => (
          <div className="flex h-full items-center">
            <RoleBadge role={u.role} />
          </div>
        ),
      },
      {
        headerName: t('common.status'),
        width: 130,
        flex: 0,
        cellRenderer: ({ data: u }: { data: Customer }) => (
          <div className="flex h-full items-center">
            <ActiveBadge active={u.isActive} />
          </div>
        ),
      },
      {
        headerName: t('customers.joined'),
        minWidth: 130,
        cellRenderer: ({ data: u }: { data: Customer }) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
      },
      {
        headerName: '',
        width: 130,
        flex: 0,
        cellRenderer: ({ data: u }: { data: Customer }) => (
          <div className="flex h-full items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/customers/${u._id}`)} aria-label={t('common.view')}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditing(u)
                setFormOpen(true)
              }}
              aria-label={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(u)} aria-label={t('common.delete')}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ),
      },
    ],
    [t, navigate]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Users}
        title={t('customers.title')}
        description={t('customers.subtitle')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            {t('customers.add')}
          </Button>
        }
      />

      <FilterBar>
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('customers.searchPlaceholder')} />
        </div>
        <Select value={values.role || 'all'} onValueChange={(v) => set({ role: v })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('customers.allRoles')}</SelectItem>
            <SelectItem value="user">{t('role.user')}</SelectItem>
            <SelectItem value="admin">{t('role.admin')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={values.isActive || 'all'} onValueChange={(v) => set({ isActive: v })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
            <SelectItem value="true">{t('common.active')}</SelectItem>
            <SelectItem value="false">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              set({ q: null, role: null, isActive: null })
            }}
          >
            <X className="h-3.5 w-3.5" />
            {t('common.clearFilters')}
          </Button>
        )}
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Customer>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={60}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data && !p.data.isActive ? 'opacity-60' : undefined)}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <CustomerFormModal open={formOpen} onOpenChange={setFormOpen} customer={editing} onCreated={(id) => id && navigate(`/customers/${id}`)} />

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('customers.deleteTitle')}
        description={t('customers.deleteText', { name: deleting?.name })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
