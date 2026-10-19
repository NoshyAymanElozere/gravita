import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { ApiEnum, MyResponseStatus, OfferStatus, RequestStatus } from '../types/vehicleInsurance.types'

type Variant = BadgeProps['variant']

const RESPONSE_VARIANT: Record<MyResponseStatus, Variant> = {
  pending: 'info',
  viewed: 'warning',
  offered: 'success',
  declined: 'destructive',
}

const REQUEST_VARIANT: Record<RequestStatus, Variant> = {
  draft: 'secondary',
  submitted: 'info',
  offers_received: 'purple',
  cancelled: 'secondary',
  expired: 'secondary',
}

const OFFER_VARIANT: Record<OfferStatus, Variant> = {
  active: 'success',
  withdrawn: 'secondary',
  expired: 'warning',
}

function EnumBadge<T extends string>({
  value,
  variants,
  dot,
}: {
  value: ApiEnum<T> | null | undefined
  variants: Record<T, Variant>
  dot?: boolean
}) {
  if (!value) return null
  return (
    <Badge variant={variants[value.value] ?? 'outline'} dot={dot} className="whitespace-nowrap text-[11px] font-bold">
      {value.label}
    </Badge>
  )
}

export const MyResponseBadge = ({ value }: { value: ApiEnum<MyResponseStatus> | null | undefined }) => (
  <EnumBadge value={value} variants={RESPONSE_VARIANT} dot />
)

export const RequestStatusBadge = ({ value }: { value: ApiEnum<RequestStatus> | null | undefined }) => (
  <EnumBadge value={value} variants={REQUEST_VARIANT} />
)

export const OfferStatusBadge = ({ value }: { value: ApiEnum<OfferStatus> | null | undefined }) => (
  <EnumBadge value={value} variants={OFFER_VARIANT} dot />
)
