import React from 'react'
import { useTranslation } from 'react-i18next'
import ModalStatus from '@/components/shared/modal-status'
import { cn } from '@/utils/utils'
import { useSupportMessageDetails } from '../../api/useSupport'

interface SupportViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: number | null
}

export function SupportViewModal({
  open,
  onOpenChange,
  messageId
}: SupportViewModalProps) {
  const { t, i18n } = useTranslation()
  const { data: item, isLoading } = useSupportMessageDetails(messageId)
  const isRtl = i18n.language === 'ar'

  return (
    <ModalStatus
      open={open}
      onOpenChange={onOpenChange}
      title={t('supportMessages') || 'Message Details'}
      cancelLabel={t('close') || 'Close'}
      onCancelButtonClick={() => onOpenChange(false)}
      size="lg"
      loading={isLoading}
    >
      {item && (
        <div className={cn("space-y-4", isRtl ? "text-right" : "text-left")} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                {t('arabicName') || 'Name'}
              </label>
              <div className="w-full h-11 px-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-start font-semibold text-foreground text-sm">
                {item.name}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                {t('email') || 'Email'}
              </label>
              <div className="w-full h-11 px-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-start font-semibold text-foreground text-sm">
                {item.email}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                {t('phoneCode') || 'Phone'}
              </label>
              <div className="w-full h-11 px-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-start font-semibold text-foreground text-sm">
                {item.phone}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                {t('status') || 'Status'}
              </label>
              <div className="h-11 flex items-center justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'read'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'read' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {item.status === 'read' ? t('read') || 'Read' : t('unread') || 'Unread'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              {t('subject') || 'Subject'}
            </label>
            <div className="w-full h-11 px-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-start font-semibold text-foreground text-sm">
              {item.subject}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              {t('message') || 'Message'}
            </label>
            <div className="w-full p-4 rounded-xl border border-border/40 bg-muted/20 font-semibold text-foreground text-sm min-h-[120px] whitespace-pre-wrap leading-relaxed text-start">
              {item.message}
            </div>
          </div>
        </div>
      )}
    </ModalStatus>
  )
}
