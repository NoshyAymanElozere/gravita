import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import { Wallet, DollarSign, RefreshCw, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  useCompanySettlementList,
  type CompanySettlementItem
} from '../api/useCompanySettlements'
import { getCompanySettlementColumnDefs } from '../components/ColumnDefs'

export default function CompanySettlementsList() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const { data: items = [], isLoading, refetch, isRefetching } = useCompanySettlementList()

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) => i.settlement_period.toLowerCase().includes(q) || i.transfer_reference?.toLowerCase().includes(q)
    )
  }, [items, search])

  const totalTransferred = useMemo(() => items.reduce((acc, curr) => acc + curr.net_received, 0), [items])

  const handleDownload = (item: CompanySettlementItem) => {
    toast.success(`جاري تنزيل كشف المطابقة والتسوية البنكية لدورة ${item.settlement_period}...`)
  }

  const columnDefs = getCompanySettlementColumnDefs({
    t,
    onDownloadStatementClick: handleDownload
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Header Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-zinc-100">
                {t('settlements') || 'كشوف الحسابات والتسويات المالية'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                سجل التحويلات البنكية الشهرية ومطابقة العمولات المحسومة لصالح المنصة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-transparent font-bold px-4 py-2.5 rounded-xl gap-2 cursor-pointer h-10"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400">إجمالي المبالغ المودعة بحساب الشركة</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {totalTransferred.toLocaleString()} ر.س
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400">عدد دورات التسوية المكتملة</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-1">
                {items.length} دورات
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Filter & Search Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث بالدورة، رقم الحوالة..."
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table Data Box */}
      <Card className="border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-5">
          <GenericDataGrid
            rowData={filteredItems}
            columnDefs={columnDefs}
            loading={isLoading}
            height={520}
          />
        </CardContent>
      </Card>
    </div>
  )
}
