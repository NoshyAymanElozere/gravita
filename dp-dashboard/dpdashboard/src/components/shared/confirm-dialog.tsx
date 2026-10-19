import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'

interface ConfirmActionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
  onConfirm: () => void
  loading?: boolean
  children?: React.ReactNode
}

/** Confirmation dialog for destructive / irreversible actions */
export function ConfirmAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = 'destructive',
  onConfirm,
  loading,
  children,
}: ConfirmActionProps) {
  const { t } = useTranslation()
  const Icon = variant === 'destructive' ? Trash2 : AlertTriangle
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent size="sm">
        <DialogHeader>
          <span
            className={cn(
              'mb-2 flex h-11 w-11 items-center justify-center rounded-xl',
              variant === 'destructive' && 'bg-rose-50 text-rose-600 dark:bg-rose-500/10',
              variant === 'warning' && 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
              variant === 'default' && 'bg-brand-cream text-brand-primary dark:bg-accent'
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="leading-relaxed">{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : variant === 'warning' ? 'warning' : 'default'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
