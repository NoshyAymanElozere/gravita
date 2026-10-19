import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import { Star, Trash2, BadgeCheck, ThumbsUp, Eye, EyeOff } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { RatingStars } from '@/components/shared/thumb'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Switch } from '@/components/shared/controls'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatDate, pickLang } from '@/utils/format'
import { resolveImageUrl } from '@/utils/media'
import type { Review } from '@/types/api'
import { useProductOptions } from '@/features/products/api/useProducts'
import { useDeleteReview, useModerateReview, useReviewList } from '../api/useReviews'

export default function ReviewsList() {
  const { t } = useTranslation()
  const { values, page, set } = useSearchParamsState(['isApproved', 'product'] as const)
  const { data, isLoading } = useReviewList({ page, limit: 15, isApproved: values.isApproved, product: values.product })
  const { data: products = [] } = useProductOptions()
  const moderate = useModerateReview()
  const del = useDeleteReview()
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [reading, setReading] = useState<Review | null>(null)

  const columns = useMemo<ColDef<Review>[]>(
    () => [
      {
        headerName: t('reviews.product'),
        minWidth: 180,
        cellRenderer: ({ data: r }: { data: Review }) =>
          typeof r.product === 'object' && r.product ? (
            <Link to={`/products/${r.product._id}/edit`} className="line-clamp-2 whitespace-normal text-sm font-medium leading-snug hover:underline">
              {pickLang(r.product, 'name')}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        headerName: t('reviews.author'),
        minWidth: 170,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <div className="flex h-full items-center gap-2.5">
            {r.avatar ? (
              <img src={resolveImageUrl(r.avatar)} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-xs font-bold text-brand-primary">{r.authorName?.[0] ?? '?'}</span>
            )}
            <div className="min-w-0 leading-tight">
              <p className="flex items-center gap-1 truncate text-sm font-medium">
                {r.authorName}
                {r.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label={t('reviews.verified')} />}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
            </div>
          </div>
        ),
      },
      {
        headerName: t('reviews.rating'),
        width: 110,
        flex: 0,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <div className="flex h-full items-center">
            <RatingStars value={r.rating} />
          </div>
        ),
      },
      {
        headerName: t('reviews.comment'),
        minWidth: 280,
        flex: 2.5,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <button type="button" onClick={() => setReading(r)} className="line-clamp-2 whitespace-normal text-start text-sm leading-snug hover:text-foreground/80" dir={r.lang === 'ar' ? 'rtl' : 'ltr'}>
            {r.comment}
          </button>
        ),
      },
      {
        headerName: t('reviews.helpful'),
        width: 100,
        flex: 0,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {r.helpfulCount}
          </span>
        ),
      },
      {
        headerName: t('reviews.approved'),
        width: 120,
        flex: 0,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <div className="flex h-full items-center gap-2">
            <Switch
              checked={r.isApproved}
              disabled={moderate.isPending}
              onCheckedChange={(isApproved) => moderate.mutate({ id: r._id, isApproved })}
              aria-label={t('reviews.approved')}
            />
            {r.isApproved ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        ),
      },
      {
        headerName: '',
        width: 70,
        flex: 0,
        cellRenderer: ({ data: r }: { data: Review }) => (
          <div className="flex h-full items-center">
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(r)} aria-label={t('common.delete')}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, moderate.isPending]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader icon={Star} title={t('reviews.title')} description={t('reviews.subtitle')} />

      <FilterBar>
        <Select value={values.isApproved || 'all'} onValueChange={(v) => set({ isApproved: v })}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('reviews.all')}</SelectItem>
            <SelectItem value="true">{t('reviews.visible')}</SelectItem>
            <SelectItem value="false">{t('reviews.hidden')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={values.product || 'all'} onValueChange={(v) => set({ product: v })}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('reviews.allProducts')}</SelectItem>
            {products.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {pickLang(p, 'name')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<Review>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={68}
          getRowId={(p) => p.data._id}
          getRowClass={(p) => (p.data && !p.data.isApproved ? 'bg-muted/40' : undefined)}
          defaultColDef={{ sortable: false }}
          isServerSide
          currentPage={data?.pagination.currentPage ?? page}
          totalPages={data?.pagination.totalPages ?? 1}
          totalItems={data?.pagination.totalItems}
          onPageChange={(p) => set({ page: p })}
          showColumnToggle={false}
        />
      </div>

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reading?.authorName} <RatingStars value={reading?.rating ?? 0} size="md" />
            </DialogTitle>
          </DialogHeader>
          {reading && (
            <div className="space-y-3 text-sm">
              <p dir={reading.lang === 'ar' ? 'rtl' : 'ltr'} className="whitespace-pre-line leading-relaxed">
                {reading.comment}
              </p>
              {(reading.lang === 'en' ? reading.commentAr : reading.commentEn) && (reading.lang === 'en' ? reading.commentAr : reading.commentEn) !== reading.comment && (
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">{t('reviews.translation')}</p>
                  <p dir={reading.lang === 'en' ? 'rtl' : 'ltr'}>{reading.lang === 'en' ? reading.commentAr : reading.commentEn}</p>
                </div>
              )}
              {reading.photo && <img src={resolveImageUrl(reading.photo)} alt="" className="max-h-64 rounded-xl object-cover" />}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmAction
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('reviews.deleteTitle')}
        description={t('reviews.deleteText', { name: deleting?.authorName })}
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting._id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
