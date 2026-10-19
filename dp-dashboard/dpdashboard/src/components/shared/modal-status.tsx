import * as React from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { cn } from '@/utils/utils'

export interface ModalStatusProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  agreeLabel?: string
  cancelLabel?: string
  onAgreeButtonClick?: () => void
  onCancelButtonClick: () => void
  loading?: boolean
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  type?: 'default' | 'delete'
}

export function ModalStatus({
  open,
  onOpenChange,
  title,
  description,
  agreeLabel = 'Agree',
  cancelLabel = 'Cancel',
  onAgreeButtonClick,
  onCancelButtonClick,
  loading = false,
  children,
  size = 'md',
  type = 'default'
}: ModalStatusProps) {
  if (type === 'delete') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size={size || 'sm'}>
          <div className="flex flex-col items-center text-center p-4">
            {/* Trash Icon */}
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-6 border border-rose-100 shadow-sm">
              <Trash2 className="h-8 w-8" />
            </div>

            {/* Description */}
            <p className="text-sm font-semibold text-gray-600 mb-8 max-w-[280px]">
              {description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={onCancelButtonClick}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-gray-100 px-4 text-xs font-bold text-gray-750 hover:bg-gray-200 transition-all active:scale-98 cursor-pointer"
              >
                {cancelLabel}
              </button>
              {agreeLabel && onAgreeButtonClick && (
                <button
                  type="button"
                  onClick={onAgreeButtonClick}
                  disabled={loading}
                  className="flex-1 h-11 items-center justify-center rounded-xl bg-rose-500 px-4 text-xs font-bold text-white hover:bg-rose-600 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'جاري المعالجة...' : 'Processing...') : agreeLabel}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={onCancelButtonClick}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          {agreeLabel && onAgreeButtonClick && (
            <button
              type="button"
              onClick={onAgreeButtonClick}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-main px-4 text-sm font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? (isRtl ? 'جاري المعالجة...' : 'Processing...') : agreeLabel}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default ModalStatus
