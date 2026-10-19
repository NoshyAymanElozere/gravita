import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/utils'
import type { Product } from '@/types/api'
import { useAdjustStock } from '../api/useProducts'
import { StockBadge } from './StockBadge'

/** Quick stock change: set an absolute value or add/remove units (PATCH /admin/products/:id/stock) */
export function StockDialog({ product, onClose }: { product: Pick<Product, '_id' | 'nameEn' | 'stock' | 'stockStatus'> | null; onClose: () => void }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'adjust' | 'set'>('adjust')
  const [value, setValue] = useState('')
  const mutation = useAdjustStock()

  useEffect(() => {
    setMode('adjust')
    setValue('')
  }, [product?._id])

  const n = Number(value)
  const valid = value.trim() !== '' && Number.isInteger(n) && (mode === 'set' ? n >= 0 : n !== 0)
  const preview = product ? (mode === 'set' ? n : product.stock + n) : 0
  const negative = valid && preview < 0

  const submit = () => {
    if (!product || !valid || negative) return
    mutation.mutate(mode === 'set' ? { id: product._id, stock: n } : { id: product._id, adjust: n }, { onSuccess: onClose })
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('products.adjustStock')}</DialogTitle>
          <DialogDescription className="line-clamp-2">{product?.nameEn}</DialogDescription>
        </DialogHeader>
        {product && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
              <span className="text-sm text-muted-foreground">{t('products.currentStock')}</span>
              <span className="flex items-center gap-2">
                <b className="text-lg tabular">{product.stock}</b>
                <StockBadge status={product.stockStatus} />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
              {(['adjust', 'set'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn('rounded-lg py-1.5 text-xs font-semibold', mode === m ? 'bg-card shadow-sm' : 'text-muted-foreground')}
                >
                  {t(m === 'adjust' ? 'products.addRemove' : 'products.setExact')}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock-value">{mode === 'adjust' ? t('products.unitsToAdd') : t('products.newStock')}</Label>
              <div className="flex items-center gap-2">
                {mode === 'adjust' && (
                  <Button type="button" variant="outline" size="icon" onClick={() => setValue(String((Number(value) || 0) - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <Input id="stock-value" type="number" step={1} min={mode === 'set' ? 0 : undefined} value={value} onChange={(e) => setValue(e.target.value)} className="text-center" autoFocus />
                {mode === 'adjust' && (
                  <Button type="button" variant="outline" size="icon" onClick={() => setValue(String((Number(value) || 0) + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {valid && (
                <p className={cn('text-xs', negative ? 'text-destructive' : 'text-muted-foreground')}>
                  {negative ? t('products.stockNegative') : t('products.stockAfter', { count: preview })}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={!valid || negative} loading={mutation.isPending}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
