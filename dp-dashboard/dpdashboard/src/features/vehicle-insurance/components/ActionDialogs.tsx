import * as React from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ModalStatus } from '@/components/shared/modal-status'
import { Textarea } from '@/components/ui/textarea'
import { useDeclineRequest, useWithdrawOffer } from '../api/useVehicleInsurance'
import type { Offer } from '../types/vehicleInsurance.types'
import { offerRef } from './OfferCard'

const REASON_MAX = 500

export function DeclineDialog({
  open,
  onOpenChange,
  requestId,
  reference,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: number
  reference: string
}) {
  const { t } = useTranslation()
  const [reason, setReason] = React.useState('')
  const decline = useDeclineRequest(requestId)

  React.useEffect(() => {
    if (open) setReason('')
  }, [open])

  const submit = () =>
    decline.mutate(reason, {
      onSuccess: (res) => {
        toast.success(res.message || t('vehicleInsurance.decline.success'))
        onOpenChange(false)
      },
      // 422 business errors (already offered, closed request) are toasted globally by the axios interceptor
    })

  return (
    <ModalStatus
      open={open}
      onOpenChange={onOpenChange}
      title={t('vehicleInsurance.decline.title', { reference })}
      description={t('vehicleInsurance.decline.description')}
      agreeLabel={t('vehicleInsurance.decline.confirm')}
      cancelLabel={t('cancel')}
      onAgreeButtonClick={submit}
      onCancelButtonClick={() => onOpenChange(false)}
      loading={decline.isPending}
    >
      <label htmlFor="decline-reason" className="mb-1.5 block text-xs font-bold text-muted-foreground">
        {t('vehicleInsurance.decline.reason')}
      </label>
      <Textarea
        id="decline-reason"
        value={reason}
        maxLength={REASON_MAX}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('vehicleInsurance.decline.placeholder')}
        className="min-h-[110px] rounded-xl"
      />
      <p className="mt-1 text-end text-[11px] text-muted-foreground tabular-nums">
        {reason.length}/{REASON_MAX}
      </p>
    </ModalStatus>
  )
}

export function WithdrawDialog({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  const { t } = useTranslation()
  const withdraw = useWithdrawOffer()

  const submit = () => {
    if (!offer) return
    withdraw.mutate(offer.id, {
      onSuccess: (res) => {
        toast.success(res.message || t('vehicleInsurance.offers.withdrawn'))
        onClose()
      },
    })
  }

  return (
    <ModalStatus
      open={!!offer}
      onOpenChange={(open) => !open && onClose()}
      title={t('vehicleInsurance.offers.withdrawTitle', { reference: offer ? offerRef(offer) : '' })}
      description={t('vehicleInsurance.offers.withdrawDescription')}
      agreeLabel={t('vehicleInsurance.offers.withdraw')}
      cancelLabel={t('cancel')}
      onAgreeButtonClick={submit}
      onCancelButtonClick={onClose}
      loading={withdraw.isPending}
      size="sm"
    />
  )
}
