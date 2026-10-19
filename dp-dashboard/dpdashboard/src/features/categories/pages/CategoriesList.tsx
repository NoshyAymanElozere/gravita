import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { FolderTree, Plus, Pencil, Trash2 } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader } from '@/components/shared/page-header'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { BiName, Thumb } from '@/components/shared/thumb'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import type { Category } from '@/types/api'
import { useCategoryList, useCategoryProductCounts, useDeleteCategory, useToggleCategory } from '../api/useCategories'
import { CategoryFormModal } from '../components/CategoryFormModal'

export default function CategoriesList() {
  const { t } = useTranslation()
  const { page, set } = useSearchParamsState([] as const)
  const { data, isLoading } = useCategoryList({ page, limit: 20 })
  const { data: counts } = useCategoryProductCounts()
  const toggle = useToggleCategory()
  const del = useDeleteCategory()
  const [editing, setEditing] = useState<Category | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const columns = useMemo<ColDef<Category>[]>(
    () => [
      {
        headerName: t('categories.category'),
        minWidth: 260,
        flex: 2,
        cellRenderer: ({ data: c }: { data: Category }) => (
          <div className="flex h-full items-center gap-3">
            <Thumb src={c.image} />
            <BiName en={c.nameEn} ar={c.nameAr} />
          </div>
        ),
      },
      {
        headerName: t('products.slug'),
        minWidth: 150,
        cellRenderer: ({ data: c }: { data: Category }) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span>,
      },
      {
        headerName: t('categories.products'),
        width: 120,
        flex: 0,
        cellRenderer: ({ data: c }: { data: Category }) =>
          counts && c._id in counts ? (
            <Link to={`/products?category=${c._id}`} className="font-semibold tabular hover:underline">
              {counts[c._id]}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        headerName: t('common.sortOrder'),
        width: 110,
        flex: 0,
        cellRenderer: ({ data: c }: { data: Category }) => <span className="tabular">{c.sortOrder}</span>,
      },
      {
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: ({ data: c }: { data: Category }) => (
          <div className="flex h-full items-center">
            <StatusDropdown value={c.isActive} onChange={(isActive) => toggle.mutateAsync({ id: c._id, isActive })} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 100,
        flex: 0,
        cellRenderer: ({ data: c }: { data: Category }) => (
          <div className="flex h-full items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditing(c)
                setFormOpen(true)
              }}
              aria-label={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(c)} aria-label={t('common.delete')}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, counts]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={FolderTree}
        title={t('categories.title')}
        description={t('categories.subtitle')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            {t('categories.add')}
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Category>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={64}
          getRowId={(p) => p.data._id}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <CategoryFormModal open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('categories.deleteTitle')}
        description={t('categories.deleteText', { name: deleting?.nameEn })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
