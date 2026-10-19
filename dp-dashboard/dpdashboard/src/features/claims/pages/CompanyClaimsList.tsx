import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import { Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  useCompanyClaimList,
  useProcessCompanyClaim,
  type CompanyAssignedClaim
} from '../api/useCompanyClaims'
import { getCompanyClaimColumnDefs } from '../components/ColumnDefs'

export default function CompanyClaimsList() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<CompanyAssignedClaim | null>(null)

  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved')
  const [amount, setAmount] = useState<number>(0)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data: items = [], isLoading, refetch, isRefetching } = useCompanyClaimList()
  const processMutation = useProcessCompanyClaim()

  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) =>
        i.claim_number.toLowerCase().includes(q) ||
        i.policy_number.toLowerCase().includes(q) ||
        i.customer_name.toLowerCase().includes(q)
    )
  }, [items, search])

  const handleOpenAction = (claim: CompanyAssignedClaim) => {
    setSelectedClaim(claim)
    setDecision(claim.status === 'rejected' ? 'rejected' : 'approved')
    setAmount(claim.approved_amount || claim.claimed_amount)
    setRejectionReason(claim.rejection_reason || '')
  }

  const handleSaveDecision = () => {
    if (!selectedClaim) return
    processMutation.mutate(
      {
        id: selectedClaim.id,
        status: decision,
        approved_amount: decision === 'approved' ? amount : undefined,
        rejection_reason: decision === 'rejected' ? rejectionReason : undefined
      },
      {
        onSuccess: () => {
          setSelectedClaim(null)
        }
      }
    )
  }

  const columnDefs = getCompanyClaimColumnDefs({
    t,
    onActionClick: handleOpenAction
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Header Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-zinc-100">
                {t('claims') || 'معالجة واعتماد المطالبات'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                مراجعة تقارير الحوادث، التحقق الفني، واتخاذ قرارات الصرف أو الرفض القانوني
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

      {/* 2. Filter & Search Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث برقم المطالبة، البوليصة..."
                className="w-full h-10 ps-9 pe-3.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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

      {/* Action Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>البت في مطالبة التعويض #{selectedClaim?.claim_number}</DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 space-y-1.5">
                <p><span className="text-gray-500">العميل:</span> <span className="font-bold">{selectedClaim.customer_name}</span></p>
                <p><span className="text-gray-500">رقم البوليصة:</span> <span className="font-mono font-bold">{selectedClaim.policy_number}</span></p>
                <p><span className="text-gray-500">تقرير الحادث:</span> <span className="font-bold text-indigo-600">{selectedClaim.report_number} ({selectedClaim.report_source})</span></p>
                <p className="mt-2 text-gray-700 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-200">
                  {selectedClaim.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">القرار الفني والنظامي *</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-emerald-700 font-bold">
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'approved'}
                        onChange={() => setDecision('approved')}
                      />
                      قبول وصرف التعويض
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-rose-700 font-bold">
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'rejected'}
                        onChange={() => setDecision('rejected')}
                      />
                      رفض المطالبة
                    </label>
                  </div>
                </div>

                {decision === 'approved' ? (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">مبلغ التعويض المعتمد (ر.س) *</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">السبب النظامي للرفض *</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="اذكر البند القانوني أو عدم اكتمال المستندات أو خروج الحادث عن التغطية..."
                      className="w-full h-20 p-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSaveDecision}
              className={decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
              disabled={processMutation.isPending}
            >
              اعتماد القرار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
