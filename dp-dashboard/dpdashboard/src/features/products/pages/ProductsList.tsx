import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { Package, Plus, Pencil, Trash2, X, PackagePlus, EyeOff, MoreHorizontal } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { BiName, Thumb, RatingStars } from '@/components/shared/thumb'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { SearchInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatMoney, formatNum, pickLang } from '@/utils/format'
import type { Product } from '@/types/api'
import { useCategoryOptions } from '@/features/categories/api/useCategories'
import { useDeleteProduct, useProductList, useToggleProduct } from '../api/useProducts'
import { StockBadge } from '../components/StockBadge'
import { StockDialog } from '../components/StockDialog'

const LIMIT = 15
const SORTS = ['newest', 'best-selling', 'price-low-high', 'price-high-low', 'rating'] as const

export default function ProductsList() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { values, page, set } = useSearchParamsState(['q', 'category', 'isActive', 'stock', 'sort'] as const)
  const [search, setSearch] = useState(values.q)
  const debounced = useDebounce(search)
  const [stockFor, setStockFor] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<{ product: Product; hard: boolean } | null>(null)

  useEffect(() => {
    if (debounced !== values.q) set({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { data: categories = [] } = useCategoryOptions()
  // API filter: inStock=true → stock > 0, inStock=false → out of stock.
  // "low" has no API filter, so it is applied client-side on the current page.
  const inStock = values.stock === 'in' ? 'true' : values.stock === 'out' ? 'false' : undefined
  const { data, isLoading, isFetching } = useProductList({
    page,
    limit: values.stock === 'low' ? 100 : LIMIT,
    q: values.q,
    category: values.category,
    isActive: values.isActive,
    inStock: values.stock === 'low' ? 'true' : inStock,
    sort: values.sort,
  })
  const rows = useMemo(
    () => (values.stock === 'low' ? (data?.items ?? []).filter((p) => p.stockStatus === 'low_stock') : (data?.items ?? [])),
    [data, values.stock]
  )

  const toggle = useToggleProduct()
  const del = useDeleteProduct()
  const hasFilters = !!(values.q || values.category || values.isActive || values.stock || values.sort)

  const columns = useMemo<ColDef<Product>[]>(
    () => [
      {
        headerName: t('products.product'),
        minWidth: 240,
        flex: 2,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <Link to={`/products/${p._id}/edit`} className="flex h-full items-center gap-3">
            <Thumb src={p.image} />
            <div className="min-w-0 leading-tight">
              <BiName en={p.nameEn} ar={p.nameAr} className="hover:underline" />
              <div className="mt-0.5 flex gap-1">
                {p.isBestSeller && <span className="rounded bg-amber-50 px-1 text-[9px] font-bold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{t('products.bestSeller')}</span>}
                {p.isNew && <span className="rounded bg-sky-50 px-1 text-[9px] font-bold uppercase text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">{t('products.new')}</span>}
              </div>
            </div>
          </Link>
        ),
      },
      {
        headerName: t('products.category'),
        minWidth: 130,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <span className="text-sm text-muted-foreground">{typeof p.category === 'object' && p.category ? pickLang(p.category, 'name') : '—'}</span>
        ),
      },
      {
        headerName: t('products.price'),
        minWidth: 130,
        cellRenderer: ({ data: p }: { data: Product }) =>
          p.discountPrice != null ? (
            <div className="flex h-full flex-col justify-center leading-tight">
              <span className="font-semibold text-rose-600 tabular dark:text-rose-400">{formatMoney(p.discountPrice)}</span>
              <span className="text-xs text-muted-foreground line-through tabular">{formatMoney(p.price)}</span>
            </div>
          ) : (
            <span className="font-semibold tabular">{formatMoney(p.price)}</span>
          ),
      },
      {
        headerName: t('products.stock'),
        minWidth: 150,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <button type="button" onClick={() => setStockFor(p)} className="flex h-full items-center gap-2" title={t('products.adjustStock')}>
            <span className="font-semibold tabular">{formatNum(p.stock)}</span>
            <StockBadge status={p.stockStatus} />
          </button>
        ),
      },
      {
        headerName: t('products.sold'),
        width: 90,
        flex: 0,
        cellRenderer: ({ data: p }: { data: Product }) => <span className="tabular">{formatNum(p.soldCount)}</span>,
      },
      {
        headerName: t('products.rating'),
        minWidth: 120,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <div className="flex h-full flex-col justify-center leading-tight">
            <RatingStars value={p.rating} />
            <span className="text-[11px] text-muted-foreground">
              {Number(p.rating ?? 0).toFixed(1)} · {formatNum(p.reviewCount)}
            </span>
          </div>
        ),
      },
      {
        headerName: t('common.status'),
        minWidth: 130,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <div className="flex h-full items-center">
            <StatusDropdown value={p.isActive} onChange={(isActive) => toggle.mutateAsync({ id: p._id, isActive })} />
          </div>
        ),
      },
      {
        headerName: '',
        width: 110,
        flex: 0,
        cellRenderer: ({ data: p }: { data: Product }) => (
          <div className="flex h-full items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/products/${p._id}/edit`)} aria-label={t('common.edit')}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('common.actions')}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={i18n.language === 'ar' ? 'start' : 'end'} className="w-52 rounded-xl">
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setStockFor(p)}>
                  <PackagePlus className="h-4 w-4" />
                  {t('products.adjustStock')}
                </DropdownMenuItem>
                {p.isActive && (
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setDeleting({ product: p, hard: false })}>
                    <EyeOff className="h-4 w-4" />
                    {t('products.deactivate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600" onClick={() => setDeleting({ product: p, hard: true })}>
                  <Trash2 className="h-4 w-4" />
                  {t('products.deletePermanently')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, navigate]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Package}
        title={t('products.title')}
        description={t('products.subtitle')}
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="h-4 w-4" />
              {t('products.add')}
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('products.searchPlaceholder')} />
        </div>
        <Select value={values.category || 'all'} onValueChange={(v) => set({ category: v })}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.allCategories')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {pickLang(c, 'name')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.isActive || 'all'} onValueChange={(v) => set({ isActive: v })}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
            <SelectItem value="true">{t('common.active')}</SelectItem>
            <SelectItem value="false">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={values.stock || 'all'} onValueChange={(v) => set({ stock: v })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.allStock')}</SelectItem>
            <SelectItem value="in">{t('stockStatus.in_stock')}</SelectItem>
            <SelectItem value="low">{t('stockStatus.low_stock')}</SelectItem>
            <SelectItem value="out">{t('stockStatus.out_of_stock')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={values.sort || 'newest'} onValueChange={(v) => set({ sort: v === 'newest' ? null : v })}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`products.sort.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              set({ q: null, category: null, isActive: null, stock: null, sort: null })
            }}
          >
            <X className="h-3.5 w-3.5" />
            {t('common.clearFilters')}
          </Button>
        )}
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Product>
          rowData={rows}
          columnDefs={columns}
          loading={isLoading || (isFetching && !data)}
          domLayout="autoHeight"
          height="auto"
          rowHeight={72}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data && !p.data.isActive ? 'opacity-60' : undefined)}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={values.stock === 'low' ? 1 : (data?.pagination.totalPages ?? 1)}
          totalItems={values.stock === 'low' ? rows.length : data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <StockDialog product={stockFor} onClose={() => setStockFor(null)} />

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        variant={deleting?.hard ? 'destructive' : 'warning'}
        title={deleting?.hard ? t('products.deletePermanently') : t('products.deactivate')}
        description={
          deleting?.hard
            ? t('products.hardDeleteText', { name: deleting?.product.nameEn })
            : t('products.deactivateText', { name: deleting?.product.nameEn })
        }
        confirmLabel={deleting?.hard ? t('common.delete') : t('products.deactivate')}
        loading={del.isPending}
        onConfirm={() =>
          deleting &&
          del.mutate({ id: deleting.product._id, hard: deleting.hard }, { onSettled: () => setDeleting(null) })
        }
      />
    </div>
  )
}
