import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColDef } from 'ag-grid-community'
import toast from 'react-hot-toast'
import { Mail, Download } from 'lucide-react'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { PageHeader, FilterBar } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParamsState } from '@/hooks/useSearchParamsState'
import { formatDate } from '@/utils/format'
import type { NewsletterSubscriber } from '@/types/api'
import { fetchAllSubscribers, useSubscriberList } from '../api/useNewsletter'
import { ActiveBadge } from '@/features/customers/pages/CustomersList'

const csvCell = (v: unknown) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function NewsletterList() {
  const { t } = useTranslation()
  const { values, page, set } = useSearchParamsState(['isActive'] as const)
  const { data, isLoading } = useSubscriberList({ page, limit: 20, isActive: values.isActive })
  const [exporting, setExporting] = useState(false)

  const exportCsv = async () => {
    setExporting(true)
    try {
      const rows = await fetchAllSubscribers(values.isActive)
      const lines = [['email', 'lang', 'active', 'subscribedAt'].join(','), ...rows.map((r) => [r.email, r.lang, r.isActive, r.createdAt].map(csvCell).join(','))]
      // BOM so Excel opens UTF-8 correctly
      const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('newsletter.exported', { count: rows.length }))
    } catch {
      // the interceptor already showed the error
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo<ColDef<NewsletterSubscriber>[]>(
    () => [
      {
        headerName: t('common.email'),
        minWidth: 260,
        flex: 2,
        cellRenderer: ({ data: s }: { data: NewsletterSubscriber }) => (
          <a href={`mailto:${s.email}`} className="font-medium hover:underline" dir="ltr">
            {s.email}
          </a>
        ),
      },
      {
        headerName: t('newsletter.language'),
        width: 130,
        flex: 0,
        cellRenderer: ({ data: s }: { data: NewsletterSubscriber }) => (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase">{s.lang === 'ar' ? 'العربية' : 'English'}</span>
        ),
      },
      {
        headerName: t('common.status'),
        width: 140,
        flex: 0,
        cellRenderer: ({ data: s }: { data: NewsletterSubscriber }) => (
          <div className="flex h-full items-center">
            <ActiveBadge active={s.isActive} />
          </div>
        ),
      },
      {
        headerName: t('newsletter.subscribedAt'),
        minWidth: 170,
        cellRenderer: ({ data: s }: { data: NewsletterSubscriber }) => <span className="text-muted-foreground">{formatDate(s.createdAt, true)}</span>,
      },
    ],
    [t]
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Mail}
        title={t('newsletter.title')}
        description={t('newsletter.subtitle')}
        actions={
          <Button variant="outline" onClick={exportCsv} loading={exporting} disabled={!data?.pagination.totalItems}>
            <Download className="h-4 w-4" />
            {t('newsletter.exportCsv')}
          </Button>
        }
      />

      <FilterBar>
        <Select value={values.isActive || 'all'} onValueChange={(v) => set({ isActive: v })}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
            <SelectItem value="true">{t('common.active')}</SelectItem>
            <SelectItem value="false">{t('newsletter.unsubscribed')}</SelectItem>
          </SelectContent>
        </Select>
        {data && <span className="text-sm text-muted-foreground">{t('newsletter.total', { count: data.pagination.totalItems })}</span>}
      </FilterBar>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <GenericDataGrid<NewsletterSubscriber>
          rowData={data?.items ?? []}
          columnDefs={columns}
          loading={isLoading}
          domLayout="autoHeight"
          height="auto"
          rowHeight={52}
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
    </div>
  )
}
